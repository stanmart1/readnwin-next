import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bankTransferService } from '@/utils/bank-transfer-service';
import { writeFile, mkdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const bankTransferId = formData.get('bank_transfer_id');
    const file = formData.get('file') as File;

    // Validate required fields
    if (!bankTransferId || !file) {
      return NextResponse.json(
        { error: 'Bank transfer ID and file are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Check if bank transfer exists and belongs to user
    const bankTransfer = await bankTransferService.getBankTransfer(parseInt(bankTransferId as string));
    if (!bankTransfer) {
      return NextResponse.json(
        { error: 'Bank transfer not found' },
        { status: 404 }
      );
    }

    if (bankTransfer.user_id !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Bank transfer does not belong to user' },
        { status: 403 }
      );
    }

    if (bankTransfer.status !== 'pending') {
      return NextResponse.json(
        { error: 'Bank transfer is not in pending status' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist with proper error handling
    const uploadsDir = join('/uploads', 'payment-proofs');
    console.log(`📁 Ensuring payment-proofs directory exists: ${uploadsDir}`);
    
    try {
      if (!existsSync(uploadsDir)) {
        console.log(`📁 Creating payment-proofs directory: ${uploadsDir}`);
        await mkdir(uploadsDir, { recursive: true });
        
        // Verify directory was created
        if (!existsSync(uploadsDir)) {
          throw new Error(`Failed to create payment-proofs directory: ${uploadsDir}`);
        }
        console.log(`✅ Payment-proofs directory created successfully: ${uploadsDir}`);
      } else {
        console.log(`✅ Payment-proofs directory already exists: ${uploadsDir}`);
      }
      
      // Test write permissions by creating a temporary file
      const testFile = join(uploadsDir, '.test-write-permission');
      await writeFile(testFile, 'test');
      await unlink(testFile);
      console.log(`✅ Write permissions verified for: ${uploadsDir}`);
      
    } catch (error) {
      console.error(`❌ Error setting up payment-proofs directory: ${error}`);
      throw new Error(`Failed to setup payment-proofs directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `proof_${bankTransferId}_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    console.log(`📤 Converting file to buffer: ${file.name} (${file.size} bytes)`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log(`💾 Writing file to disk: ${filePath}`);
    await writeFile(filePath, buffer);
    
    // Verify file was written successfully
    if (!existsSync(filePath)) {
      throw new Error(`File was not written successfully: ${filePath}`);
    }
    
    const fileStats = await stat(filePath);
    console.log(`✅ File written successfully: ${filePath} (${fileStats.size} bytes)`);

    // Save file info to database
    const proof = await bankTransferService.uploadPaymentProof(
      parseInt(bankTransferId as string),
      file.name,
      `/uploads/payment-proofs/${fileName}`,
      file.size,
      file.type
    );

    return NextResponse.json({
      success: true,
      proof: {
        id: proof.id,
        file_name: proof.file_name,
        file_path: proof.file_path,
        upload_date: proof.upload_date
      },
      message: 'Proof of payment uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
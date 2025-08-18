import { NextRequest, NextResponse } from 'next/server';
import { fileUploadService } from '@/utils/file-upload';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (imagePath) {
      // Check if specific image exists
      const exists = await fileUploadService.checkFileExists(imagePath);
      const fullPath = fileUploadService.getFullPath(imagePath);
      
      return NextResponse.json({
        path: imagePath,
        fullPath,
        exists,
        accessible: exists
      });
    }

    // List all uploaded images using the new media root location
    const coversDir = join('/uploads', 'covers');
    const ebooksDir = join('/uploads', 'ebooks');
    const blogDir = join('/uploads', 'blog');
    const paymentProofsDir = join('/uploads', 'payment-proofs');
    
    let covers: string[] = [];
    let ebooks: string[] = [];
    let blog: string[] = [];
    let paymentProofs: string[] = [];
    
    try {
      covers = await readdir(coversDir);
    } catch (error) {
      console.log('Covers directory not found or empty');
    }
    
    try {
      ebooks = await readdir(ebooksDir);
    } catch (error) {
      console.log('Ebooks directory not found or empty');
    }

    try {
      blog = await readdir(blogDir);
    } catch (error) {
      console.log('Blog directory not found or empty');
    }

    try {
      paymentProofs = await readdir(paymentProofsDir);
    } catch (error) {
      console.log('Payment proofs directory not found or empty');
    }

    return NextResponse.json({
      covers: covers.length,
      ebooks: ebooks.length,
      blog: blog.length,
      paymentProofs: paymentProofs.length,
      coversList: covers.slice(0, 10), // Show first 10 files
      ebooksList: ebooks.slice(0, 10),
      blogList: blog.slice(0, 10),
      paymentProofsList: paymentProofs.slice(0, 10),
      uploadDirs: {
        covers: coversDir,
        ebooks: ebooksDir,
        blog: blogDir,
        paymentProofs: paymentProofsDir
      }
    });
  } catch (error) {
    console.error('Debug images error:', error);
    return NextResponse.json(
      { error: 'Failed to debug images' },
      { status: 500 }
    );
  }
} 
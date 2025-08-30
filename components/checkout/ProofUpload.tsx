'use client';

import React, { useState, useRef, useEffect } from 'react';
import { formatNaira } from '@/utils/currency';
import { PaymentIntegrationHandlers } from '@/utils/checkout-integration';

interface ProofUploadProps {
  bankTransferId: number;
  amount: number;
  transactionReference: string;
  onUploadSuccess: (proof: any) => void;
  onUploadError: (error: string) => void;
  existingProofs?: any[];
  orderId?: number;
}

export default function ProofUpload({
  bankTransferId,
  amount,
  transactionReference,
  onUploadSuccess,
  onUploadError,
  existingProofs = [],
  orderId
}: ProofUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onUploadError('File size too large. Maximum size is 5MB.');
      return;
    }

    setSelectedFile(file);

    // Create preview for images with error handling
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.onerror = () => {
        onUploadError('Failed to read file. Please try again.');
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('bank_transfer_id', bankTransferId.toString());
      formData.append('file', selectedFile);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/payment/bank-transfer/upload-proof', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        onUploadSuccess(data.proof);
        
        // Trigger integration hook for proof upload
        if (orderId) {
          try {
            await PaymentIntegrationHandlers.bank_transfer.onProofUploaded(orderId, bankTransferId);
          } catch (integrationError) {
            console.warn('Integration hook failed:', integrationError);
          }
        }
        
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        onUploadError(errorData.error || `Upload failed (${response.status})`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        onUploadError('Network error. Please check your connection and try again.');
      } else {
        onUploadError('Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    // Revoke object URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Proof of Payment</h2>
        


        {/* Upload Area */}
        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!selectedFile ? (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="ri-upload-line text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Proof of Payment
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your payment receipt here, or click to browse
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPEG, PNG, GIF, PDF (max 5MB)
                </p>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-2xl text-green-600"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  File Selected
                </h3>
                <p className="text-gray-600 mb-4">{selectedFile.name}</p>
                
                {/* File Preview */}
                {previewUrl && (
                  <div className="mb-4">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-48 mx-auto rounded-lg border"
                    />
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Proof'}
                  </button>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Uploaded Proofs */}
        {existingProofs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Proofs</h3>
            <div className="space-y-3">
              {existingProofs.map((proof, index) => (
                <div key={proof.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <i className="ri-file-text-line text-blue-600"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{proof.file_name}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded on {new Date(proof.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      proof.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {proof.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Instructions:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Complete your bank transfer to the provided account</li>
            <li>• Use the transaction reference as payment description</li>
            <li>• Upload a screenshot or photo of your payment receipt</li>
            <li>• Your payment will be verified within 24 hours</li>
            <li>• Digital books will be available after verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
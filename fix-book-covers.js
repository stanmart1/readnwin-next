#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixBookCovers() {
  console.log('🔧 Fixing book cover image issues...\n');
  
  // 1. Ensure all required directories exist
  console.log('1. Creating required directories...');
  const requiredDirs = [
    'public/uploads',
    'public/uploads/covers',
    'public/uploads/books',
    'uploads',
    'uploads/covers',
    'uploads/books'
  ];
  
  requiredDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created ${dir}`);
    } else {
      console.log(`✅ ${dir} already exists`);
    }
  });
  console.log('');
  
  // 2. Create a better placeholder image if needed
  console.log('2. Ensuring placeholder image exists...');
  const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-book.jpg');
  if (!fs.existsSync(placeholderPath)) {
    // Create an SVG placeholder that can be used as fallback
    const placeholderSvg = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#grad1)" stroke="#d1d5db" stroke-width="2"/>
  <circle cx="150" cy="150" r="30" fill="#9ca3af"/>
  <rect x="100" y="200" width="100" height="8" fill="#d1d5db" rx="4"/>
  <rect x="80" y="220" width="140" height="6" fill="#e5e7eb" rx="3"/>
  <rect x="90" y="240" width="120" height="6" fill="#e5e7eb" rx="3"/>
  <text x="150" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">Book Cover</text>
  <text x="150" y="340" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">Not Available</text>
</svg>`;
    
    const svgPath = path.join(process.cwd(), 'public', 'placeholder-book.svg');
    fs.writeFileSync(svgPath, placeholderSvg);
    console.log('✅ Created placeholder SVG');
  } else {
    console.log('✅ Placeholder image already exists');
  }
  console.log('');
  
  // 3. Create a test API endpoint to verify file serving
  console.log('3. Creating test endpoint for file serving...');
  const testApiDir = path.join(process.cwd(), 'app', 'api', 'test-uploads');
  if (!fs.existsSync(testApiDir)) {
    fs.mkdirSync(testApiDir, { recursive: true });
  }
  
  const testApiContent = `import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const uploadDirs = [
      { name: 'public/uploads/covers', path: join(process.cwd(), 'public', 'uploads', 'covers') },
      { name: 'uploads/covers', path: join(process.cwd(), 'uploads', 'covers') },
    ];
    
    const results = uploadDirs.map(dir => {
      if (existsSync(dir.path)) {
        const files = readdirSync(dir.path);
        return {
          directory: dir.name,
          exists: true,
          fileCount: files.length,
          files: files.slice(0, 5) // Show first 5 files
        };
      } else {
        return {
          directory: dir.name,
          exists: false,
          fileCount: 0,
          files: []
        };
      }
    });
    
    return NextResponse.json({
      success: true,
      directories: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}`;
  
  fs.writeFileSync(path.join(testApiDir, 'route.ts'), testApiContent);
  console.log('✅ Created test API endpoint at /api/test-uploads');
  console.log('');
  
  // 4. Create a debug component for testing cover images
  console.log('4. Creating debug component...');
  const debugComponentContent = `'use client';

import { useState, useEffect } from 'react';

export default function CoverImageDebug() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const testImagePaths = [
    '/placeholder-book.jpg',
    '/placeholder-book.svg',
    '/uploads/covers/test-cover.svg',
    '/api/uploads/covers/test-cover.svg'
  ];
  
  const runTests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-uploads');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    runTests();
  }, []);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Cover Image Debug</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {testImagePaths.map((path, index) => (
            <div key={index} className="border rounded p-2">
              <img 
                src={path} 
                alt={\`Test \${index + 1}\`}
                className="w-full h-32 object-cover mb-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'block';
                }}
              />
              <div style={{display: 'none'}} className="text-red-500 text-sm">
                Failed to load
              </div>
              <p className="text-xs text-gray-600 truncate">{path}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <button 
          onClick={runTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </button>
      </div>
      
      {testResults && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Test Results</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}`;
  
  const debugComponentDir = path.join(process.cwd(), 'components', 'debug');
  if (!fs.existsSync(debugComponentDir)) {
    fs.mkdirSync(debugComponentDir, { recursive: true });
  }
  fs.writeFileSync(path.join(debugComponentDir, 'CoverImageDebug.tsx'), debugComponentContent);
  console.log('✅ Created debug component at components/debug/CoverImageDebug.tsx');
  console.log('');
  
  console.log('🎉 Book cover fix completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Test the debug endpoint: http://localhost:3000/api/test-uploads');
  console.log('3. Try uploading a book with cover image through admin panel');
  console.log('4. Check the debug component by importing it in a page');
  console.log('5. Verify cover images are displayed correctly');
}

fixBookCovers();
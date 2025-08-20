'use client';

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
                alt={`Test ${index + 1}`}
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
}
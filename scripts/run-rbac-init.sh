#!/bin/bash

# RBAC System Initialization Script
echo "🚀 Starting RBAC System Initialization..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js to run this script."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm to run this script."
    exit 1
fi

# Set environment variables for production
export NODE_ENV=production

# Run the RBAC initialization
echo "📋 Initializing RBAC tables and permissions..."
node scripts/init-rbac-system.js

if [ $? -eq 0 ]; then
    echo "✅ RBAC initialization completed successfully!"
    
    # Run verification
    echo "🔍 Running RBAC verification..."
    node scripts/verify-rbac-system.js
    
    if [ $? -eq 0 ]; then
        echo "🎉 RBAC system is fully functional!"
    else
        echo "⚠️  RBAC verification found issues. Please check the output above."
    fi
else
    echo "❌ RBAC initialization failed. Please check the error messages above."
    exit 1
fi
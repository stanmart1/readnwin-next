#!/bin/bash

# Node.js Version Setup Script for ReadnWin Next.js Application
# This script ensures the correct Node.js version (20.18.1) is being used

set -e

REQUIRED_VERSION="20.18.1"
NVMRC_FILE=".nvmrc"

echo "🚀 Setting up Node.js version for ReadnWin Next.js Application"
echo "=============================================================="

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "❌ nvm is not installed or not in PATH"
    echo "📋 Please install nvm first:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   Then restart your terminal and run this script again"
    exit 1
fi

echo "✅ nvm is available"

# Check if .nvmrc exists
if [ ! -f "$NVMRC_FILE" ]; then
    echo "❌ .nvmrc file not found"
    echo "📝 Creating .nvmrc with version $REQUIRED_VERSION"
    echo "$REQUIRED_VERSION" > "$NVMRC_FILE"
else
    echo "✅ .nvmrc file exists"
fi

# Read version from .nvmrc
NVMRC_VERSION=$(cat "$NVMRC_FILE")
echo "📋 Required version from .nvmrc: $NVMRC_VERSION"

# Check if the required version is installed
if ! nvm list | grep -q "$NVMRC_VERSION"; then
    echo "📦 Installing Node.js version $NVMRC_VERSION..."
    nvm install "$NVMRC_VERSION"
else
    echo "✅ Node.js version $NVMRC_VERSION is already installed"
fi

# Use the required version
echo "🔄 Switching to Node.js version $NVMRC_VERSION..."
nvm use "$NVMRC_VERSION"

# Verify the version
CURRENT_VERSION=$(node --version)
echo "✅ Current Node.js version: $CURRENT_VERSION"

# Run the verification script
echo "🔍 Running version verification..."
node scripts/verify-node-version.js

echo ""
echo "🎉 Node.js setup complete!"
echo "💡 To use this version in new terminal sessions, run: nvm use"
echo "💡 To set as default: nvm alias default $NVMRC_VERSION"
#!/bin/bash

echo "🔧 Fixing chunk loading issues..."

# Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache

# Find and use the correct npm/node path
if [ -f ~/.nvm/versions/node/v20.18.1/bin/npm ]; then
    NPM_PATH=~/.nvm/versions/node/v20.18.1/bin/npm
    NODE_PATH=~/.nvm/versions/node/v20.18.1/bin/node
elif [ -f /usr/local/bin/npm ]; then
    NPM_PATH=/usr/local/bin/npm
    NODE_PATH=/usr/local/bin/node
elif [ -f /opt/homebrew/bin/npm ]; then
    NPM_PATH=/opt/homebrew/bin/npm
    NODE_PATH=/opt/homebrew/bin/node
else
    echo "❌ npm not found. Please install Node.js and npm."
    exit 1
fi

echo "📦 Using npm at: $NPM_PATH"

# Set up environment
export PATH="$(dirname $NODE_PATH):$PATH"

# Install dependencies
echo "📥 Installing dependencies..."
$NPM_PATH install

# Build the project
echo "🏗️ Building project..."
$NPM_PATH run build

echo "✅ Chunk loading issue should be resolved!"
echo "🚀 You can now run: npm run dev"
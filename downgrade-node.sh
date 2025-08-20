#!/bin/bash

echo "🔄 Downgrading Node.js to 20.18.1..."

# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node.js 20.18.1
nvm install 20.18.1
nvm use 20.18.1

# Verify version
echo "✅ Current Node.js version: $(node --version)"

# Run verification
node scripts/verify-node-version.js
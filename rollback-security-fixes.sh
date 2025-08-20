#!/bin/bash
# Rollback Security Fixes

echo "🔄 Rolling back security fixes..."
echo "================================"

# Check if backups exist
if [ ! -f "package.json.backup" ] || [ ! -f "package-lock.json.backup" ]; then
    echo "❌ Backup files not found. Cannot rollback safely."
    exit 1
fi

echo "⚠️  This will restore the previous package.json and package-lock.json"
read -p "Continue with rollback? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled."
    exit 1
fi

# Restore backups
echo "📦 Restoring package files..."
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# Clean install
echo "🧹 Cleaning and reinstalling dependencies..."
rm -rf node_modules
npm install

echo "✅ Rollback complete. Application restored to previous state."
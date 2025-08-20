#!/bin/bash
# Security Fix Phase 1: Safe Updates (No Breaking Changes)

echo "🔒 Security Fix Phase 1: Safe Updates"
echo "======================================"

# Backup current package-lock.json
echo "📦 Creating backup..."
cp package-lock.json package-lock.json.backup
cp package.json package.json.backup

# Update safe dependencies
echo "🔄 Updating safe dependencies..."

# Update jszip to latest (fixes prototype pollution)
npm install jszip@latest

# Update mime to latest (fixes ReDoS)
npm install mime@latest

# Replace xmldom with maintained fork
echo "🔄 Replacing xmldom with @xmldom/xmldom..."
npm uninstall xmldom @types/xmldom
npm install @xmldom/xmldom

# Run audit to check improvements
echo "🔍 Checking security improvements..."
npm audit --audit-level=high

echo "✅ Phase 1 complete. Test the application before proceeding to Phase 2."
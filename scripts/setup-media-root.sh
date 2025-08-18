#!/bin/bash

# Media Root Setup Script for ReadNWin Application
# This script sets up the /app/media_root directory structure on the remote server

set -e  # Exit on any error

echo "🚀 Setting up Media Root Directory for ReadNWin"
echo "================================================"

# Configuration
MEDIA_ROOT="/app/media_root"
SUBDIRECTORIES=("covers" "ebooks" "blog" "payment-proofs" "about-images")

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  This script should be run with sudo or as root"
    echo "💡 Run: sudo $0"
    exit 1
fi

echo "📁 Creating media root directory: $MEDIA_ROOT"

# Create main media root directory
if [ ! -d "$MEDIA_ROOT" ]; then
    mkdir -p "$MEDIA_ROOT"
    echo "✅ Created media root directory"
else
    echo "✅ Media root directory already exists"
fi

# Create subdirectories
echo "📁 Creating subdirectories..."
for subdir in "${SUBDIRECTORIES[@]}"; do
    subdir_path="$MEDIA_ROOT/$subdir"
    if [ ! -d "$subdir_path" ]; then
        mkdir -p "$subdir_path"
        echo "  ✅ Created: $subdir/"
    else
        echo "  ✅ Exists: $subdir/"
    fi
done

# Set proper permissions
echo "🔐 Setting permissions..."

# Find the application user (common patterns)
APP_USER=""
if id "node" &>/dev/null; then
    APP_USER="node"
elif id "www-data" &>/dev/null; then
    APP_USER="www-data"
elif id "nginx" &>/dev/null; then
    APP_USER="nginx"
elif id "apache" &>/dev/null; then
    APP_USER="apache"
else
    echo "⚠️  Could not determine application user"
    echo "💡 Please manually set permissions for your application user"
    echo "💡 Example: chown -R your-app-user:your-app-group $MEDIA_ROOT"
fi

if [ -n "$APP_USER" ]; then
    echo "👤 Setting ownership to user: $APP_USER"
    chown -R "$APP_USER:$APP_USER" "$MEDIA_ROOT"
    
    echo "🔐 Setting directory permissions"
    chmod -R 755 "$MEDIA_ROOT"
    
    # Make sure subdirectories are writable
    for subdir in "${SUBDIRECTORIES[@]}"; do
        subdir_path="$MEDIA_ROOT/$subdir"
        chmod 775 "$subdir_path"
        echo "  ✅ Set permissions for: $subdir/"
    done
fi

# Create a test file to verify permissions
echo "🧪 Testing write permissions..."
TEST_FILE="$MEDIA_ROOT/test-write-permission.txt"
if [ -n "$APP_USER" ]; then
    sudo -u "$APP_USER" touch "$TEST_FILE" 2>/dev/null && {
        echo "✅ Write permission test passed"
        rm -f "$TEST_FILE"
    } || {
        echo "❌ Write permission test failed"
        echo "💡 Please check permissions manually"
    }
else
    echo "⚠️  Skipping write permission test (no app user detected)"
fi

# Display final directory structure
echo ""
echo "📋 Final Directory Structure:"
echo "=============================="
tree "$MEDIA_ROOT" 2>/dev/null || ls -la "$MEDIA_ROOT"

echo ""
echo "🔧 Permissions Summary:"
echo "======================="
ls -ld "$MEDIA_ROOT"
for subdir in "${SUBDIRECTORIES[@]}"; do
    subdir_path="$MEDIA_ROOT/$subdir"
    ls -ld "$subdir_path"
done

echo ""
echo "✅ Media Root Setup Complete!"
echo "=============================="
echo "📁 Media root: $MEDIA_ROOT"
echo "👤 Owner: $APP_USER (if detected)"
echo "🔐 Permissions: 755 (directories), 775 (subdirectories)"
echo ""
echo "💡 Next Steps:"
echo "1. Restart your application server"
echo "2. Test file uploads through the admin interface"
echo "3. Monitor application logs for any permission issues"
echo "4. Consider setting up log rotation for uploaded files"
echo ""
echo "🔍 Troubleshooting:"
echo "- If uploads fail, check application logs"
echo "- Verify the application user has write permissions"
echo "- Ensure the directory is accessible to your web server"
echo "- Check SELinux/AppArmor if applicable" 
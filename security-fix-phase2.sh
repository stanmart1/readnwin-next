#!/bin/bash
# Security Fix Phase 2: Dependency Replacements

echo "🔒 Security Fix Phase 2: Dependency Replacements"
echo "================================================"

# Remove vulnerable epub-parser
echo "🗑️ Removing vulnerable epub-parser..."
npm uninstall epub-parser

# Verify epub2 is available (should already be installed)
echo "✅ Verifying epub2 availability..."
npm list epub2

echo "📝 Manual steps required:"
echo "1. Update lib/services/EpubProcessingService.ts to use epub2 instead of epub-parser"
echo "2. Update lib/services/HtmlProcessingService.ts to use @xmldom/xmldom"
echo "3. Test EPUB processing functionality"

echo "✅ Phase 2 dependency changes complete."
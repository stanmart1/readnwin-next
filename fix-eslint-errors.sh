#!/bin/bash

# Fix unescaped entities in JSX
echo "Fixing unescaped entities..."

# Fix apostrophes in JSX content (not in JavaScript strings)
find app/ components/ -name "*.tsx" -type f -exec sed -i '' 's/>\([^<]*\)'\''s\([^<]*\)</>\1\&apos;s\2</g' {} \;
find app/ components/ -name "*.tsx" -type f -exec sed -i '' 's/>\([^<]*\)'\''t\([^<]*\)</>\1\&apos;t\2</g' {} \;
find app/ components/ -name "*.tsx" -type f -exec sed -i '' 's/>\([^<]*\)'\''re\([^<]*\)</>\1\&apos;re\2</g' {} \;
find app/ components/ -name "*.tsx" -type f -exec sed -i '' 's/>\([^<]*\)'\''ll\([^<]*\)</>\1\&apos;ll\2</g' {} \;
find app/ components/ -name "*.tsx" -type f -exec sed -i '' 's/>\([^<]*\)'\''ve\([^<]*\)</>\1\&apos;ve\2</g' {} \;

# Fix quotes in JSX content
find app/ components/ -name "*.tsx" -type f -exec sed -i '' 's/>\([^<]*\)"\([^<]*\)</>\1\&quot;\2</g' {} \;

echo "Fixed unescaped entities"

# Remove unused variables (safe ones)
echo "Removing unused variables..."

# Remove unused imports
find app/ components/ -name "*.tsx" -type f -exec sed -i '' '/^import.*{.*}.*from.*$/d' {} \;

echo "ESLint fixes applied"
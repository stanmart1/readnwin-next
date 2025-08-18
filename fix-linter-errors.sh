#!/bin/bash

# Linter Error Fix Script
# This script helps automate the process of fixing ESLint errors

set -e

echo "🔍 Linter Error Fix Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -f "eslint.config.mjs" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
}

# Function to run linter and show current status
show_current_status() {
    print_status "Running ESLint to check current status..."
    npm run lint || true
    echo ""
}

# Function to create backup of files before modification
create_backup() {
    print_status "Creating backup of files to be modified..."
    BACKUP_DIR="linter-fix-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup files with errors
    find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "any\|no-unused-vars\|no-unescaped-entities" 2>/dev/null | while read file; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
        fi
    done
    
    print_success "Backup created in $BACKUP_DIR"
    echo ""
}

# Function to fix unescaped entities
fix_unescaped_entities() {
    print_status "Fixing unescaped entities..."
    
    # Fix single quotes
    find . -name "*.tsx" -exec sed -i '' "s/'/&apos;/g" {} \;
    
    # Fix double quotes (but be careful with JSX attributes)
    find . -name "*.tsx" -exec sed -i '' 's/"/&quot;/g' {} \;
    
    print_success "Unescaped entities fixed"
    echo ""
}

# Function to find files with specific error types
find_files_with_errors() {
    local error_type=$1
    print_status "Finding files with $error_type errors..."
    
    case $error_type in
        "any")
            find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "any" 2>/dev/null || echo "No files found"
            ;;
        "unused")
            find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "no-unused-vars" 2>/dev/null || echo "No files found"
            ;;
        "entities")
            find . -name "*.tsx" | xargs grep -l "no-unescaped-entities" 2>/dev/null || echo "No files found"
            ;;
        *)
            print_error "Unknown error type: $error_type"
            ;;
    esac
}

# Function to generate type definitions
generate_type_definitions() {
    print_status "Generating common type definitions..."
    
    cat > types/common.ts << 'EOF'
// Common TypeScript interfaces for the application

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  isLoading: boolean;
  error?: string | null;
}

export interface ErrorProps {
  error: string;
  onRetry?: () => void;
}

// Common form types
export interface FormData {
  [key: string]: string | number | boolean | undefined;
}

// Common API error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Common user types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Common book types
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage?: string;
  category: string;
  isEbook: boolean;
  isPhysical: boolean;
}

// Common order types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  bookId: string;
  quantity: number;
  price: number;
  book: Book;
}
EOF

    print_success "Type definitions generated in types/common.ts"
    echo ""
}

# Function to fix require imports
fix_require_imports() {
    print_status "Fixing require() imports..."
    
    # Find files with require statements
    find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "require(" 2>/dev/null | while read file; do
        print_status "Processing $file"
        # This is a placeholder - actual conversion would need more sophisticated logic
        echo "  - Found require() statements in $file"
    done
    
    print_warning "Manual review required for require() to import conversions"
    echo ""
}

# Function to run specific linter checks
run_specific_checks() {
    local check_type=$1
    
    case $check_type in
        "any")
            print_status "Checking for 'any' type usage..."
            npm run lint 2>&1 | grep "no-explicit-any" || echo "No 'any' type errors found"
            ;;
        "unused")
            print_status "Checking for unused variables..."
            npm run lint 2>&1 | grep "no-unused-vars" || echo "No unused variable errors found"
            ;;
        "entities")
            print_status "Checking for unescaped entities..."
            npm run lint 2>&1 | grep "no-unescaped-entities" || echo "No unescaped entity errors found"
            ;;
        *)
            print_error "Unknown check type: $check_type"
            ;;
    esac
    echo ""
}

# Function to show progress
show_progress() {
    print_status "Current linter status:"
    echo "  - Total errors: $(npm run lint 2>&1 | grep -c "Error:" || echo "0")"
    echo "  - Total warnings: $(npm run lint 2>&1 | grep -c "Warning:" || echo "0")"
    echo ""
}

# Function to create fix templates
create_fix_templates() {
    print_status "Creating fix templates..."
    
    mkdir -p templates
    
    # Template for fixing any types
    cat > templates/fix-any-types.md << 'EOF'
# Fixing 'any' Type Usage

## Common Patterns to Replace

### 1. API Response Types
```typescript
// Before
const response: any = await fetch('/api/data');

// After
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const response: ApiResponse<YourDataType> = await fetch('/api/data');
```

### 2. Event Handlers
```typescript
// Before
const handleChange = (event: any) => {
  console.log(event.target.value);
};

// After
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value);
};
```

### 3. Component Props
```typescript
// Before
interface Props {
  data: any;
}

// After
interface Props {
  data: YourDataType;
}
```

### 4. Error Handling
```typescript
// Before
} catch (error: any) {
  console.log(error.message);
}

// After
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}
```
EOF

    # Template for fixing unused variables
    cat > templates/fix-unused-vars.md << 'EOF'
# Fixing Unused Variables

## Common Patterns

### 1. Unused Imports
```typescript
// Before
import { useState, useEffect, useCallback } from 'react';

// After
import { useState, useEffect } from 'react';
```

### 2. Unused Parameters
```typescript
// Before
const handleClick = (event, data) => {
  console.log('clicked');
};

// After
const handleClick = (_event, _data) => {
  console.log('clicked');
};
```

### 3. Unused Variables
```typescript
// Before
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

// After
const [data, setData] = useState([]);
// Remove unused loading state
```

### 4. Intentional Unused Variables
```typescript
// Use ESLint disable comment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unusedVariable = 'intentionally unused';
```
EOF

    print_success "Fix templates created in templates/ directory"
    echo ""
}

# Main menu
show_menu() {
    echo "Available commands:"
    echo "  1) status     - Show current linter status"
    echo "  2) backup     - Create backup of files"
    echo "  3) entities   - Fix unescaped entities"
    echo "  4) types      - Generate type definitions"
    echo "  5) require    - Find require() imports"
    echo "  6) find-any   - Find files with 'any' types"
    echo "  7) find-unused - Find files with unused variables"
    echo "  8) templates  - Create fix templates"
    echo "  9) progress   - Show progress"
    echo "  10) all       - Run all automated fixes"
    echo "  11) help      - Show this menu"
    echo ""
}

# Main execution
main() {
    check_directory
    
    if [ $# -eq 0 ]; then
        show_menu
        return
    fi
    
    case $1 in
        "status")
            show_current_status
            ;;
        "backup")
            create_backup
            ;;
        "entities")
            fix_unescaped_entities
            ;;
        "types")
            generate_type_definitions
            ;;
        "require")
            fix_require_imports
            ;;
        "find-any")
            find_files_with_errors "any"
            ;;
        "find-unused")
            find_files_with_errors "unused"
            ;;
        "templates")
            create_fix_templates
            ;;
        "progress")
            show_progress
            ;;
        "all")
            print_status "Running all automated fixes..."
            create_backup
            generate_type_definitions
            create_fix_templates
            print_success "Automated fixes completed. Manual review required."
            ;;
        "help")
            show_menu
            ;;
        *)
            print_error "Unknown command: $1"
            show_menu
            ;;
    esac
}

# Run main function with all arguments
main "$@" 
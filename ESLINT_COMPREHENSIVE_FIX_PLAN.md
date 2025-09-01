# ESLint Comprehensive Fix Plan

## Current Status: BUILD FAILING ❌

The build is still failing due to ESLint errors being treated as build failures.

## Critical Errors (Build Blockers)

### 1. Unescaped Entities (ERROR level) - REMAINING
**Files with issues:**
- `app/faq/page.tsx` - 2 instances
- `app/payment/bank-transfer/success/page.tsx` - 2 instances  
- `app/privacy/page.tsx` - Multiple instances
- `app/terms/page.tsx` - Multiple instances
- `components/ui/DashboardErrorBoundary.tsx` - Multiple instances

### 2. Require Import Errors (ERROR level)
**Files with issues:**
- Multiple files using `require()` instead of ES6 imports

## Immediate Action Plan

### Phase 1: Fix Critical Errors (Build Blockers)
1. **Fix remaining unescaped entities** - Replace all `'` with `\'` or use double quotes
2. **Fix require() imports** - Convert to ES6 import statements
3. **Verify build passes**

### Phase 2: Fix High Priority Warnings  
1. **Remove unused variables** - ~47 instances
2. **Fix useEffect dependencies** - ~8 instances
3. **Replace img with Image components** - ~12 instances

### Phase 3: Type Safety Improvements
1. **Replace any types** - ~25 instances
2. **Add proper type definitions**

## Implementation Strategy

### Option A: Quick Fix (Recommended)
- Temporarily disable error-level rules in ESLint config
- Fix issues incrementally
- Re-enable rules once fixed

### Option B: Fix All Issues
- Fix all critical errors first
- Then address warnings systematically

## Files Requiring Immediate Attention

1. `app/faq/page.tsx` - Unescaped apostrophes
2. `app/payment/bank-transfer/success/page.tsx` - Unescaped apostrophes
3. `app/privacy/page.tsx` - Multiple unescaped entities
4. `app/terms/page.tsx` - Multiple unescaped entities
5. `components/ui/DashboardErrorBoundary.tsx` - Unescaped entities
6. Files with require() imports - Convert to ES6 imports

## Next Steps

1. Fix remaining unescaped entities in the 5 files listed above
2. Fix require() import errors
3. Run build to verify success
4. Address warnings incrementally
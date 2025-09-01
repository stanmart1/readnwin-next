# ESLint Error Resolution Plan

## Current Status: BUILD FAILING ❌

The build fails due to ESLint errors (not warnings). The `react/no-unescaped-entities` rule is set to "error" level.

## Critical Errors (Build Blockers)

### 1. Unescaped Entities (ERROR level)
- **Files affected**: Multiple components
- **Issue**: Using quotes and apostrophes without proper escaping
- **Fix**: Replace `"` with `&quot;` and `'` with `&apos;`

## All ESLint Issues by Category

### A. Critical Errors (Must Fix)
1. **react/no-unescaped-entities**: ~15 instances

### B. Warnings (Should Fix)
1. **@typescript-eslint/no-unused-vars**: ~47 instances
2. **@typescript-eslint/no-explicit-any**: ~25 instances  
3. **@next/next/no-img-element**: ~12 instances
4. **react-hooks/exhaustive-deps**: ~8 instances

## Fix Strategy

### Phase 1: Critical Errors (Build Blockers)
1. Fix all unescaped entities
2. Verify build passes

### Phase 2: High Priority Warnings
1. Remove unused variables
2. Fix useEffect dependencies
3. Replace img with Image components

### Phase 3: Type Safety
1. Replace any types with proper interfaces
2. Add proper type definitions

## Implementation Order

1. **Immediate**: Fix unescaped entities
2. **Next**: Remove unused variables (safe)
3. **Then**: Fix useEffect dependencies
4. **Finally**: Type improvements and image optimization
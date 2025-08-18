# Quick Fix Reference Card

## 🚨 Critical Errors (Fix First)

### 1. `@typescript-eslint/no-explicit-any`

#### API Response Types
```typescript
// ❌ Before
const response: any = await fetch('/api/data');

// ✅ After
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
const response: ApiResponse<YourDataType> = await fetch('/api/data');
```

#### Event Handlers
```typescript
// ❌ Before
const handleChange = (event: any) => {
  console.log(event.target.value);
};

// ✅ After
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value);
};
```

#### Component Props
```typescript
// ❌ Before
interface Props {
  data: any;
}

// ✅ After
interface Props {
  data: YourDataType;
}
```

#### Error Handling
```typescript
// ❌ Before
} catch (error: any) {
  console.log(error.message);
}

// ✅ After
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}
```

### 2. `react/no-unescaped-entities`

```jsx
// ❌ Before
<p>Don't forget to check your email</p>
<p>"Important" message</p>

// ✅ After
<p>Don&apos;t forget to check your email</p>
<p>&quot;Important&quot; message</p>
```

### 3. `@typescript-eslint/no-require-imports`

```typescript
// ❌ Before
const stripe = require('stripe');

// ✅ After
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

## ⚠️ Important Warnings (Fix Next)

### 1. `@typescript-eslint/no-unused-vars`

#### Unused Imports
```typescript
// ❌ Before
import { useState, useEffect, useCallback } from 'react';

// ✅ After
import { useState, useEffect } from 'react';
```

#### Unused Parameters
```typescript
// ❌ Before
const handleClick = (event, data) => {
  console.log('clicked');
};

// ✅ After
const handleClick = (_event, _data) => {
  console.log('clicked');
};
```

#### Unused Variables
```typescript
// ❌ Before
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false); // unused

// ✅ After
const [data, setData] = useState([]);
// Remove unused loading state
```

#### Intentional Unused Variables
```typescript
// ✅ Use ESLint disable comment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unusedVariable = 'intentionally unused';
```

### 2. `react-hooks/exhaustive-deps`

```typescript
// ❌ Before
useEffect(() => {
  fetchData();
}, []); // Missing dependency

// ✅ After
useEffect(() => {
  fetchData();
}, [fetchData]); // Add missing dependency

// Or use useCallback
const fetchData = useCallback(() => {
  // fetch logic
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 3. `@next/next/no-img-element`

```jsx
// ❌ Before
<img src="/image.jpg" alt="Description" />

// ✅ After
import Image from 'next/image';

<Image 
  src="/image.jpg" 
  alt="Description"
  width={300}
  height={200}
/>
```

## 🔧 Common Type Definitions

### API Types
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Component Props
```typescript
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

interface LoadingProps {
  isLoading: boolean;
  error?: string | null;
}
```

### Form Types
```typescript
interface FormData {
  [key: string]: string | number | boolean | undefined;
}

interface FormErrors {
  [key: string]: string;
}
```

## 📋 Priority Files to Fix

### High Priority (Fix Today)
1. `app/admin/ShippingManagement.tsx` - 2 any types
2. `app/admin/SystemSettings.tsx` - 1 any type
3. `app/admin/UserManagement.tsx` - 1 any type
4. `app/api/admin/analytics/route.ts` - 1 any type
5. `app/api/admin/authors/route.ts` - 1 any type

### Medium Priority (Fix This Week)
1. `app/blog/[slug]/page.tsx` - 1 any type + unescaped entities
2. `app/blog/page.tsx` - 3 any types + unescaped entities
3. `app/book/[id]/page.tsx` - 2 any types + unescaped entities
4. `app/checkout-enhanced/page.tsx` - 3 any types
5. `app/contact/page.tsx` - 6 any types + unescaped entities

## 🛠️ Quick Commands

```bash
# Check current status
npm run lint

# Create backup
./fix-linter-errors.sh backup

# Generate type definitions
./fix-linter-errors.sh types

# Find files with specific errors
./fix-linter-errors.sh find-any
./fix-linter-errors.sh find-unused

# Create fix templates
./fix-linter-errors.sh templates
```

## 🎯 Success Checklist

- [ ] 0 critical errors
- [ ] <50 warnings (intentional exceptions)
- [ ] All TypeScript compilation passes
- [ ] No breaking changes to functionality
- [ ] All tests pass
- [ ] Code review completed

## ⚡ Quick Fix Patterns

### Replace `any` with proper types:
```typescript
// Find: : any
// Replace with: : YourSpecificType

// Find: error: any
// Replace with: error: unknown

// Find: data: any
// Replace with: data: YourDataType
```

### Fix unescaped entities:
```jsx
// Find: '
// Replace with: &apos;

// Find: "
// Replace with: &quot;
```

### Remove unused imports:
```typescript
// Remove unused imports from import statements
// Keep only what you actually use
```

---

**Remember**: Always test your changes and create backups before making modifications! 
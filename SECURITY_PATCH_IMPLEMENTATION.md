# Security Patch Implementation Guide

## Overview
This security patch addresses critical vulnerabilities found in the ReadnWin application. The patch includes protection against SQL injection, XSS, path traversal, file upload vulnerabilities, and implements proper authentication and authorization controls.

## Critical Vulnerabilities Addressed

### 1. SQL Injection Prevention
- **Issue**: Direct string concatenation in SQL queries
- **Fix**: Parameterized queries with input validation
- **Files**: `security-patch.ts` (validateSqlParams, secureQuery)

### 2. Cross-Site Scripting (XSS) Protection
- **Issue**: Unsanitized user input in responses
- **Fix**: Input sanitization and Content Security Policy
- **Files**: `security-patch.ts` (sanitizeInput), `middleware-security.ts`

### 3. Path Traversal Protection
- **Issue**: Unvalidated file paths in upload endpoints
- **Fix**: Path validation and normalization
- **Files**: `security-patch.ts` (validateFilePath), `middleware-security.ts`

### 4. File Upload Security
- **Issue**: Insufficient file type and content validation
- **Fix**: Comprehensive file validation including magic number checks
- **Files**: `api-security-patches.ts` (secureFileUploadAPI)

### 5. Authentication & Authorization
- **Issue**: Inconsistent permission checks
- **Fix**: Centralized auth middleware with proper role validation
- **Files**: `security-patch.ts` (requireAuth, requireAdmin)

### 6. Rate Limiting
- **Issue**: No protection against brute force attacks
- **Fix**: Endpoint-specific rate limiting
- **Files**: `middleware-security.ts`

## Implementation Steps

### Step 1: Install Security Patch Files
```bash
# Copy the security patch files to your project
cp security-patch.ts /path/to/project/
cp middleware-security.ts /path/to/project/
cp api-security-patches.ts /path/to/project/
```

### Step 2: Update Existing API Routes

#### Books API (`app/api/books/route.ts`)
```typescript
import { secureBookAPI } from '@/api-security-patches';

// Replace existing DELETE handler
export const DELETE = secureBookAPI.DELETE;
```

#### Registration API (`app/api/auth/register/route.ts`)
```typescript
import { secureRegistrationAPI } from '@/api-security-patches';

// Add validation before existing logic
export async function POST(request: NextRequest) {
  const validation = await secureRegistrationAPI.POST(request);
  if (!validation.ok) return validation;
  
  // Continue with existing registration logic...
}
```

#### File Upload APIs
```typescript
import { secureFileUploadAPI } from '@/api-security-patches';

// Replace file upload handlers
export const POST = secureFileUploadAPI.POST;
```

### Step 3: Update Database Queries
```typescript
import { secureDatabaseQueries } from '@/api-security-patches';

// Replace direct database calls
const user = await secureDatabaseQueries.getUserByEmail(email);
const books = await secureDatabaseQueries.searchBooks(searchTerm, limit);
```

### Step 4: Enable Security Middleware
```typescript
// Update middleware.ts
import { middleware } from './middleware-security';
export { middleware };
export { config } from './middleware-security';
```

### Step 5: Update Environment Variables
```env
# Add to .env
SECURITY_AUDIT_ENABLED=true
RATE_LIMIT_ENABLED=true
CSP_ENABLED=true
```

## Security Headers Applied

The patch automatically applies these security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: [strict policy]`

## Rate Limiting Configuration

| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| `/api/auth/*` | 15 minutes | 5 |
| `/api/admin/*` | 1 minute | 30 |
| `/api/uploads/*` | 1 minute | 10 |

## Input Validation Rules

### Email Validation
- Must match RFC 5322 format
- Maximum length: 254 characters
- No special characters except allowed ones

### Password Requirements
- Minimum 8 characters
- Must contain uppercase, lowercase, and number
- No common passwords allowed

### File Upload Restrictions
- Allowed types: JPEG, PNG, GIF, PDF, EPUB
- Maximum size: 10MB
- Filename validation: alphanumeric, dots, hyphens only
- Magic number validation to prevent disguised executables

## Audit Logging

All security events are logged to the `audit_logs` table:
- Failed authentication attempts
- Permission violations
- Suspicious file uploads
- SQL injection attempts
- XSS attempts

## Testing the Security Patch

### 1. Test SQL Injection Protection
```bash
curl -X POST "http://localhost:3000/api/books" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test'; DROP TABLE books; --"}'
```
Expected: 400 Bad Request with "Invalid SQL parameters detected"

### 2. Test XSS Protection
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "<script>alert(1)</script>"}'
```
Expected: 400 Bad Request with "Invalid input detected"

### 3. Test Path Traversal Protection
```bash
curl "http://localhost:3000/api/uploads/../../../etc/passwd"
```
Expected: 403 Forbidden

### 4. Test Rate Limiting
```bash
for i in {1..10}; do
  curl -X POST "http://localhost:3000/api/auth/login"
done
```
Expected: 429 Too Many Requests after 5 attempts

## Monitoring and Alerts

Set up monitoring for:
- High number of 400/403/429 responses
- Audit log entries with security events
- Failed authentication attempts
- Unusual file upload patterns

## Production Deployment

1. Test thoroughly in staging environment
2. Deploy during low-traffic period
3. Monitor error rates and performance
4. Have rollback plan ready
5. Update security documentation

## Additional Recommendations

1. **Database Security**
   - Use read-only database users for queries
   - Enable query logging
   - Regular security updates

2. **Infrastructure Security**
   - Enable HTTPS only
   - Use Web Application Firewall (WAF)
   - Regular security scans

3. **Code Security**
   - Regular dependency updates
   - Static code analysis
   - Security code reviews

## Support and Maintenance

- Review security logs weekly
- Update security rules monthly
- Conduct security audits quarterly
- Keep dependencies updated

This patch provides comprehensive protection against common web application vulnerabilities while maintaining application functionality.
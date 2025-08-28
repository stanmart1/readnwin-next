# RBAC System Documentation

## Overview

The ReadnWin RBAC (Role-Based Access Control) system provides comprehensive user management, role assignment, and permission control for the admin dashboard. This system ensures that users only have access to the features and data they are authorized to use.

## System Architecture

### Core Components

1. **Database Tables**
   - `users` - User account information
   - `roles` - System roles with hierarchy
   - `permissions` - Granular permissions for actions
   - `user_roles` - User-role assignments
   - `role_permissions` - Role-permission mappings
   - `user_permission_cache` - Performance optimization cache
   - `audit_logs` - Security and compliance logging

2. **API Routes**
   - `/api/admin/users` - User management
   - `/api/admin/roles` - Role management
   - `/api/admin/permissions` - Permission management
   - `/api/admin/users/[id]/roles` - User role assignments

3. **Frontend Components**
   - `UserManagement.tsx` - User administration interface
   - `RoleManagement.tsx` - Role administration interface
   - `PermissionManagement.tsx` - Permission administration interface

## Default System Roles

### Super Administrator (`super_admin`)
- **Priority**: 100
- **Permissions**: All system permissions
- **Description**: Full system access with all permissions
- **Use Case**: System owners, technical administrators

### Administrator (`admin`)
- **Priority**: 90
- **Permissions**: Most permissions except critical system settings
- **Description**: System administrator with most permissions
- **Use Case**: Business administrators, content managers

### Moderator (`moderator`)
- **Priority**: 70
- **Permissions**: Content moderation and user viewing
- **Description**: Content moderator with limited admin access
- **Use Case**: Community managers, content reviewers

### Author (`author`)
- **Priority**: 50
- **Permissions**: Content creation and publishing
- **Description**: Content creator with publishing permissions
- **Use Case**: Writers, content creators

### Editor (`editor`)
- **Priority**: 40
- **Permissions**: Content editing and review
- **Description**: Content editor with review permissions
- **Use Case**: Content editors, proofreaders

### Reader (`reader`)
- **Priority**: 10
- **Permissions**: Basic content access and profile management
- **Description**: Standard user with basic permissions
- **Use Case**: Regular users, customers

## Permission Categories

### User Management
- `users.read` - View user information
- `users.create` - Create new users
- `users.update` - Update user information
- `users.delete` - Delete users
- `users.manage_roles` - Assign and remove roles from users

### Role Management
- `roles.read` - View role information
- `roles.create` - Create new roles
- `roles.update` - Update role information
- `roles.delete` - Delete roles
- `roles.manage_permissions` - Assign and remove permissions from roles

### Permission Management
- `permissions.read` - View permission information
- `permissions.create` - Create new permissions
- `permissions.update` - Update permission information
- `permissions.delete` - Delete permissions

### Content Management
- `books.read` - View book information
- `books.create` - Create new books
- `books.update` - Update book information
- `books.delete` - Delete books
- `authors.read` - View author information
- `authors.create` - Create new authors
- `authors.update` - Update author information
- `authors.delete` - Delete authors

### System Management
- `system.settings` - Manage system configuration
- `system.analytics` - View system analytics and reports
- `system.audit_logs` - View system audit logs

### Content Areas
- `blog.read/create/update/delete` - Blog management
- `faq.read/create/update/delete` - FAQ management
- `email.read/create/update/delete/send` - Email management
- `about.read/update` - About page management
- `contact.read/update` - Contact information management
- `reviews.read/moderate/delete` - Review management
- `shipping.read/update` - Shipping management
- `notifications.read/create/update/delete` - Notification management
- `works.read/create/update/delete` - Works management

## Installation and Setup

### 1. Initialize RBAC System

Run the initialization script to set up all tables, roles, and permissions:

```bash
# Make the script executable
chmod +x scripts/run-rbac-init.sh

# Run the initialization
./scripts/run-rbac-init.sh
```

Or run directly with Node.js:

```bash
node scripts/init-rbac-system.js
```

### 2. Verify System

Run the verification script to ensure everything is working:

```bash
node scripts/verify-rbac-system.js
```

### 3. Default Admin Account

The system creates a default super admin account:
- **Email**: `admin@readnwin.com`
- **Password**: `Admin123!`
- **Role**: Super Administrator

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## API Usage

### Authentication and Authorization

All admin API routes use the `withPermission` middleware for authorization:

```typescript
import { withPermission } from '@/utils/api-protection';

export async function GET(request: NextRequest) {
  return withPermission('users.read', async (session) => {
    // Your API logic here
  })(request);
}
```

### User Role Management

#### Assign Role to User
```typescript
POST /api/admin/users/[id]/roles
{
  "role_id": 2,
  "expires_at": "2024-12-31T23:59:59Z" // Optional
}
```

#### Remove Role from User
```typescript
DELETE /api/admin/users/[id]/roles?role_id=2
```

#### Get User Roles
```typescript
GET /api/admin/users/[id]/roles
```

### Role Permission Management

#### Assign Permission to Role
```typescript
POST /api/admin/roles/[id]/permissions
{
  "permission_id": 15
}
```

#### Remove Permission from Role
```typescript
DELETE /api/admin/roles/[id]/permissions?permission_id=15
```

## Frontend Integration

### Permission Checking

Use the `usePermissions` hook to check user permissions:

```typescript
import { usePermissions } from '@/app/hooks/usePermissions';
import { canPerformAction } from '@/utils/permission-mapping';

function MyComponent() {
  const { permissions } = usePermissions();
  
  const canCreateUsers = canPerformAction('users.create', permissions);
  
  return (
    <div>
      {canCreateUsers && (
        <button>Create User</button>
      )}
    </div>
  );
}
```

### Tab Access Control

The admin dashboard automatically filters tabs based on user permissions:

```typescript
import { canAccessTab } from '@/utils/permission-mapping';

const visibleTabs = tabs.filter(tab => canAccessTab(tab.id, userPermissions));
```

## Security Features

### 1. Permission Caching
- User permissions are cached for 5 minutes for performance
- Cache is automatically refreshed when roles or permissions change
- Fallback to direct database queries if cache fails

### 2. Audit Logging
- All administrative actions are logged with:
  - User ID and action performed
  - Resource type and ID affected
  - IP address and user agent
  - Timestamp and additional details

### 3. Input Validation
- All API inputs are validated using the `input-validation.ts` utility
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization

### 4. Session Management
- NextAuth.js integration for secure session handling
- Automatic session validation on all protected routes
- Role-based session data enrichment

## Performance Optimization

### 1. Database Indexes
- Optimized indexes on frequently queried columns
- Composite indexes for complex queries
- Regular index maintenance recommendations

### 2. Query Optimization
- Efficient JOIN queries for role-permission lookups
- Batch operations for bulk user management
- Connection pooling for database performance

### 3. Caching Strategy
- Permission cache reduces database load
- Automatic cache invalidation on changes
- Graceful fallback mechanisms

## Troubleshooting

### Common Issues

#### 1. Permission Denied Errors
- Verify user has required role assigned
- Check role has necessary permissions
- Ensure permissions are properly cached

#### 2. Database Connection Issues
- Verify environment variables are set correctly
- Check database server connectivity
- Ensure proper SSL configuration for production

#### 3. Cache Inconsistencies
- Clear permission cache: `DELETE FROM user_permission_cache`
- Rebuild cache by running verification script
- Check for expired role assignments

### Diagnostic Commands

```bash
# Check RBAC system status
node scripts/verify-rbac-system.js

# Rebuild permission cache
node -e "
const { rbacService } = require('./utils/rbac-service');
rbacService.refreshUserPermissionCache(USER_ID);
"

# Check user permissions
node -e "
const { rbacService } = require('./utils/rbac-service');
rbacService.getUserPermissions(USER_ID).then(console.log);
"
```

## Best Practices

### 1. Role Design
- Keep roles focused and specific
- Use descriptive names and descriptions
- Maintain clear role hierarchy
- Avoid permission overlap between roles

### 2. Permission Granularity
- Create specific permissions for each action
- Use consistent naming conventions (resource.action)
- Group related permissions logically
- Document permission purposes

### 3. User Management
- Assign minimal necessary permissions
- Use role expiration for temporary access
- Regular audit of user permissions
- Implement approval workflows for sensitive roles

### 4. Security
- Regular password policy enforcement
- Monitor audit logs for suspicious activity
- Implement session timeout policies
- Use HTTPS in production

## Maintenance

### Regular Tasks

#### Weekly
- Review audit logs for anomalies
- Check for expired role assignments
- Monitor system performance metrics

#### Monthly
- Audit user permissions and roles
- Review and update role descriptions
- Clean up inactive user accounts
- Update documentation

#### Quarterly
- Full security audit
- Performance optimization review
- Update permission structure if needed
- Backup and test restore procedures

### Monitoring

Set up monitoring for:
- Failed authentication attempts
- Permission denied errors
- Database performance metrics
- Cache hit/miss ratios
- Audit log growth

## Migration and Upgrades

### Adding New Permissions

1. Add permission to database:
```sql
INSERT INTO permissions (name, display_name, description, resource, action, scope)
VALUES ('new.permission', 'New Permission', 'Description', 'resource', 'action', 'global');
```

2. Assign to appropriate roles:
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'new.permission';
```

3. Update frontend permission mappings
4. Clear permission cache
5. Test thoroughly

### Role Structure Changes

1. Plan changes carefully
2. Update database schema
3. Migrate existing assignments
4. Update frontend components
5. Test all affected functionality
6. Document changes

## Support and Contact

For RBAC system issues:
1. Check this documentation first
2. Run diagnostic scripts
3. Review audit logs
4. Contact system administrator

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: ReadnWin Development Team
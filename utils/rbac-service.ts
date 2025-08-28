const { query, pool } = require('./database.js');

export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  status: string;
  email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires?: Date;
  welcome_email_sent?: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  priority: number;
  is_system_role: boolean;
  created_at: Date;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  resource: string;
  action: string;
  scope: string;
  created_at: Date;
}

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  assigned_by?: number;
  assigned_at: Date;
  expires_at?: Date;
  is_active: boolean;
  role?: Role;
}

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  granted_by?: number;
  granted_at: Date;
  permission?: Permission;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

class RBACService {
  // User Management
  async getUserById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async getUsers(page: number = 1, limit: number = 10, filters: any = {}, hideAdminUsers: boolean = false): Promise<{ users: User[], total: number }> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.search) {
      whereClause += ` AND (email ILIKE $${paramIndex} OR username ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.role) {
      whereClause += ` AND id IN (SELECT user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name = $${paramIndex})`;
      params.push(filters.role);
      paramIndex++;
    }

    // Hide admin and super_admin users from non-super_admin users
    if (hideAdminUsers) {
      whereClause += ` AND id NOT IN (
        SELECT DISTINCT u.id 
        FROM users u 
        JOIN user_roles ur ON u.id = ur.user_id 
        JOIN roles r ON ur.role_id = r.id 
        WHERE r.name IN ('admin', 'super_admin')
      )`;
    }

    const offset = (page - 1) * limit;
    
    const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const usersResult = await query(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return { users: usersResult.rows, total };
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, avatar_url, status, email_verified, email_verification_token, email_verification_expires, welcome_email_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        userData.email,
        userData.username,
        userData.password_hash,
        userData.first_name,
        userData.last_name,
        userData.avatar_url,
        userData.status || 'active',
        userData.email_verified || false,
        userData.email_verification_token || undefined,
        userData.email_verification_expires || undefined,
        userData.welcome_email_sent || false
      ]
    );
    return result.rows[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    // Filter out undefined values and only update provided fields
    const filteredData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredData).length === 0) {
      // No valid fields to update, just return the current user
      return this.getUserById(id);
    }
    
    const fields = Object.keys(filteredData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(filteredData);
    
    const result = await query(
      `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Check if user exists
      const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [id]);
      if (userCheck.rowCount === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      // Define tables to clean with proper error handling
      const tablesToClean = [
        'user_roles',
        'user_permission_cache',
        'cart_items',
        'book_reviews',
        'reading_progress',
        'reading_sessions',
        'reading_highlights',
        'reading_notes',
        'user_achievements',
        'user_activity',
        'user_notifications',
        'reading_goals',
        'reading_goal_progress',
        'reading_streaks',
        'user_library',
        'audit_logs'
      ];

      // Clean up related data with individual error handling
      for (const table of tablesToClean) {
        try {
          // Check if table has user_id column before attempting deletion
          const columnCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = 'user_id'
          `, [table]);
          
          if (columnCheck.rows.length > 0) {
            await client.query(`DELETE FROM ${table} WHERE user_id = $1`, [id]);
            console.log(`Successfully deleted from ${table}`);
          } else {
            console.log(`Skipping ${table} - no user_id column`);
          }
        } catch (tableError) {
          console.warn(`Warning: Could not delete from ${table}:`, (tableError as Error).message);
          // Continue with other tables instead of aborting
        }
      }

      // Update orders to remove user reference (set user_id to NULL)
      try {
        await client.query('UPDATE orders SET user_id = NULL WHERE user_id = $1', [id]);
        console.log('Successfully updated orders to remove user reference');
      } catch (orderError) {
        console.warn('Warning: Could not update orders:', (orderError as Error).message);
      }

      // Finally delete the user
      const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
      await client.query('COMMIT');
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error in deleteUser transaction:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateUserStatus(id: number, status: string): Promise<User | null> {
    const result = await query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }

  // Role Management
  async getRoles(): Promise<Role[]> {
    const result = await query('SELECT * FROM roles ORDER BY priority DESC, name');
    return result.rows;
  }

  async getRoleById(id: number): Promise<Role | null> {
    const result = await query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    const result = await query('SELECT * FROM roles WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const result = await query(
      `INSERT INTO roles (name, display_name, description, priority, is_system_role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        roleData.name,
        roleData.display_name,
        roleData.description,
        roleData.priority || 0,
        roleData.is_system_role || false
      ]
    );
    return result.rows[0];
  }

  async updateRole(id: number, roleData: Partial<Role>): Promise<Role | null> {
    const fields = Object.keys(roleData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(roleData);
    
    const result = await query(
      `UPDATE roles SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await query('DELETE FROM roles WHERE id = $1 AND is_system_role = FALSE', [id]);
    return (result.rowCount || 0) > 0;
  }

  // Permission Management
  async getPermissions(): Promise<Permission[]> {
    const result = await query('SELECT * FROM permissions ORDER BY resource, action');
    return result.rows;
  }

  async getPermissionById(id: number): Promise<Permission | null> {
    const result = await query('SELECT * FROM permissions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createPermission(permissionData: Partial<Permission>): Promise<Permission> {
    const result = await query(
      `INSERT INTO permissions (name, display_name, description, resource, action, scope)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        permissionData.name,
        permissionData.display_name,
        permissionData.description,
        permissionData.resource,
        permissionData.action,
        permissionData.scope || 'global'
      ]
    );
    return result.rows[0];
  }

  async updatePermission(id: number, permissionData: Partial<Permission>): Promise<Permission | null> {
    const fields = Object.keys(permissionData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(permissionData);
    
    const result = await query(
      `UPDATE permissions SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async deletePermission(id: number): Promise<boolean> {
    const result = await query('DELETE FROM permissions WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  // User Role Management
  async getUserRoles(userId: number): Promise<UserRole[]> {
    const result = await query(
      `SELECT ur.*, r.id as role_id, r.name as role_name, r.display_name as role_display_name, 
              r.description as role_description, r.priority as role_priority, 
              r.is_system_role as role_is_system_role, r.created_at as role_created_at
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND ur.is_active = TRUE
       ORDER BY r.priority DESC`,
      [userId]
    );
    return result.rows;
  }

  async getUsersWithRole(roleName: string): Promise<User[]> {
    const result = await query(
      `SELECT u.* FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE r.name = $1 AND ur.is_active = TRUE
       AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)`,
      [roleName]
    );
    return result.rows;
  }

  async assignRoleToUser(userId: number, roleId: number, assignedBy?: number, expiresAt?: Date): Promise<boolean> {
    try {
      await query(
        `INSERT INTO user_roles (user_id, role_id, assigned_by, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, role_id) DO UPDATE SET
         is_active = TRUE, assigned_by = $3, expires_at = $4`,
        [userId, roleId, assignedBy, expiresAt]
      );
      
      // Refresh user permission cache
      await this.refreshUserPermissionCache(userId);
      return true;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      return false;
    }
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<boolean> {
    try {
      await query(
        'UPDATE user_roles SET is_active = FALSE WHERE user_id = $1 AND role_id = $2',
        [userId, roleId]
      );
      
      // Refresh user permission cache
      await this.refreshUserPermissionCache(userId);
      return true;
    } catch (error) {
      console.error('Error removing role from user:', error);
      return false;
    }
  }

  // Role Permission Management
  async getRolePermissions(roleId: number): Promise<RolePermission[]> {
    const result = await query(
      `SELECT rp.*, p.* FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = $1
       ORDER BY p.resource, p.action`,
      [roleId]
    );
    return result.rows;
  }

  async assignPermissionToRole(roleId: number, permissionId: number, grantedBy?: number): Promise<boolean> {
    try {
      await query(
        `INSERT INTO role_permissions (role_id, permission_id, granted_by)
         VALUES ($1, $2, $3)
         ON CONFLICT (role_id, permission_id) DO NOTHING`,
        [roleId, permissionId, grantedBy]
      );
      
      // Refresh permission cache for all users with this role
      await this.refreshRolePermissionCache(roleId);
      return true;
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      return false;
    }
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    try {
      await query(
        'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
        [roleId, permissionId]
      );
      
      // Refresh permission cache for all users with this role
      await this.refreshRolePermissionCache(roleId);
      return true;
    } catch (error) {
      console.error('Error removing permission from role:', error);
      return false;
    }
  }

  // Permission Checking
  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    const cacheKey = `perm:${userId}:${permissionName}`;
    
    try {
      // Check cache first with timeout
      const cacheResult = await Promise.race([
        query(
          'SELECT is_active FROM user_permission_cache WHERE user_id = $1 AND permission_name = $2 AND cached_at > NOW() - INTERVAL \'5 minutes\'',
          [userId, permissionName]
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cache timeout')), 1000))
      ]);
      
      if (cacheResult.rows && cacheResult.rows.length > 0) {
        return cacheResult.rows[0].is_active;
      }
    } catch (error) {
      // Continue to direct permission check
    }
    
    // If not in cache, check database
    const result = await query(
      `SELECT 1 FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1 AND ur.is_active = TRUE
       AND p.name = $2
       AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)`,
      [userId, permissionName]
    );
    
    const hasPermission = result.rows.length > 0;
    
    // Cache the result (with error handling)
    try {
      await query(
        `INSERT INTO user_permission_cache (user_id, permission_name, is_active)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, permission_name) DO UPDATE SET
         is_active = $3, cached_at = CURRENT_TIMESTAMP`,
        [userId, permissionName, hasPermission]
      );
    } catch (error) {
      console.warn('Failed to cache permission result:', error instanceof Error ? error.message : 'Unknown error');
      // Continue without caching if the table doesn't exist
    }
    
    return hasPermission;
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const result = await query(
      `SELECT DISTINCT p.name FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1 AND ur.is_active = TRUE
       AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
       ORDER BY p.name`,
      [userId]
    );
    return result.rows.map(row => row.name);
  }

  // Permission Cache Management
  async refreshUserPermissionCache(userId: number): Promise<void> {
    // Clear existing cache
    await query('DELETE FROM user_permission_cache WHERE user_id = $1', [userId]);
    
    // Rebuild cache
    const permissions = await this.getUserPermissions(userId);
    for (const permission of permissions) {
      await query(
        'INSERT INTO user_permission_cache (user_id, permission_name, is_active) VALUES ($1, $2, TRUE)',
        [userId, permission]
      );
    }
  }

  async refreshRolePermissionCache(roleId: number): Promise<void> {
    // Get all users with this role
    const usersResult = await query(
      'SELECT user_id FROM user_roles WHERE role_id = $1 AND is_active = TRUE',
      [roleId]
    );
    
    // Refresh cache for each user
    for (const row of usersResult.rows) {
      await this.refreshUserPermissionCache(row.user_id);
    }
  }

  // Audit Logging
  async logAuditEvent(
    userId: number | undefined,
    action: string,
    resourceType?: string,
    resourceId?: number,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, action, resourceType, resourceId, details ? JSON.stringify(details) : null, ipAddress, userAgent]
      );
    } catch (error) {
      console.warn('Failed to log audit event:', error instanceof Error ? error.message : 'Unknown error');
      // Continue without audit logging if the table doesn't exist
    }
  }

  async getAuditLogs(filters: {
    page?: number;
    limit?: number;
    userId?: number;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ logs: AuditLog[]; pagination: any }> {
    const { page = 1, limit = 20, userId, action, resourceType, startDate, endDate } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (userId) {
      whereConditions.push(`al.user_id = $${paramIndex++}`);
      params.push(userId);
    }

    if (action) {
      whereConditions.push(`al.action ILIKE $${paramIndex++}`);
      params.push(`%${action}%`);
    }

    if (resourceType) {
      whereConditions.push(`al.resource_type ILIKE $${paramIndex++}`);
      params.push(`%${resourceType}%`);
    }

    if (startDate) {
      whereConditions.push(`al.created_at >= $${paramIndex++}`);
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`al.created_at <= $${paramIndex++}`);
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs al ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get logs with pagination and user info
    const logsResult = await query(
      `SELECT al.*, u.first_name, u.last_name, u.email 
       FROM audit_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ${whereClause}
       ORDER BY al.created_at DESC 
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return {
      logs: logsResult.rows,
      pagination
    };
  }
}

export const rbacService = new RBACService(); 
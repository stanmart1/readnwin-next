import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/utils/database';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Combine user lookup and role/permission queries into a single query for better performance
          const result = await query(`
            SELECT 
              u.*,
              r.name as role_name,
              r.display_name as role_display_name,
              r.priority as role_priority,
              r.id as role_id,
              ARRAY_AGG(p.name) FILTER (WHERE p.name IS NOT NULL) as permissions
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.id
            WHERE u.email = $1
            GROUP BY u.id, r.id, r.name, r.display_name, r.priority
            ORDER BY r.priority DESC
            LIMIT 1
          `, [credentials.email]);

          if (result.rows.length === 0) {
            return null;
          }

          const user = result.rows[0];
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

          if (!isPasswordValid) {
            return null;
          }

          // Update last login (non-blocking for better performance)
          query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
          ).catch(error => {
            console.error('Failed to update last login:', error);
          });

          const role = user.role_name || 'user';
          const roleDisplayName = user.role_display_name || 'User';
          const roles = user.role_name ? [user.role_name] : ['user'];
          const permissions = user.permissions || [];

          return {
            id: user.id.toString(),
            email: user.email,
            username: user.username || user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: role,
            roleDisplayName: roleDisplayName,
            roles: roles,
            permissions: permissions,
            lastLogin: user.last_login || new Date().toISOString()
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.roleDisplayName = user.roleDisplayName;
        token.roles = user.roles;
        token.permissions = user.permissions;
        token.lastLogin = user.lastLogin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.roleDisplayName = token.roleDisplayName;
        session.user.roles = token.roles;
        session.user.permissions = token.permissions;
        session.user.lastLogin = token.lastLogin;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}; 
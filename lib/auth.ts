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
          // Optimized query - get user and role info only, skip permissions for admin users
          const result = await query(`
            SELECT 
              u.*,
              r.name as role_name,
              r.display_name as role_display_name
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.email = $1
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

          // Check account status
          if (user.status !== 'active') {
            console.warn('Login attempt for inactive user:', user.email);
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
          
          return {
            id: user.id.toString(),
            email: user.email,
            username: user.username || user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: role,
            roleDisplayName: user.role_display_name || 'User',
            roles: user.role_name ? [user.role_name] : ['user'],
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
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.readnwin.com' : undefined
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = { ...session.user, ...token };
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
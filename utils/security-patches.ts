// Security patches for the application
export interface SecurityPatch {
  id: string;
  version: string;
  description: string;
  apply: () => void;
}

export const securityPatches: SecurityPatch[] = [
  {
    id: 'csrf-protection',
    version: '1.0.0',
    description: 'CSRF protection for forms',
    apply: () => {
      // CSRF protection is handled by Next.js middleware
    }
  },
  {
    id: 'xss-protection',
    version: '1.0.0', 
    description: 'XSS protection headers',
    apply: () => {
      // XSS protection is handled by Next.js security headers
    }
  }
];
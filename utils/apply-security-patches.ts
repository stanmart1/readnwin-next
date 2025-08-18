/**
 * Apply Security Patches on Application Startup
 * 
 * This script applies security patches to vulnerable dependencies
 * and should be called early in the application lifecycle.
 */

import securityPatchManager from './security-patch-loader';

/**
 * Initialize security patches
 * This should be called as early as possible in the application startup
 */
export async function initializeSecurityPatches(): Promise<void> {
  try {
    console.log('🔒 Initializing security patches...');
    
    // Apply all security patches
    await securityPatchManager.initialize();
    
    // Validate that patches are working
    const isValid = await securityPatchManager.validatePatches();
    
    if (isValid) {
      console.log('✅ Security patches validated successfully');
    } else {
      console.warn('⚠️ Some security patches failed validation');
    }
    
    // Log patch status
    const status = securityPatchManager.getPatchStatus();
    console.log(`📋 Applied ${status.total} security patches`);
    
  } catch (error) {
    console.error('❌ Error initializing security patches:', error);
    // Don't throw - we want the application to continue even if patches fail
  }
}

/**
 * Get security patch status
 */
export function getSecurityPatchStatus() {
  return securityPatchManager.getPatchStatus();
}

/**
 * Check if a specific patch is applied
 */
export function isSecurityPatchApplied(patchName: string): boolean {
  return securityPatchManager.isPatchApplied(patchName);
}

/**
 * Validate all security patches
 */
export async function validateSecurityPatches(): Promise<boolean> {
  return await securityPatchManager.validatePatches();
}

// Auto-initialize if this module is imported
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  // Server-side only, but not during production build
  initializeSecurityPatches().catch(console.error);
}

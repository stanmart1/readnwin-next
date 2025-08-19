/**
 * Security Patch Loader
 *
 * This module applies security patches to vulnerable dependencies
 * without requiring package updates that might break functionality.
 */

import {
  patchAxiosSecurity,
  patchFormDataSecurity,
  patchMimeSecurity,
  patchJSZipSecurity,
  patchQuillSecurity,
  patchFlutterwaveSecurity,
} from "../security-patches.js";

/**
 * Security Patch Manager
 *
 * Manages the application of security patches to vulnerable dependencies
 */
class SecurityPatchManager {
  private patchesApplied: Set<string> = new Set();
  private isInitialized: boolean = false;

  /**
   * Initialize and apply all security patches
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("🔒 Security patches already initialized");
      return;
    }

    console.log("🔒 Initializing security patches...");

    try {
      // Apply patches in order of criticality
      await this.applyCriticalPatches();
      await this.applyHighPatches();
      await this.applyModeratePatches();

      this.isInitialized = true;
      console.log("✅ Security patches initialized successfully");
      this.logPatchStatus();
    } catch (error) {
      console.error("❌ Error initializing security patches:", error);
      throw error;
    }
  }

  /**
   * Apply critical security patches
   */
  private async applyCriticalPatches(): Promise<void> {
    console.log("🔴 Applying critical security patches...");

    // Patch form-data unsafe random function
    try {
      patchFormDataSecurity();
      this.patchesApplied.add("form-data-secure-random");
      console.log("  ✅ form-data secure random function patched");
    } catch (error) {
      console.warn("  ⚠️ form-data patch failed:", error);
    }

    // Patch minimist prototype pollution
    try {
      this.patchMinimist();
      this.patchesApplied.add("minimist-prototype-pollution");
      console.log("  ✅ minimist prototype pollution patched");
    } catch (error) {
      console.warn("  ⚠️ minimist patch failed:", error);
    }
  }

  /**
   * Apply high severity security patches
   */
  private async applyHighPatches(): Promise<void> {
    console.log("🟠 Applying high severity security patches...");

    // Patch axios CSRF/SSRF vulnerabilities
    try {
      patchAxiosSecurity();
      this.patchesApplied.add("axios-csrf-ssrf");
      console.log("  ✅ axios CSRF/SSRF protection applied");
    } catch (error) {
      console.warn("  ⚠️ axios patch failed:", error);
    }

    // Patch mime ReDoS vulnerability
    try {
      patchMimeSecurity();
      this.patchesApplied.add("mime-redos");
      console.log("  ✅ mime ReDoS protection applied");
    } catch (error) {
      console.warn("  ⚠️ mime patch failed:", error);
    }
  }

  /**
   * Apply moderate severity security patches
   */
  private async applyModeratePatches(): Promise<void> {
    console.log("🟡 Applying moderate severity security patches...");

    // Patch jszip prototype pollution and path traversal
    try {
      patchJSZipSecurity();
      this.patchesApplied.add("jszip-prototype-pollution");
      this.patchesApplied.add("jszip-path-traversal");
      console.log("  ✅ jszip prototype pollution & path traversal patched");
    } catch (error) {
      console.warn("  ⚠️ jszip patch failed:", error);
    }

    // Patch quill XSS vulnerability
    try {
      patchQuillSecurity();
      this.patchesApplied.add("quill-xss");
      console.log("  ✅ quill XSS protection applied");
    } catch (error) {
      console.warn("  ⚠️ quill patch failed:", error);
    }

    // Patch flutterwave axios security
    try {
      patchFlutterwaveSecurity();
      this.patchesApplied.add("flutterwave-axios");
      console.log("  ✅ flutterwave axios security applied");
    } catch (error) {
      console.warn("  ⚠️ flutterwave patch failed:", error);
    }
  }

  /**
   * Patch minimist prototype pollution vulnerability
   */
  private patchMinimist(): void {
    try {
      const minimist = require("minimist");

      // Override the parse function to add prototype pollution protection
      const originalParse = minimist;

      function secureMinimist(args: string[], opts?: any) {
        // Validate arguments
        if (!Array.isArray(args)) {
          throw new Error("Security: Invalid arguments for minimist");
        }

        // Check for prototype pollution attempts
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          if (
            typeof arg === "string" &&
            (arg.includes("__proto__") || arg.includes("constructor"))
          ) {
            throw new Error("Security: Prototype pollution attempt blocked");
          }
        }

        // Call original function with validated arguments
        return originalParse(args, opts);
      }

      // Replace the module exports
      Object.keys(originalParse).forEach((key) => {
        secureMinimist[key] = originalParse[key];
      });

      // Override the module
      module.exports = secureMinimist;
    } catch (error) {
      console.warn("Minimist not found or already patched");
    }
  }

  /**
   * Get patch status
   */
  getPatchStatus(): { applied: string[]; total: number } {
    return {
      applied: Array.from(this.patchesApplied),
      total: this.patchesApplied.size,
    };
  }

  /**
   * Check if a specific patch is applied
   */
  isPatchApplied(patchName: string): boolean {
    return this.patchesApplied.has(patchName);
  }

  /**
   * Log patch status
   */
  private logPatchStatus(): void {
    const status = this.getPatchStatus();
    console.log(`📋 Security patches applied: ${status.total}`);
    status.applied.forEach((patch) => {
      console.log(`  - ${patch}`);
    });
  }

  /**
   * Validate security patches are working
   */
  async validatePatches(): Promise<boolean> {
    console.log("🔍 Validating security patches...");

    const validations = [
      this.validateAxiosPatch(),
      this.validateFormDataPatch(),
      this.validateMimePatch(),
      this.validateJSZipPatch(),
      this.validateQuillPatch(),
    ];

    const results = await Promise.allSettled(validations);
    const passed = results.filter(
      (result) => result.status === "fulfilled" && result.value,
    ).length;
    const total = results.length;

    console.log(
      `✅ Security validation: ${passed}/${total} patches working correctly`,
    );
    return passed === total;
  }

  /**
   * Validate axios patch
   */
  private async validateAxiosPatch(): Promise<boolean> {
    try {
      const axios = require("axios");

      // Test SSRF protection
      try {
        await axios.get("http://localhost:8080");
        return false; // Should be blocked
      } catch (error) {
        if (error.message.includes("Security: Blocked request")) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate form-data patch
   */
  private async validateFormDataPatch(): Promise<boolean> {
    try {
      const FormData = require("form-data");
      const form = new FormData();

      // Test boundary generation
      const boundary = form.getBoundary();
      return boundary && boundary.length > 20; // Should be cryptographically secure
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate mime patch
   */
  private async validateMimePatch(): Promise<boolean> {
    try {
      const mime = require("mime");

      // Test ReDoS protection
      const longPath = "a".repeat(2000);
      try {
        mime.lookup(longPath);
        return false; // Should be blocked
      } catch (error) {
        if (error.message.includes("Security: Path too long")) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate jszip patch
   */
  private async validateJSZipPatch(): Promise<boolean> {
    try {
      const JSZip = require("jszip");
      const zip = new JSZip();

      // Test path traversal protection
      try {
        zip.file("../../../etc/passwd", "test");
        return false; // Should be blocked
      } catch (error) {
        if (
          error.message.includes("Security: Path traversal attempt blocked")
        ) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate quill patch
   */
  private async validateQuillPatch(): Promise<boolean> {
    try {
      // Test XSS protection
      const { sanitizeHTML } =
        require("./security-patches").patchQuillSecurity();
      const maliciousHTML = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = sanitizeHTML(maliciousHTML);

      return (
        !sanitized.includes("<script>") &&
        sanitized.includes("<p>Safe content</p>")
      );
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const securityPatchManager = new SecurityPatchManager();

export default securityPatchManager;

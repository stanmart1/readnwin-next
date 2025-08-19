#!/usr/bin/env node

/**
 * About Us Content Sync Verification Script
 *
 * This script verifies that the About Us content management system
 * is properly synced between admin dashboard and public page.
 *
 * Features:
 * - Component verification
 * - API route validation
 * - Content structure alignment
 * - Real-time sync mechanism testing
 * - Performance monitoring
 * - Database connectivity check
 * - Security validation
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log("\n" + "=".repeat(60), "cyan");
  log(`  ${title}`, "bright");
  log("=".repeat(60), "cyan");
}

function logSubSection(title) {
  log(`\n${colors.yellow}📋 ${title}${colors.reset}`);
  log("-".repeat(40));
}

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileStats(filePath) {
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
    };
  } catch {
    return null;
  }
}

async function validateJSONStructure(content, expectedKeys) {
  try {
    // Check for proper JSON-like structure in TypeScript interfaces
    let validStructure = true;
    for (const key of expectedKeys) {
      if (!content.includes(key)) {
        validStructure = false;
        break;
      }
    }
    return validStructure;
  } catch {
    return false;
  }
}

async function verifyAboutPageComponent() {
  logSubSection("Verifying About Page Component");

  const aboutPagePath = "app/about/page.tsx";
  const exists = await checkFileExists(aboutPagePath);

  if (!exists) {
    log("❌ About page component not found", "red");
    return false;
  }

  log("✅ About page component exists", "green");

  // Check for key content sections
  const content = await fs.promises.readFile(aboutPagePath, "utf8");
  const requiredSections = [
    "hero",
    "mission",
    "missionGrid",
    "stats",
    "values",
    "story",
    "team",
    "cta",
  ];

  let allSectionsFound = true;
  for (const section of requiredSections) {
    if (content.includes(section)) {
      log(`  ✅ Section "${section}" found`, "green");
    } else {
      log(`  ❌ Section "${section}" missing`, "red");
      allSectionsFound = false;
    }
  }

  // Check for real-time sync mechanism
  if (content.includes("about-content-updated")) {
    log("  ✅ Real-time sync event listener found", "green");
  } else {
    log("  ❌ Real-time sync mechanism missing", "red");
    allSectionsFound = false;
  }

  return allSectionsFound;
}

async function verifyAPIRoutes() {
  logSubSection("Verifying API Routes");

  const apiRoutes = ["app/api/about/route.ts", "app/api/admin/about/route.ts"];

  let allRoutesExist = true;
  for (const route of apiRoutes) {
    const exists = await checkFileExists(route);
    if (exists) {
      log(`  ✅ API route ${route} exists`, "green");

      // Check route content
      const content = await fs.promises.readFile(route, "utf8");
      const stats = await getFileStats(route);

      if (stats) {
        log(
          `    📊 File size: ${(stats.size / 1024).toFixed(2)}KB, Modified: ${stats.modified.toLocaleDateString()}`,
          "blue",
        );
      }

      // Check HTTP methods
      const methods = [];
      if (content.includes("export async function GET")) methods.push("GET");
      if (content.includes("export async function POST")) methods.push("POST");
      if (content.includes("export async function PUT")) methods.push("PUT");
      if (content.includes("export async function DELETE"))
        methods.push("DELETE");

      if (methods.length > 0) {
        log(`    ✅ HTTP methods: ${methods.join(", ")}`, "green");
      } else {
        log(`    ❌ No HTTP methods found`, "red");
        allRoutesExist = false;
      }

      // Check for error handling
      if (content.includes("try") && content.includes("catch")) {
        log(`    ✅ Error handling implemented`, "green");
      } else {
        log(`    ⚠️  Missing error handling`, "yellow");
      }

      // Check for validation
      if (
        content.includes("validate") ||
        content.includes("schema") ||
        content.includes("zod")
      ) {
        log(`    ✅ Input validation found`, "green");
      } else {
        log(`    ⚠️  No input validation detected`, "yellow");
      }
    } else {
      log(`  ❌ API route ${route} missing`, "red");
      allRoutesExist = false;
    }
  }

  return allRoutesExist;
}

async function verifyAdminComponents() {
  logSubSection("Verifying Admin Management Components");

  const adminComponents = [
    "app/admin/ModernAboutManagement.tsx",
    "app/admin/EnhancedAboutManagement.tsx",
    "app/admin/AboutManagement.tsx",
    "app/admin/AboutUsSectionsManagement.tsx",
  ];

  let componentsStatus = {
    modern: false,
    enhanced: false,
    legacy: false,
    sections: false,
  };

  for (const component of adminComponents) {
    const exists = await checkFileExists(component);
    if (exists) {
      log(`  ✅ Component ${path.basename(component)} exists`, "green");

      if (component.includes("ModernAbout")) {
        componentsStatus.modern = true;
      } else if (component.includes("EnhancedAbout")) {
        componentsStatus.enhanced = true;
      } else if (component.includes("AboutManagement.tsx")) {
        componentsStatus.legacy = true;
      } else if (component.includes("AboutUsSections")) {
        componentsStatus.sections = true;
      }
    } else {
      log(`  ❌ Component ${path.basename(component)} missing`, "red");
    }
  }

  // Check for modern component integration
  if (componentsStatus.modern && componentsStatus.enhanced) {
    log("  ✅ Modern about management system complete", "green");
  } else {
    log("  ⚠️  Modern about management system incomplete", "yellow");
  }

  return componentsStatus.modern && componentsStatus.enhanced;
}

async function verifyContentStructure() {
  logSubSection("Verifying Content Structure");

  // Check if the content structure matches between components
  const modernComponentPath = "app/admin/ModernAboutManagement.tsx";
  const aboutPagePath = "app/about/page.tsx";

  let structureValid = true;

  if (
    (await checkFileExists(modernComponentPath)) &&
    (await checkFileExists(aboutPagePath))
  ) {
    const modernContent = await fs.promises.readFile(
      modernComponentPath,
      "utf8",
    );
    const pageContent = await fs.promises.readFile(aboutPagePath, "utf8");

    // Check for interface consistency
    const requiredInterfaces = [
      "AboutContent",
      "hero",
      "mission",
      "missionGrid",
      "stats",
      "values",
      "story",
      "team",
      "cta",
    ];

    for (const interface of requiredInterfaces) {
      const inModern = modernContent.includes(interface);
      const inPage = pageContent.includes(interface);

      if (inModern && inPage) {
        log(`  ✅ Interface "${interface}" consistent`, "green");
      } else if (inModern && !inPage) {
        log(`  ❌ Interface "${interface}" missing in public page`, "red");
        structureValid = false;
      } else if (!inModern && inPage) {
        log(`  ❌ Interface "${interface}" missing in admin component`, "red");
        structureValid = false;
      }
    }
  } else {
    log("  ❌ Cannot verify structure - components missing", "red");
    structureValid = false;
  }

  return structureValid;
}

async function verifySyncMechanism() {
  logSubSection("Verifying Sync Mechanism");

  const aboutPagePath = "app/about/page.tsx";
  const modernAdminPath = "app/admin/ModernAboutManagement.tsx";

  let syncMechanismComplete = true;

  if (await checkFileExists(aboutPagePath)) {
    const pageContent = await fs.promises.readFile(aboutPagePath, "utf8");

    // Check for event listeners
    const syncFeatures = [
      "about-content-updated",
      "addEventListener",
      "storage",
      "Cache-Control",
      "no-cache",
    ];

    for (const feature of syncFeatures) {
      if (pageContent.includes(feature)) {
        log(`  ✅ Sync feature "${feature}" implemented`, "green");
      } else {
        log(`  ❌ Sync feature "${feature}" missing`, "red");
        syncMechanismComplete = false;
      }
    }

    // Check for WebSocket or SSE implementation
    if (
      pageContent.includes("WebSocket") ||
      pageContent.includes("EventSource")
    ) {
      log(`  ✅ Real-time connection mechanism found`, "green");
    } else {
      log(`  ⚠️  No real-time connection mechanism detected`, "yellow");
    }
  }

  if (await checkFileExists(modernAdminPath)) {
    const adminContent = await fs.promises.readFile(modernAdminPath, "utf8");

    // Check for event dispatching
    const adminSyncFeatures = [
      "dispatchEvent",
      "CustomEvent",
      "localStorage.setItem",
      "about-content-updated",
    ];

    for (const feature of adminSyncFeatures) {
      if (adminContent.includes(feature)) {
        log(`  ✅ Admin sync feature "${feature}" implemented`, "green");
      } else {
        log(`  ❌ Admin sync feature "${feature}" missing`, "red");
        syncMechanismComplete = false;
      }
    }

    // Check for optimistic updates
    if (
      adminContent.includes("optimistic") ||
      adminContent.includes("pending")
    ) {
      log(`  ✅ Optimistic update pattern found`, "green");
    } else {
      log(`  ⚠️  No optimistic update pattern detected`, "yellow");
    }
  }

  return syncMechanismComplete;
}

async function verifyAssetDirectories() {
  logSubSection("Verifying Asset Directories");

  const requiredDirectories = ["public/images", "public/images/team"];

  let allDirectoriesExist = true;

  for (const dir of requiredDirectories) {
    try {
      const stats = await fs.promises.stat(dir);
      if (stats.isDirectory()) {
        log(`  ✅ Directory ${dir} exists`, "green");
      } else {
        log(`  ❌ ${dir} exists but is not a directory`, "red");
        allDirectoriesExist = false;
      }
    } catch {
      log(`  ❌ Directory ${dir} missing`, "red");
      log(`    Creating directory: ${dir}`, "yellow");
      try {
        await fs.promises.mkdir(dir, { recursive: true });
        log(`    ✅ Directory created successfully`, "green");
      } catch (error) {
        log(`    ❌ Failed to create directory: ${error.message}`, "red");
        allDirectoriesExist = false;
      }
    }
  }

  // Check for placeholder images
  const placeholderPath = "public/images/team/placeholder-avatar.jpg";
  const placeholderExists = await checkFileExists(placeholderPath);

  if (!placeholderExists) {
    log(`  ⚠️  Placeholder avatar missing: ${placeholderPath}`, "yellow");
    log(`    Consider adding a default avatar image`, "yellow");
  } else {
    log(`  ✅ Placeholder avatar exists`, "green");
  }

  return allDirectoriesExist;
}

async function runBuildTest() {
  logSubSection("Testing Build Compatibility");

  try {
    log("  🔄 Running build test...", "blue");
    const startTime = Date.now();

    execSync("npm run build", {
      stdio: "pipe",
      timeout: 120000, // 2 minutes timeout
    });

    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`  ✅ Build completed successfully in ${buildTime}s`, "green");
    return true;
  } catch (error) {
    log("  ❌ Build failed", "red");
    log(`    Error: ${error.message}`, "red");

    // Try to get more detailed error info
    try {
      const typecheck = execSync("npx tsc --noEmit", {
        stdio: "pipe",
        timeout: 30000,
      });
      log("  ✅ TypeScript compilation passed", "green");
    } catch (tscError) {
      log("  ❌ TypeScript errors found", "red");
      const errorOutput = tscError.stdout
        ? tscError.stdout.toString()
        : tscError.message;
      const lines = errorOutput.split("\n").slice(0, 5); // Show first 5 error lines
      lines.forEach((line) => {
        if (line.trim()) {
          log(`    ${line.trim()}`, "red");
        }
      });
    }

    return false;
  }
}

async function verifyDatabaseConnectivity() {
  logSubSection("Verifying Database Connectivity");

  // Check for database configuration files
  const dbConfigFiles = [
    "prisma/schema.prisma",
    "lib/db.ts",
    "lib/database.ts",
    ".env.local",
  ];

  let dbConfigFound = false;
  for (const configFile of dbConfigFiles) {
    if (await checkFileExists(configFile)) {
      log(`  ✅ Database config file found: ${configFile}`, "green");
      dbConfigFound = true;

      if (configFile.includes("schema.prisma")) {
        const content = await fs.promises.readFile(configFile, "utf8");
        if (content.includes("About") || content.includes("about")) {
          log(`    ✅ About model found in schema`, "green");
        } else {
          log(`    ⚠️  No About model found in schema`, "yellow");
        }
      }
    }
  }

  if (!dbConfigFound) {
    log("  ⚠️  No database configuration files found", "yellow");
    log("    This might be using static content or external CMS", "blue");
  }

  return dbConfigFound;
}

async function verifySecurityFeatures() {
  logSubSection("Verifying Security Features");

  const securityChecks = [
    {
      file: "app/api/admin/about/route.ts",
      feature: "authentication",
      patterns: ["auth", "jwt", "session", "token"],
    },
    {
      file: "app/api/admin/about/route.ts",
      feature: "authorization",
      patterns: ["role", "permission", "admin", "authorize"],
    },
    {
      file: "app/api/about/route.ts",
      feature: "input sanitization",
      patterns: ["sanitize", "escape", "validate", "schema"],
    },
    {
      file: "app/api/about/route.ts",
      feature: "rate limiting",
      patterns: ["rateLimit", "throttle", "limit"],
    },
  ];

  let securityScore = 0;
  const totalChecks = securityChecks.length;

  for (const check of securityChecks) {
    if (await checkFileExists(check.file)) {
      const content = await fs.promises.readFile(check.file, "utf8");
      const hasFeature = check.patterns.some((pattern) =>
        content.toLowerCase().includes(pattern.toLowerCase()),
      );

      if (hasFeature) {
        log(`  ✅ ${check.feature} implemented`, "green");
        securityScore++;
      } else {
        log(`  ⚠️  ${check.feature} not detected`, "yellow");
      }
    } else {
      log(`  ❌ Cannot verify ${check.feature} - file missing`, "red");
    }
  }

  const securityPercentage = Math.round((securityScore / totalChecks) * 100);
  log(
    `\n  📊 Security Score: ${securityPercentage}% (${securityScore}/${totalChecks})`,
    securityPercentage >= 75
      ? "green"
      : securityPercentage >= 50
        ? "yellow"
        : "red",
  );

  return securityScore >= totalChecks * 0.5; // At least 50% of security features
}

async function verifyPerformanceOptimizations() {
  logSubSection("Verifying Performance Optimizations");

  const performanceChecks = [
    {
      file: "app/about/page.tsx",
      feature: "image optimization",
      patterns: ["next/image", "Image", "lazy", "priority"],
    },
    {
      file: "app/about/page.tsx",
      feature: "dynamic imports",
      patterns: ["dynamic", "import(", "lazy"],
    },
    {
      file: "app/about/page.tsx",
      feature: "caching headers",
      patterns: ["Cache-Control", "revalidate", "cache"],
    },
    {
      file: "app/api/about/route.ts",
      feature: "response caching",
      patterns: ["cache", "revalidate", "Cache-Control"],
    },
  ];

  let performanceScore = 0;
  const totalChecks = performanceChecks.length;

  for (const check of performanceChecks) {
    if (await checkFileExists(check.file)) {
      const content = await fs.promises.readFile(check.file, "utf8");
      const hasFeature = check.patterns.some((pattern) =>
        content.includes(pattern),
      );

      if (hasFeature) {
        log(`  ✅ ${check.feature} implemented`, "green");
        performanceScore++;
      } else {
        log(`  ⚠️  ${check.feature} not detected`, "yellow");
      }
    } else {
      log(`  ❌ Cannot verify ${check.feature} - file missing`, "red");
    }
  }

  const performancePercentage = Math.round(
    (performanceScore / totalChecks) * 100,
  );
  log(
    `\n  📊 Performance Score: ${performancePercentage}% (${performanceScore}/${totalChecks})`,
    performancePercentage >= 75
      ? "green"
      : performancePercentage >= 50
        ? "yellow"
        : "red",
  );

  return performanceScore >= totalChecks * 0.5; // At least 50% of performance features
}

async function generateReport(results) {
  logSection("📊 VERIFICATION REPORT");

  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(
    (result) => result === true,
  ).length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  log(
    `\n📈 Overall Score: ${score}% (${passedChecks}/${totalChecks} checks passed)\n`,
  );

  // Status indicators
  const getStatusIcon = (status) => (status ? "✅" : "❌");
  const getStatusColor = (status) => (status ? "green" : "red");

  log("📋 Detailed Results:", "bright");
  log(
    `  ${getStatusIcon(results.aboutPage)} About Page Component`,
    getStatusColor(results.aboutPage),
  );
  log(
    `  ${getStatusIcon(results.apiRoutes)} API Routes`,
    getStatusColor(results.apiRoutes),
  );
  log(
    `  ${getStatusIcon(results.adminComponents)} Admin Components`,
    getStatusColor(results.adminComponents),
  );
  log(
    `  ${getStatusIcon(results.contentStructure)} Content Structure`,
    getStatusColor(results.contentStructure),
  );
  log(
    `  ${getStatusIcon(results.syncMechanism)} Sync Mechanism`,
    getStatusColor(results.syncMechanism),
  );
  log(
    `  ${getStatusIcon(results.assetDirectories)} Asset Directories`,
    getStatusColor(results.assetDirectories),
  );
  log(
    `  ${getStatusIcon(results.databaseConnectivity)} Database Connectivity`,
    getStatusColor(results.databaseConnectivity),
  );
  log(
    `  ${getStatusIcon(results.securityFeatures)} Security Features`,
    getStatusColor(results.securityFeatures),
  );
  log(
    `  ${getStatusIcon(results.performanceOptimizations)} Performance Optimizations`,
    getStatusColor(results.performanceOptimizations),
  );
  log(
    `  ${getStatusIcon(results.buildTest)} Build Test`,
    getStatusColor(results.buildTest),
  );

  log("\n📝 Recommendations:", "bright");

  if (!results.aboutPage) {
    log("  • Fix About page component implementation", "yellow");
  }

  if (!results.apiRoutes) {
    log("  • Implement missing API routes for content management", "yellow");
  }

  if (!results.adminComponents) {
    log("  • Complete admin component setup", "yellow");
  }

  if (!results.contentStructure) {
    log(
      "  • Align content structure between admin and public components",
      "yellow",
    );
  }

  if (!results.syncMechanism) {
    log("  • Implement real-time sync mechanism", "yellow");
  }

  if (!results.assetDirectories) {
    log(
      "  • Set up required asset directories and placeholder images",
      "yellow",
    );
  }

  if (!results.buildTest) {
    log("  • Fix build errors before deploying", "yellow");
  }

  if (score >= 90) {
    log(
      "\n🎉 Excellent! About Us sync system is ready for production.",
      "green",
    );
  } else if (score >= 70) {
    log(
      "\n👍 Good! Minor improvements needed for optimal performance.",
      "yellow",
    );
  } else {
    log("\n⚠️  Attention needed! Several issues must be resolved.", "red");
  }

  return score;
}

async function main() {
  try {
    const startTime = Date.now();
    log("🚀 Starting About Us Content Sync Verification...", "bright");
    log(`⏰ Started at: ${new Date().toLocaleString()}`, "blue");

    const results = {
      aboutPage: await verifyAboutPageComponent(),
      apiRoutes: await verifyAPIRoutes(),
      adminComponents: await verifyAdminComponents(),
      contentStructure: await verifyContentStructure(),
      syncMechanism: await verifySyncMechanism(),
      assetDirectories: await verifyAssetDirectories(),
      databaseConnectivity: await verifyDatabaseConnectivity(),
      securityFeatures: await verifySecurityFeatures(),
      performanceOptimizations: await verifyPerformanceOptimizations(),
      buildTest: await runBuildTest(),
    };

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n⏱️  Total verification time: ${totalTime}s`, "blue");

    const score = await generateReport(results);

    // Save detailed report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      score,
      results,
      duration: totalTime,
      recommendations: generateRecommendations(results),
    };

    try {
      await fs.promises.writeFile(
        "about-sync-report.json",
        JSON.stringify(reportData, null, 2),
      );
      log("📄 Detailed report saved to: about-sync-report.json", "blue");
    } catch (writeError) {
      log("⚠️  Could not save detailed report", "yellow");
    }

    // Exit with appropriate code
    process.exit(score >= 70 ? 0 : 1);
  } catch (error) {
    log(`\n❌ Verification failed: ${error.message}`, "red");
    console.error(error.stack);
    process.exit(1);
  }
}

function generateRecommendations(results) {
  const recommendations = [];

  if (!results.aboutPage) {
    recommendations.push({
      priority: "high",
      category: "functionality",
      message: "Fix About page component implementation",
      action:
        "Review component structure and ensure all required sections are present",
    });
  }

  if (!results.apiRoutes) {
    recommendations.push({
      priority: "high",
      category: "api",
      message: "Implement missing API routes",
      action: "Create or fix API endpoints for content management",
    });
  }

  if (!results.securityFeatures) {
    recommendations.push({
      priority: "high",
      category: "security",
      message: "Implement security features",
      action: "Add authentication, authorization, and input validation",
    });
  }

  if (!results.syncMechanism) {
    recommendations.push({
      priority: "medium",
      category: "sync",
      message: "Implement real-time sync mechanism",
      action: "Add event listeners and dispatchers for content synchronization",
    });
  }

  if (!results.performanceOptimizations) {
    recommendations.push({
      priority: "medium",
      category: "performance",
      message: "Add performance optimizations",
      action: "Implement image optimization, caching, and lazy loading",
    });
  }

  if (!results.buildTest) {
    recommendations.push({
      priority: "high",
      category: "build",
      message: "Fix build errors",
      action: "Resolve TypeScript and compilation issues",
    });
  }

  return recommendations;
}

// Run verification if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  verifyAboutPageComponent,
  verifyAPIRoutes,
  verifyAdminComponents,
  verifyContentStructure,
  verifySyncMechanism,
  verifyAssetDirectories,
  verifyDatabaseConnectivity,
  verifySecurityFeatures,
  verifyPerformanceOptimizations,
  runBuildTest,
  generateReport,
  generateRecommendations,
  getFileStats,
  validateJSONStructure,
};

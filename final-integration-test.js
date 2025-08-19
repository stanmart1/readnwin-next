#!/usr/bin/env node

/**
 * Final Integration Test for About Us and Permissions System
 *
 * This comprehensive test verifies:
 * 1. Database connectivity and schema integrity
 * 2. About Us table and content functionality
 * 3. Permissions system completeness
 * 4. Role assignments and access control
 * 5. API endpoints functionality
 * 6. Admin dashboard integration
 * 7. Frontend component availability
 * 8. Security and permission validation
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Working database configuration
const pool = new Pool({
  user: process.env.DB_USER || "avnadmin",
  host: process.env.DB_HOST || "readnwin-nextjs-book-nextjs.b.aivencloud.com",
  database: process.env.DB_NAME || "defaultdb",
  password: process.env.DB_PASSWORD || "AVNS_Xv38UAMF77xN--vUfeX",
  port: parseInt(process.env.DB_PORT || "28428"),
  ssl: {
    rejectUnauthorized: false,
  },
});

// Color codes for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracking
const testResults = {
  database: { passed: 0, failed: 0, tests: [] },
  aboutUs: { passed: 0, failed: 0, tests: [] },
  permissions: { passed: 0, failed: 0, tests: [] },
  api: { passed: 0, failed: 0, tests: [] },
  frontend: { passed: 0, failed: 0, tests: [] },
  security: { passed: 0, failed: 0, tests: [] },
};

function recordTest(category, testName, passed, details = "") {
  const result = {
    testName,
    passed,
    details,
    timestamp: new Date().toISOString(),
  };
  testResults[category].tests.push(result);
  if (passed) {
    testResults[category].passed++;
    log(`   ✅ ${testName}`, "green");
  } else {
    testResults[category].failed++;
    log(`   ❌ ${testName}: ${details}`, "red");
  }
}

// Database helper function
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 1: Database Connectivity and Schema
async function testDatabaseIntegrity() {
  log("\n🔍 Testing Database Integrity...", "cyan");

  // Test connection
  const connectionTest = await query("SELECT NOW() as current_time");
  recordTest("database", "Database Connection", connectionTest.success);

  if (!connectionTest.success) {
    log("❌ Database connection failed - aborting tests", "red");
    return false;
  }

  // Test required tables exist
  const requiredTables = [
    "about_us",
    "permissions",
    "roles",
    "role_permissions",
    "users",
  ];
  for (const tableName of requiredTables) {
    const tableTest = await query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      );
    `,
      [tableName],
    );

    const exists = tableTest.success && tableTest.data.rows[0].exists;
    recordTest("database", `Table ${tableName} exists`, exists);
  }

  // Test about_us table schema
  const aboutUsSchema = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'about_us'
    ORDER BY ordinal_position
  `);

  if (aboutUsSchema.success) {
    const columns = aboutUsSchema.data.rows.map((row) => row.column_name);
    const requiredColumns = [
      "id",
      "section",
      "title",
      "content",
      "sort_order",
      "is_active",
    ];
    const hasAllColumns = requiredColumns.every((col) => columns.includes(col));
    recordTest(
      "database",
      "About Us table schema complete",
      hasAllColumns,
      hasAllColumns
        ? ""
        : `Missing columns: ${requiredColumns.filter((col) => !columns.includes(col)).join(", ")}`,
    );
  }

  // Test permissions table schema
  const permissionsSchema = await query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'permissions'
    ORDER BY ordinal_position
  `);

  if (permissionsSchema.success) {
    const columns = permissionsSchema.data.rows.map((row) => row.column_name);
    const requiredColumns = [
      "id",
      "name",
      "resource",
      "action",
      "display_name",
    ];
    const hasAllColumns = requiredColumns.every((col) => columns.includes(col));
    recordTest(
      "database",
      "Permissions table schema complete",
      hasAllColumns,
      hasAllColumns
        ? ""
        : `Missing columns: ${requiredColumns.filter((col) => !columns.includes(col)).join(", ")}`,
    );
  }

  return true;
}

// Test 2: About Us System Functionality
async function testAboutUsSystem() {
  log("\n🔍 Testing About Us System...", "cyan");

  // Test about_us content exists
  const contentTest = await query("SELECT COUNT(*) as count FROM about_us");
  const hasContent = contentTest.success && contentTest.data.rows[0].count > 0;
  recordTest(
    "aboutUs",
    "About Us content exists",
    hasContent,
    hasContent
      ? `${contentTest.data.rows[0].count} sections found`
      : "No content found",
  );

  // Test required sections exist
  const requiredSections = ["mission", "vision", "story", "team", "values"];
  const sectionsTest = await query(
    `
    SELECT section FROM about_us WHERE section = ANY($1)
  `,
    [requiredSections],
  );

  if (sectionsTest.success) {
    const existingSections = sectionsTest.data.rows.map((row) => row.section);
    const allSectionsExist = requiredSections.every((section) =>
      existingSections.includes(section),
    );
    recordTest(
      "aboutUs",
      "Required sections exist",
      allSectionsExist,
      allSectionsExist
        ? "All sections present"
        : `Missing: ${requiredSections.filter((s) => !existingSections.includes(s)).join(", ")}`,
    );
  }

  // Test active sections
  const activeTest = await query(
    "SELECT COUNT(*) as count FROM about_us WHERE is_active = true",
  );
  const hasActiveContent =
    activeTest.success && activeTest.data.rows[0].count > 0;
  recordTest(
    "aboutUs",
    "Active sections exist",
    hasActiveContent,
    hasActiveContent
      ? `${activeTest.data.rows[0].count} active sections`
      : "No active sections",
  );

  // Test sort ordering
  const sortTest = await query(
    "SELECT section, sort_order FROM about_us ORDER BY sort_order",
  );
  if (sortTest.success) {
    const hasProperOrdering = sortTest.data.rows.every(
      (row, index) => row.sort_order >= 0,
    );
    recordTest("aboutUs", "Sort ordering valid", hasProperOrdering);
  }

  // Test data integrity
  const integrityTest = await query(`
    SELECT COUNT(*) as count FROM about_us
    WHERE section IS NOT NULL AND title IS NOT NULL AND content IS NOT NULL
  `);
  const totalCount = await query("SELECT COUNT(*) as count FROM about_us");

  if (integrityTest.success && totalCount.success) {
    const hasIntegrity =
      integrityTest.data.rows[0].count === totalCount.data.rows[0].count;
    recordTest(
      "aboutUs",
      "Data integrity check",
      hasIntegrity,
      hasIntegrity
        ? "All records complete"
        : "Some records have missing required fields",
    );
  }
}

// Test 3: Permissions System Completeness
async function testPermissionsSystem() {
  log("\n🔍 Testing Permissions System...", "cyan");

  // Test permissions count
  const permissionsCount = await query(
    "SELECT COUNT(*) as count FROM permissions",
  );
  const hasPermissions =
    permissionsCount.success && permissionsCount.data.rows[0].count >= 70;
  recordTest(
    "permissions",
    "Adequate permissions count",
    hasPermissions,
    hasPermissions
      ? `${permissionsCount.data.rows[0].count} permissions`
      : `Only ${permissionsCount.data.rows[0].count} permissions`,
  );

  // Test critical permissions exist
  const criticalPermissions = [
    "content.aboutus",
    "users.read",
    "roles.read",
    "books.create",
    "analytics.dashboard",
    "system.settings",
    "permissions.read",
  ];

  const criticalTest = await query(
    `
    SELECT name FROM permissions WHERE name = ANY($1)
  `,
    [criticalPermissions],
  );

  if (criticalTest.success) {
    const existingCritical = criticalTest.data.rows.map((row) => row.name);
    const allCriticalExist = criticalPermissions.every((perm) =>
      existingCritical.includes(perm),
    );
    recordTest(
      "permissions",
      "Critical permissions exist",
      allCriticalExist,
      allCriticalExist
        ? "All critical permissions present"
        : `Missing: ${criticalPermissions.filter((p) => !existingCritical.includes(p)).join(", ")}`,
    );
  }

  // Test permission resources coverage
  const resourcesTest = await query(`
    SELECT DISTINCT resource FROM permissions ORDER BY resource
  `);

  if (resourcesTest.success) {
    const resources = resourcesTest.data.rows.map((row) => row.resource);
    const expectedResources = [
      "content",
      "users",
      "roles",
      "books",
      "analytics",
      "system",
      "orders",
    ];
    const hasMainResources = expectedResources.every((resource) =>
      resources.includes(resource),
    );
    recordTest(
      "permissions",
      "Main resources covered",
      hasMainResources,
      hasMainResources
        ? `${resources.length} resources covered`
        : "Missing core resources",
    );
  }

  // Test roles exist
  const rolesTest = await query("SELECT COUNT(*) as count FROM roles");
  const hasRoles = rolesTest.success && rolesTest.data.rows[0].count >= 6;
  recordTest(
    "permissions",
    "Roles system populated",
    hasRoles,
    hasRoles
      ? `${rolesTest.data.rows[0].count} roles`
      : `Only ${rolesTest.data.rows[0].count} roles`,
  );

  // Test admin and super_admin roles have permissions
  const adminPermsTest = await query(`
    SELECT r.name, COUNT(rp.permission_id) as perm_count
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    WHERE r.name IN ('admin', 'super_admin')
    GROUP BY r.id, r.name
  `);

  if (adminPermsTest.success) {
    const adminRoles = adminPermsTest.data.rows;
    const adminHasPerms =
      adminRoles.find((r) => r.name === "admin")?.perm_count > 50;
    const superAdminHasPerms =
      adminRoles.find((r) => r.name === "super_admin")?.perm_count > 60;

    recordTest(
      "permissions",
      "Admin role has adequate permissions",
      adminHasPerms,
      adminHasPerms ? "Admin permissions OK" : "Admin role lacks permissions",
    );

    recordTest(
      "permissions",
      "Super admin role has full permissions",
      superAdminHasPerms,
      superAdminHasPerms
        ? "Super admin permissions OK"
        : "Super admin role lacks permissions",
    );
  }
}

// Test 4: API Endpoints Functionality
async function testAPIEndpoints() {
  log("\n🔍 Testing API Endpoints...", "cyan");

  // Test API files exist
  const apiEndpoints = [
    "app/api/admin/about-us/route.js",
    "app/api/about-us/route.js",
  ];

  for (const endpoint of apiEndpoints) {
    const exists = fs.existsSync(path.join(process.cwd(), endpoint));
    recordTest("api", `${endpoint} exists`, exists);

    if (exists) {
      // Test file content
      const content = fs.readFileSync(
        path.join(process.cwd(), endpoint),
        "utf8",
      );
      const hasGetMethod = content.includes("export async function GET");
      const hasProperImports =
        content.includes("NextResponse") && content.includes("query");

      recordTest("api", `${endpoint} has GET method`, hasGetMethod);
      recordTest("api", `${endpoint} has proper imports`, hasProperImports);

      if (endpoint.includes("admin")) {
        const hasPermissionCheck = content.includes("content.aboutus");
        recordTest(
          "api",
          `${endpoint} has permission check`,
          hasPermissionCheck,
        );
      }
    }
  }

  // Test database query functionality that APIs would use
  const publicQueryTest = await query(`
    SELECT section, title, content, image_url, sort_order
    FROM about_us
    WHERE is_active = true
    ORDER BY sort_order, id
  `);
  recordTest("api", "Public API query works", publicQueryTest.success);

  const adminQueryTest = await query(
    "SELECT * FROM about_us ORDER BY sort_order, id",
  );
  recordTest("api", "Admin API query works", adminQueryTest.success);

  // Test API response structure
  if (publicQueryTest.success) {
    const sampleData = publicQueryTest.data.rows[0];
    const hasRequiredFields =
      sampleData &&
      sampleData.hasOwnProperty("section") &&
      sampleData.hasOwnProperty("title") &&
      sampleData.hasOwnProperty("content");
    recordTest("api", "API response structure valid", hasRequiredFields);
  }
}

// Test 5: Frontend Components
async function testFrontendComponents() {
  log("\n🔍 Testing Frontend Components...", "cyan");

  // Test admin components exist
  const adminComponents = [
    "app/admin/EnhancedAboutManagement.tsx",
    "app/admin/AboutUsSectionsManagement.tsx",
    "app/admin/AboutManagement.tsx",
  ];

  for (const component of adminComponents) {
    const exists = fs.existsSync(path.join(process.cwd(), component));
    recordTest("frontend", `${component} exists`, exists);

    if (exists) {
      const content = fs.readFileSync(
        path.join(process.cwd(), component),
        "utf8",
      );
      const hasReactImports =
        content.includes("useState") || content.includes("useEffect");
      const hasProperExport = content.includes("export default");

      recordTest("frontend", `${component} has React hooks`, hasReactImports);
      recordTest(
        "frontend",
        `${component} has default export`,
        hasProperExport,
      );
    }
  }

  // Test permission mapping file
  const permissionMappingExists = fs.existsSync(
    path.join(process.cwd(), "utils/permission-mapping.ts"),
  );
  recordTest(
    "frontend",
    "Permission mapping file exists",
    permissionMappingExists,
  );

  if (permissionMappingExists) {
    const content = fs.readFileSync(
      path.join(process.cwd(), "utils/permission-mapping.ts"),
      "utf8",
    );
    const hasAboutTab =
      content.includes("id: 'about'") || content.includes('id: "about"');
    const hasAboutPermission = content.includes("content.aboutus");

    recordTest("frontend", "About tab defined in mapping", hasAboutTab);
    recordTest(
      "frontend",
      "About permission correctly mapped",
      hasAboutPermission,
    );
  }

  // Test main admin page integration
  const adminPageExists = fs.existsSync(
    path.join(process.cwd(), "app/admin/page.tsx"),
  );
  recordTest("frontend", "Main admin page exists", adminPageExists);

  if (adminPageExists) {
    const content = fs.readFileSync(
      path.join(process.cwd(), "app/admin/page.tsx"),
      "utf8",
    );
    const hasEnhancedAbout = content.includes("EnhancedAboutManagement");
    recordTest(
      "frontend",
      "Admin page uses Enhanced About Management",
      hasEnhancedAbout,
    );
  }
}

// Test 6: Security and Permissions Validation
async function testSecurityValidation() {
  log("\n🔍 Testing Security and Permissions...", "cyan");

  // Test that admin API has permission checks
  const adminApiPath = path.join(
    process.cwd(),
    "app/api/admin/about-us/route.js",
  );
  if (fs.existsSync(adminApiPath)) {
    const content = fs.readFileSync(adminApiPath, "utf8");

    const hasAuthCheck = content.includes("getServerSession");
    const hasPermissionCheck = content.includes("hasPermission");
    const hasRBACService = content.includes("rbacService");
    const hasUnauthorizedResponse = content.includes("Unauthorized");

    recordTest("security", "Admin API has authentication check", hasAuthCheck);
    recordTest(
      "security",
      "Admin API has permission check",
      hasPermissionCheck,
    );
    recordTest("security", "Admin API uses RBAC service", hasRBACService);
    recordTest(
      "security",
      "Admin API returns unauthorized response",
      hasUnauthorizedResponse,
    );
  }

  // Test that public API doesn't have sensitive data exposure
  const publicApiPath = path.join(process.cwd(), "app/api/about-us/route.js");
  if (fs.existsSync(publicApiPath)) {
    const content = fs.readFileSync(publicApiPath, "utf8");

    const noUserIdExposure =
      !content.includes("created_by") && !content.includes("updated_by");
    const noTimestampExposure =
      !content.includes("created_at") && !content.includes("updated_at");
    const hasActiveFilter = content.includes("is_active = true");

    recordTest(
      "security",
      "Public API doesn't expose user IDs",
      noUserIdExposure,
    );
    recordTest(
      "security",
      "Public API doesn't expose timestamps",
      noTimestampExposure,
    );
    recordTest(
      "security",
      "Public API filters active content only",
      hasActiveFilter,
    );
  }

  // Test permission uniqueness
  const uniquePermsTest = await query(`
    SELECT name, COUNT(*) as count
    FROM permissions
    GROUP BY name
    HAVING COUNT(*) > 1
  `);

  const hasUniquePermissions =
    uniquePermsTest.success && uniquePermsTest.data.rows.length === 0;
  recordTest(
    "security",
    "All permissions are unique",
    hasUniquePermissions,
    hasUniquePermissions
      ? "No duplicate permissions"
      : `${uniquePermsTest.data.rows.length} duplicate permissions found`,
  );

  // Test role-permission relationships integrity
  const orphanedPermsTest = await query(`
    SELECT COUNT(*) as count
    FROM role_permissions rp
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE p.id IS NULL
  `);

  const noOrphanedPerms =
    orphanedPermsTest.success && orphanedPermsTest.data.rows[0].count === 0;
  recordTest(
    "security",
    "No orphaned role-permission relationships",
    noOrphanedPerms,
    noOrphanedPerms
      ? "All relationships are valid"
      : `${orphanedPermsTest.data.rows[0].count} orphaned relationships found`,
  );
}

// Generate comprehensive test report
function generateTestReport() {
  log("\n📊 Final Integration Test Report", "bold");
  log("=".repeat(60), "dim");

  let totalPassed = 0;
  let totalFailed = 0;
  let overallScore = 0;

  for (const [category, results] of Object.entries(testResults)) {
    const categoryPassed = results.passed;
    const categoryFailed = results.failed;
    const categoryTotal = categoryPassed + categoryFailed;
    const categoryScore =
      categoryTotal > 0
        ? Math.round((categoryPassed / categoryTotal) * 100)
        : 100;

    totalPassed += categoryPassed;
    totalFailed += categoryFailed;

    const statusColor =
      categoryScore === 100 ? "green" : categoryScore >= 80 ? "yellow" : "red";
    const statusIcon =
      categoryScore === 100 ? "✅" : categoryScore >= 80 ? "⚠️" : "❌";

    log(
      `\n${statusIcon} ${category.toUpperCase()}: ${categoryScore}% (${categoryPassed}/${categoryTotal})`,
      statusColor,
    );

    if (categoryFailed > 0) {
      const failedTests = results.tests.filter((test) => !test.passed);
      failedTests.forEach((test) => {
        log(`   ❌ ${test.testName}: ${test.details}`, "red");
      });
    }
  }

  const totalTests = totalPassed + totalFailed;
  overallScore =
    totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 100;

  log("\n" + "=".repeat(60), "dim");
  log(
    `📈 OVERALL SCORE: ${overallScore}% (${totalPassed}/${totalTests})`,
    "bold",
  );

  if (overallScore === 100) {
    log(
      "\n🎉 PERFECT SCORE! All systems are fully operational and ready for production.",
      "green",
    );
  } else if (overallScore >= 90) {
    log(
      "\n✅ EXCELLENT! System is production-ready with minor issues to address.",
      "green",
    );
  } else if (overallScore >= 80) {
    log(
      "\n⚠️ GOOD! System is mostly ready but has some issues that should be addressed.",
      "yellow",
    );
  } else {
    log(
      "\n❌ NEEDS WORK! Critical issues found that must be resolved before production.",
      "red",
    );
  }

  // System status summary
  log("\n📋 System Component Status:", "cyan");
  log(
    `   Database: ${testResults.database.failed === 0 ? "✅ Operational" : "❌ Issues"}`,
    testResults.database.failed === 0 ? "green" : "red",
  );
  log(
    `   About Us: ${testResults.aboutUs.failed === 0 ? "✅ Operational" : "❌ Issues"}`,
    testResults.aboutUs.failed === 0 ? "green" : "red",
  );
  log(
    `   Permissions: ${testResults.permissions.failed === 0 ? "✅ Operational" : "❌ Issues"}`,
    testResults.permissions.failed === 0 ? "green" : "red",
  );
  log(
    `   API Endpoints: ${testResults.api.failed === 0 ? "✅ Operational" : "❌ Issues"}`,
    testResults.api.failed === 0 ? "green" : "red",
  );
  log(
    `   Frontend: ${testResults.frontend.failed === 0 ? "✅ Operational" : "❌ Issues"}`,
    testResults.frontend.failed === 0 ? "green" : "red",
  );
  log(
    `   Security: ${testResults.security.failed === 0 ? "✅ Operational" : "❌ Issues"}`,
    testResults.security.failed === 0 ? "green" : "red",
  );

  return overallScore;
}

// Main test execution
async function runIntegrationTests() {
  log("🚀 Starting Final Integration Test Suite", "bold");
  log(`📅 ${new Date().toISOString()}`, "dim");
  log("=".repeat(60), "dim");

  try {
    // Run all test suites
    const dbSuccess = await testDatabaseIntegrity();
    if (dbSuccess) {
      await testAboutUsSystem();
      await testPermissionsSystem();
    }

    await testAPIEndpoints();
    await testFrontendComponents();
    await testSecurityValidation();

    // Generate final report
    const overallScore = generateTestReport();

    // Cleanup
    await pool.end();

    // Exit with appropriate code
    process.exit(overallScore >= 90 ? 0 : 1);
  } catch (error) {
    log(`❌ Critical test failure: ${error.message}`, "red");
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = {
  runIntegrationTests,
  testDatabaseIntegrity,
  testAboutUsSystem,
  testPermissionsSystem,
  testAPIEndpoints,
  testFrontendComponents,
  testSecurityValidation,
  generateTestReport,
};

const { query } = require('./utils/database');

async function verifyEmailTemplateLinkage() {
  console.log('🔍 Verifying Email Template Linkage...\n');

  try {
    // 1. Get all email functions
    const functionsResult = await query(`
      SELECT id, name, slug, description, category, required_variables, is_active
      FROM email_functions
      ORDER BY category, name
    `);

    // 2. Get all email templates
    const templatesResult = await query(`
      SELECT id, name, slug, subject, category, is_active
      FROM email_templates
      ORDER BY category, name
    `);

    // 3. Get all function assignments
    const assignmentsResult = await query(`
      SELECT 
        efa.*,
        ef.name as function_name,
        ef.slug as function_slug,
        et.name as template_name,
        et.slug as template_slug
      FROM email_function_assignments efa
      JOIN email_functions ef ON efa.function_id = ef.id
      JOIN email_templates et ON efa.template_id = et.id
      ORDER BY ef.category, ef.name, efa.priority
    `);

    const functions = functionsResult.rows;
    const templates = templatesResult.rows;
    const assignments = assignmentsResult.rows;

    console.log(`📊 Summary:`);
    console.log(`   • Email Functions: ${functions.length}`);
    console.log(`   • Email Templates: ${templates.length}`);
    console.log(`   • Function Assignments: ${assignments.length}\n`);

    // 4. Check which functions have templates assigned
    console.log('🔗 Function-Template Assignments:\n');
    
    const functionsBySlug = {};
    functions.forEach(func => {
      functionsBySlug[func.slug] = func;
    });

    const assignmentsByFunction = {};
    assignments.forEach(assignment => {
      if (!assignmentsByFunction[assignment.function_slug]) {
        assignmentsByFunction[assignment.function_slug] = [];
      }
      assignmentsByFunction[assignment.function_slug].push(assignment);
    });

    // 5. Check each function and its corresponding email service function
    const emailServiceFunctions = [
      { slug: 'welcome', serviceFunctionName: 'sendWelcomeEmail' },
      { slug: 'password-reset', serviceFunctionName: 'sendPasswordResetEmail' },
      { slug: 'order-confirmation', serviceFunctionName: 'sendOrderConfirmationEmail' },
      { slug: 'order-shipped', serviceFunctionName: 'sendOrderShippedEmail' },
      { slug: 'account-verification', serviceFunctionName: 'sendEmailVerification' },
      { slug: 'email-confirmation', serviceFunctionName: 'sendEmailConfirmation' },
      { slug: 'order-status-update', serviceFunctionName: 'sendOrderStatusUpdateEmail' },
      { slug: 'payment-confirmation', serviceFunctionName: 'sendPaymentConfirmationEmail' },
      { slug: 'shipping-notification', serviceFunctionName: 'sendShippingNotificationEmail' },
      { slug: 'password-changed', serviceFunctionName: 'sendPasswordChangedEmail' },
      { slug: 'login-alert', serviceFunctionName: 'sendLoginAlertEmail' },
      { slug: 'account-deactivation', serviceFunctionName: 'sendAccountDeactivationEmail' },
      { slug: 'newsletter-subscription', serviceFunctionName: 'sendNewsletterSubscriptionEmail' },
      { slug: 'promotional-offer', serviceFunctionName: 'sendPromotionalOfferEmail' },
      { slug: 'system-maintenance', serviceFunctionName: 'sendSystemMaintenanceEmail' },
      { slug: 'security-alert', serviceFunctionName: 'sendSecurityAlertEmail' }
    ];

    let linkedCount = 0;
    let unlinkedCount = 0;
    const issues = [];

    for (const serviceFunc of emailServiceFunctions) {
      const dbFunction = functionsBySlug[serviceFunc.slug];
      const functionAssignments = assignmentsByFunction[serviceFunc.slug] || [];
      
      console.log(`📧 ${serviceFunc.serviceFunctionName}:`);
      console.log(`   Function Slug: ${serviceFunc.slug}`);
      
      if (!dbFunction) {
        console.log(`   ❌ Database Function: NOT FOUND`);
        issues.push(`Missing database function: ${serviceFunc.slug}`);
        unlinkedCount++;
      } else {
        console.log(`   ✅ Database Function: ${dbFunction.name} (${dbFunction.is_active ? 'Active' : 'Inactive'})`);
        
        if (functionAssignments.length === 0) {
          console.log(`   ❌ Template Assignment: NONE`);
          issues.push(`No template assigned to function: ${serviceFunc.slug}`);
          unlinkedCount++;
        } else {
          console.log(`   ✅ Template Assignments: ${functionAssignments.length}`);
          functionAssignments.forEach((assignment, index) => {
            const status = assignment.is_active ? '✅ Active' : '⚠️ Inactive';
            console.log(`      ${index + 1}. ${assignment.template_name} (Priority: ${assignment.priority}) ${status}`);
          });
          linkedCount++;
        }
      }
      console.log('');
    }

    // 6. Check for orphaned templates (templates not assigned to any function)
    console.log('🔍 Checking for orphaned templates...\n');
    
    const assignedTemplateIds = new Set(assignments.map(a => a.template_id));
    const orphanedTemplates = templates.filter(template => !assignedTemplateIds.has(template.id));
    
    if (orphanedTemplates.length > 0) {
      console.log('⚠️ Orphaned Templates (not assigned to any function):');
      orphanedTemplates.forEach(template => {
        console.log(`   • ${template.name} (${template.slug}) - ${template.category}`);
        issues.push(`Orphaned template: ${template.slug}`);
      });
      console.log('');
    } else {
      console.log('✅ No orphaned templates found.\n');
    }

    // 7. Check for functions without corresponding service functions
    console.log('🔍 Checking for functions without service implementations...\n');
    
    const serviceFunctionSlugs = new Set(emailServiceFunctions.map(f => f.slug));
    const unimplementedFunctions = functions.filter(func => !serviceFunctionSlugs.has(func.slug));
    
    if (unimplementedFunctions.length > 0) {
      console.log('⚠️ Functions without service implementations:');
      unimplementedFunctions.forEach(func => {
        console.log(`   • ${func.name} (${func.slug}) - ${func.category}`);
        issues.push(`No service implementation for function: ${func.slug}`);
      });
      console.log('');
    } else {
      console.log('✅ All functions have service implementations.\n');
    }

    // 8. Summary Report
    console.log('📋 VERIFICATION SUMMARY:\n');
    console.log(`✅ Properly Linked Functions: ${linkedCount}`);
    console.log(`❌ Unlinked Functions: ${unlinkedCount}`);
    console.log(`⚠️ Orphaned Templates: ${orphanedTemplates.length}`);
    console.log(`⚠️ Unimplemented Functions: ${unimplementedFunctions.length}`);
    console.log(`🔧 Total Issues Found: ${issues.length}\n`);

    if (issues.length > 0) {
      console.log('🚨 ISSUES TO RESOLVE:\n');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      console.log('');
    } else {
      console.log('🎉 All email templates are properly linked to their functions!\n');
    }

    // 9. Detailed Assignment Report
    console.log('📊 DETAILED ASSIGNMENT REPORT:\n');
    
    const categorizedAssignments = {};
    assignments.forEach(assignment => {
      const category = functionsBySlug[assignment.function_slug]?.category || 'unknown';
      if (!categorizedAssignments[category]) {
        categorizedAssignments[category] = [];
      }
      categorizedAssignments[category].push(assignment);
    });

    Object.keys(categorizedAssignments).sort().forEach(category => {
      console.log(`📁 ${category.toUpperCase()}:`);
      categorizedAssignments[category].forEach(assignment => {
        const status = assignment.is_active ? '🟢' : '🔴';
        console.log(`   ${status} ${assignment.function_name} → ${assignment.template_name} (Priority: ${assignment.priority})`);
      });
      console.log('');
    });

    // 10. Recommendations
    console.log('💡 RECOMMENDATIONS:\n');
    
    if (unlinkedCount > 0) {
      console.log('1. Assign templates to unlinked functions using the Email Template Management admin page');
    }
    
    if (orphanedTemplates.length > 0) {
      console.log('2. Either assign orphaned templates to functions or delete them if not needed');
    }
    
    if (unimplementedFunctions.length > 0) {
      console.log('3. Implement service functions for database functions or remove unused functions');
    }
    
    if (issues.length === 0) {
      console.log('✅ Your email system is properly configured! All templates are linked to their functions.');
    }

    console.log('\n🔚 Verification completed.');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

// Run verification
verifyEmailTemplateLinkage()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
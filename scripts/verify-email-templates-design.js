const { query } = require('../utils/database');

async function verifyEmailTemplatesDesign() {
  try {
    console.log('🔍 Verifying Email Templates Design System...\n');

    // Get all active email templates
    const templates = await query('SELECT * FROM email_templates WHERE is_active = true ORDER BY name');
    console.log(`Found ${templates.rows.length} active email templates\n`);

    let designConsistentCount = 0;
    let localhostLinksCount = 0;
    let readnwinLinksCount = 0;
    let issues = [];

    for (const template of templates.rows) {
      console.log(`Checking: ${template.name} (${template.slug})`);
      
      const content = template.html_content;
      let templateIssues = [];

      // Check design system consistency
      const hasHeader = content.includes('📚 ReadnWin');
      const hasFooter = content.includes('Thank you for choosing ReadnWin');
      const hasGradient = content.includes('linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)');
      const hasContainer = content.includes('max-width: 600px');
      const hasInterFont = content.includes('Inter');
      const hasProperStructure = content.includes('<!DOCTYPE html>') && content.includes('<div class="container">');

      if (!hasHeader) templateIssues.push('Missing ReadnWin header');
      if (!hasFooter) templateIssues.push('Missing footer');
      if (!hasGradient) templateIssues.push('Missing gradient styling');
      if (!hasContainer) templateIssues.push('Missing container styling');
      if (!hasInterFont) templateIssues.push('Missing Inter font');
      if (!hasProperStructure) templateIssues.push('Missing proper HTML structure');

      // Check for localhost links
      if (content.includes('localhost')) {
        localhostLinksCount++;
        templateIssues.push('Contains localhost links');
      }

      // Check for readnwin.com links
      if (content.includes('readnwin.com')) {
        readnwinLinksCount++;
      }

      // Check for proper button styling
      const hasButtonStyle = content.includes('.button {');
      if (!hasButtonStyle) templateIssues.push('Missing button styling');

      // Check for responsive design
      const hasResponsive = content.includes('@media (max-width: 600px)');
      if (!hasResponsive) templateIssues.push('Missing responsive design');

      if (templateIssues.length === 0) {
        console.log('  ✅ Design consistent');
        designConsistentCount++;
      } else {
        console.log(`  ❌ Issues: ${templateIssues.join(', ')}`);
        issues.push({
          template: template.name,
          slug: template.slug,
          issues: templateIssues
        });
      }
    }

    console.log(`\n📊 Verification Summary:`);
    console.log(`   • Templates with consistent design: ${designConsistentCount}/${templates.rows.length}`);
    console.log(`   • Templates with localhost links: ${localhostLinksCount}`);
    console.log(`   • Templates with readnwin.com links: ${readnwinLinksCount}`);
    console.log(`   • Templates with issues: ${issues.length}`);

    if (issues.length > 0) {
      console.log(`\n❌ Issues Found:`);
      issues.forEach(issue => {
        console.log(`   • ${issue.template} (${issue.slug}): ${issue.issues.join(', ')}`);
      });
    } else {
      console.log(`\n✅ All email templates are consistent with the design system!`);
    }

    // Test a specific template rendering
    console.log(`\n🧪 Testing Template Rendering...`);
    
    // Test welcome email template with sample data
    const welcomeTemplate = templates.rows.find(t => t.slug === 'welcome');
    if (welcomeTemplate) {
      let testContent = welcomeTemplate.html_content;
      
      // Replace template variables with test data
      testContent = testContent.replace(/\{\{userName\}\}/g, 'John Doe');
      
      // Check if the template renders properly
      const hasTestContent = testContent.includes('John Doe');
      const hasButton = testContent.includes('Start Reading Now');
      const hasReadnwinLink = testContent.includes('https://readnwin.com/dashboard');
      
      console.log(`   • Welcome template test:`);
      console.log(`     - User name replacement: ${hasTestContent ? '✅' : '❌'}`);
      console.log(`     - Button present: ${hasButton ? '✅' : '❌'}`);
      console.log(`     - ReadnWin link: ${hasReadnwinLink ? '✅' : '❌'}`);
    }

    // Test password reset template
    const passwordResetTemplate = templates.rows.find(t => t.slug === 'password-reset');
    if (passwordResetTemplate) {
      let testContent = passwordResetTemplate.html_content;
      
      // Replace template variables with test data
      testContent = testContent.replace(/\{\{userName\}\}/g, 'Jane Smith');
      testContent = testContent.replace(/\{\{resetUrl\}\}/g, 'https://readnwin.com/reset-password?token=test123');
      
      const hasTestContent = testContent.includes('Jane Smith');
      const hasResetButton = testContent.includes('Reset My Password');
      const hasResetUrl = testContent.includes('https://readnwin.com/reset-password');
      
      console.log(`   • Password reset template test:`);
      console.log(`     - User name replacement: ${hasTestContent ? '✅' : '❌'}`);
      console.log(`     - Reset button present: ${hasResetButton ? '✅' : '❌'}`);
      console.log(`     - Reset URL: ${hasResetUrl ? '✅' : '❌'}`);
    }

    console.log(`\n🎉 Email Templates Design Verification Complete!`);

    return {
      success: issues.length === 0,
      totalTemplates: templates.rows.length,
      consistentTemplates: designConsistentCount,
      localhostLinks: localhostLinksCount,
      readnwinLinks: readnwinLinksCount,
      issues: issues
    };

  } catch (error) {
    console.error('❌ Error verifying email templates:', error);
    throw error;
  }
}

// Run the verification
if (require.main === module) {
  verifyEmailTemplatesDesign()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ All email templates are properly designed and consistent!');
        process.exit(0);
      } else {
        console.log('\n❌ Some email templates have design issues that need attention.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Email templates verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyEmailTemplatesDesign }; 
const { query } = require('./database');

async function verifyEmailFunctionAssignments() {
  try {
    console.log('🔍 Verifying email function assignments...\n');

    // Get all email functions
    const functions = await query('SELECT id, name, slug FROM email_functions ORDER BY category, name');
    console.log(`Found ${functions.rows.length} email functions:`);
    functions.rows.forEach(func => {
      console.log(`  - ${func.name} (${func.slug})`);
    });

    // Get all email templates
    const templates = await query('SELECT id, name, slug FROM email_templates ORDER BY category, name');
    console.log(`\nFound ${templates.rows.length} email templates:`);
    templates.rows.forEach(template => {
      console.log(`  - ${template.name} (${template.slug})`);
    });

    // Check assignments
    const assignments = await query(`
      SELECT ef.name as function_name, ef.slug as function_slug, et.name as template_name, et.slug as template_slug, efa.is_active, efa.priority 
      FROM email_function_assignments efa 
      JOIN email_functions ef ON efa.function_id = ef.id 
      JOIN email_templates et ON efa.template_id = et.id 
      ORDER BY ef.category, ef.name, efa.priority
    `);
    
    console.log(`\nFound ${assignments.rows.length} function assignments:`);
    assignments.rows.forEach(assignment => {
      console.log(`  - ${assignment.function_name} → ${assignment.template_name} (Priority: ${assignment.priority}, Active: ${assignment.is_active})`);
    });

    // Check for missing assignments
    console.log('\n🔍 Checking for missing assignments...');
    
    const missingAssignments = [];
    
    for (const func of functions.rows) {
      const hasAssignment = assignments.rows.some(a => a.function_slug === func.slug);
      if (!hasAssignment) {
        missingAssignments.push(func);
        console.log(`❌ Missing assignment for function: ${func.name} (${func.slug})`);
      }
    }

    // Create missing assignments
    if (missingAssignments.length > 0) {
      console.log('\n🔄 Creating missing assignments...');
      
      for (const func of missingAssignments) {
        // Find matching template
        const matchingTemplate = templates.rows.find(t => t.slug === func.slug);
        
        if (matchingTemplate) {
          try {
            await query(`
              INSERT INTO email_function_assignments (function_id, template_id, is_active, priority)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (function_id, template_id) DO NOTHING
            `, [func.id, matchingTemplate.id, true, 1]);
            
            console.log(`✅ Created assignment: ${func.name} → ${matchingTemplate.name}`);
          } catch (error) {
            console.error(`❌ Error creating assignment for ${func.name}:`, error);
          }
        } else {
          console.log(`⚠️ No matching template found for function: ${func.name} (${func.slug})`);
        }
      }
    } else {
      console.log('✅ All functions have assignments!');
    }

    // Verify all assignments are active
    console.log('\n🔍 Checking assignment status...');
    const inactiveAssignments = assignments.rows.filter(a => !a.is_active);
    if (inactiveAssignments.length > 0) {
      console.log(`⚠️ Found ${inactiveAssignments.length} inactive assignments:`);
      inactiveAssignments.forEach(assignment => {
        console.log(`  - ${assignment.function_name} → ${assignment.template_name}`);
      });
    } else {
      console.log('✅ All assignments are active!');
    }

    console.log('\n🎉 Email function assignment verification completed!');
  } catch (error) {
    console.error('❌ Error verifying email function assignments:', error);
    process.exit(1);
  }
}

// Run the script
verifyEmailFunctionAssignments(); 
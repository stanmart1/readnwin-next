#!/usr/bin/env node

/**
 * Initialize Payment Gateways
 * This script creates the default payment gateways in the database
 */

require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function initPaymentGateways() {
  try {
    console.log('🔧 Initializing Payment Gateways...\n');

    // 1. Check if payment gateways table exists
    console.log('1. Checking payment gateways table...');
    const tableResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payment_gateways'
      )
    `);

    if (!tableResult.rows[0].exists) {
      console.log('❌ Payment gateways table does not exist');
      console.log('Please run the payment settings schema first');
      return;
    }

    console.log('✅ Payment gateways table exists');

    // 2. Check current gateways
    console.log('\n2. Checking current gateways...');
    const currentGateways = await query('SELECT gateway_id FROM payment_gateways');
    console.log(`Found ${currentGateways.rows.length} existing gateways`);

    // 3. Define default gateways
    const defaultGateways = [
      {
        gateway_id: 'flutterwave',
        name: 'Flutterwave',
        description: 'Leading payment technology company in Africa',
        enabled: false,
        test_mode: true,
        public_key: '',
        secret_key: '',
        webhook_secret: '',
        hash: '',
        status: 'inactive'
      },
      {
        gateway_id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer with proof of payment upload',
        enabled: false,
        test_mode: false,
        public_key: '',
        secret_key: '',
        webhook_secret: '',
        hash: '',
        status: 'inactive'
      }
    ];

    // 4. Insert default gateways
    console.log('\n3. Creating default gateways...');
    for (const gateway of defaultGateways) {
      const existingGateway = currentGateways.rows.find(g => g.gateway_id === gateway.gateway_id);
      
      if (existingGateway) {
        console.log(`  ⏭️  Gateway ${gateway.name} already exists`);
      } else {
        await query(`
          INSERT INTO payment_gateways (
            gateway_id, name, description, enabled, test_mode, 
            public_key, secret_key, webhook_secret, hash, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          gateway.gateway_id,
          gateway.name,
          gateway.description,
          gateway.enabled,
          gateway.test_mode,
          gateway.public_key,
          gateway.secret_key,
          gateway.webhook_secret,
          gateway.hash,
          gateway.status
        ]);
        console.log(`  ✅ Created gateway: ${gateway.name}`);
      }
    }

    // 5. Create payment settings if they don't exist
    console.log('\n4. Creating payment settings...');
    const settingsResult = await query('SELECT COUNT(*) as count FROM payment_settings');
    
    if (settingsResult.rows[0].count === 0) {
      const defaultSettings = {
        defaultGateway: 'flutterwave',
        supportedGateways: ['flutterwave', 'bank_transfer'],
        currency: 'NGN',
        taxRate: 7.5,
        shippingCost: 500,
        freeShippingThreshold: 5000,
        webhookUrl: '',
        testMode: true
      };

      await query(`
        INSERT INTO payment_settings (id, settings) 
        VALUES (1, $1)
      `, [JSON.stringify(defaultSettings)]);
      
      console.log('  ✅ Created default payment settings');
    } else {
      console.log('  ⏭️  Payment settings already exist');
    }

    // 6. Verify the setup
    console.log('\n5. Verifying setup...');
    const finalGateways = await query('SELECT * FROM payment_gateways ORDER BY gateway_id');
    console.log(`Total gateways: ${finalGateways.rows.length}`);
    
    finalGateways.rows.forEach(gateway => {
      console.log(`  - ${gateway.name} (${gateway.gateway_id})`);
      console.log(`    Enabled: ${gateway.enabled}`);
      console.log(`    Test Mode: ${gateway.test_mode}`);
      console.log(`    Status: ${gateway.status}`);
      console.log(`    Public Key: ${gateway.public_key ? 'Set' : 'Not set'}`);
      console.log(`    Secret Key: ${gateway.secret_key ? 'Set' : 'Not set'}`);
      console.log('');
    });

    console.log('✅ Payment Gateways Initialization Completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to Admin Dashboard → Settings → Payment');
    console.log('2. Configure Flutterwave API keys');
    console.log('3. Enable desired gateways');
    console.log('4. Test gateway connections');

  } catch (error) {
    console.error('❌ Error initializing payment gateways:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

initPaymentGateways(); 
# Flutterwave Payment Gateway Configuration Update

## Overview

This document summarizes the updates made to the Flutterwave payment gateway configuration in the admin dashboard, including the new API keys and enhanced management interface.

## New Flutterwave Configuration

### Updated API Keys
- **Public Key**: `FLWPUBK-9856cdb89cb82f5ce5de30877c7b3a89-X`
- **Secret Key**: `FLWSECK-19415f8daa7a8fd3f74b0d71874cfad1-197781a61d6vt-X`
- **Hash Key**: `19415f8daa7ad132cd7680f7`
- **Mode**: Live (Production)
- **Status**: Active

## Changes Made

### 1. Enhanced PaymentGatewayManagement Component

#### Updated Default Configuration
```typescript
{
  id: 'flutterwave',
  name: 'Flutterwave',
  description: 'Leading payment technology company in Africa',
  icon: 'ri-global-line',
  enabled: true,
  testMode: false, // Set to false for live mode
  apiKeys: {
    publicKey: 'FLWPUBK-9856cdb89cb82f5ce5de30877c7b3a89-X',
    secretKey: 'FLWSECK-19415f8daa7a8fd3f74b0d71874cfad1-197781a61d6vt-X',
    webhookSecret: '',
    hash: '19415f8daa7ad132cd7680f7',
  },
  supportedCurrencies: ['NGN'],
  features: ['Mobile Money', 'Bank Transfers', 'Credit Cards', 'USSD', 'QR Payments'],
  status: 'active',
}
```

#### Added Hash Key Field
- New input field specifically for Flutterwave hash key
- Password-protected with show/hide toggle
- Proper validation for hash key format
- Required field validation

#### Enhanced Validation
```typescript
// Updated validation for new key formats
if (keyType === 'publicKey' && !key.startsWith('FLWPUBK-')) {
  return 'Public key should start with FLWPUBK-';
}

if (keyType === 'secretKey' && !key.startsWith('FLWSECK-')) {
  return 'Secret key should start with FLWSECK-';
}

if (keyType === 'hash' && key.length < 20) {
  return 'Hash should be at least 20 characters long';
}
```

#### Quick Update Feature
- Added "Quick Update" button for Flutterwave
- Instantly applies the new configuration
- Purple button to distinguish from other actions
- Provides immediate feedback via toast notification

### 2. Database Update Scripts

#### Direct Database Update Script
Created `update-flutterwave-config.js` for direct database updates:
- Updates existing Flutterwave gateway configuration
- Sets live mode (test_mode = false)
- Updates all API keys including hash
- Verifies the update was successful

#### API-Based Update Script
Created `update-flutterwave-via-api.js` for API-based updates:
- Uses admin authentication
- Updates via the payment settings API
- Tests connection after update
- Provides comprehensive logging

### 3. UI Enhancements

#### Hash Key Input Field
```typescript
{/* Flutterwave Hash Field */}
{gateway.id === 'flutterwave' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Hash Key {gateway.testMode && '(Test)'} *
    </label>
    <div className="relative">
      <input
        type={showApiKeys[`${gateway.id}_hash`] ? 'text' : 'password'}
        value={gateway.apiKeys.hash || ''}
        onChange={(e) => updateApiKey(gateway.id, 'hash', e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
          validationErrors[gateway.id]?.hash ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
        }`}
        placeholder="Flutterwave Hash Key"
      />
      <button
        type="button"
        onClick={() => setShowApiKeys(prev => ({ ...prev, [`${gateway.id}_hash`]: !prev[`${gateway.id}_hash`] }))}
        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
      >
        <i className={showApiKeys[`${gateway.id}_hash`] ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
      </button>
    </div>
    {validationErrors[gateway.id]?.hash && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <i className="ri-error-warning-line mr-1"></i>
        {validationErrors[gateway.id].hash}
      </p>
    )}
  </div>
)}
```

#### Quick Update Button
```typescript
{/* Quick Update Button for Flutterwave */}
{gateway.id === 'flutterwave' && (
  <button
    onClick={quickUpdateFlutterwave}
    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    title="Quick update with new Flutterwave configuration"
  >
    <i className="ri-refresh-line mr-2"></i>
    Quick Update
  </button>
)}
```

## How to Use

### Option 1: Quick Update (Recommended)
1. Navigate to Admin Dashboard → Settings → Payment Gateway Management
2. Find the Flutterwave gateway card
3. Click the purple "Quick Update" button
4. The configuration will be instantly updated with the new keys

### Option 2: Manual Update
1. Navigate to Admin Dashboard → Settings → Payment Gateway Management
2. Find the Flutterwave gateway card
3. Update the fields manually:
   - Public Key: `FLWPUBK-9856cdb89cb82f5ce5de30877c7b3a89-X`
   - Secret Key: `FLWSECK-19415f8daa7a8fd3f74b0d71874cfad1-197781a61d6vt-X`
   - Hash Key: `19415f8daa7ad132cd7680f7`
4. Set Test Mode to OFF (Live mode)
5. Click "Save Settings"

### Option 3: Script Update
1. Run the update script: `node update-flutterwave-via-api.js`
2. The script will automatically update the configuration
3. Verify the update in the admin dashboard

## Security Features

### API Key Protection
- All API keys are masked by default
- Show/hide toggle for each key field
- Proper validation for key formats
- Secure storage in database

### Validation
- Public key must start with `FLWPUBK-`
- Secret key must start with `FLWSECK-`
- Hash key must be at least 20 characters
- All fields are required for Flutterwave

### Access Control
- Admin-only access to payment gateway management
- Authentication required for all API operations
- Audit logging for configuration changes

## Testing

### Connection Test
1. After updating the configuration, click "Test Connection"
2. The system will verify the API keys with Flutterwave
3. Success/failure feedback will be displayed

### Payment Test
1. Create a test order in the checkout
2. Select Flutterwave as payment method
3. Complete the payment flow
4. Verify payment processing works correctly

## Files Modified

1. **`app/admin/PaymentGatewayManagement.tsx`**
   - Updated default Flutterwave configuration
   - Added hash key input field
   - Enhanced validation logic
   - Added quick update functionality
   - Added quick update button

2. **`update-flutterwave-config.js`** (Created)
   - Direct database update script

3. **`update-flutterwave-via-api.js`** (Created)
   - API-based update script

## Verification

After updating the configuration, verify:

1. **Admin Dashboard**: Flutterwave shows as "Active" status
2. **API Keys**: All three keys are properly set
3. **Test Mode**: Set to OFF (Live mode)
4. **Connection Test**: Passes successfully
5. **Payment Processing**: Works in checkout

## Troubleshooting

### Common Issues

1. **Connection Test Fails**
   - Verify API keys are correct
   - Check if keys are for live mode (not test)
   - Ensure hash key is properly set

2. **Validation Errors**
   - Check key formats match expected patterns
   - Ensure all required fields are filled
   - Verify hash key length is sufficient

3. **Payment Processing Issues**
   - Test with small amounts first
   - Check Flutterwave dashboard for transaction logs
   - Verify webhook configuration if using webhooks

### Support

For issues with the Flutterwave configuration:
1. Check the admin dashboard logs
2. Verify API keys in Flutterwave dashboard
3. Test connection using the admin interface
4. Contact support if issues persist

## Conclusion

The Flutterwave payment gateway has been successfully updated with the new configuration. The enhanced admin interface provides easy management of all API keys including the new hash key, with proper validation and security features. The quick update functionality allows for instant application of the new configuration. 
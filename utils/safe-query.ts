import { query } from './database';

/**
 * Safely execute a system_settings query with parameter validation
 * @param settingKey - The setting key to query
 * @returns Promise<{ success: boolean, value?: any, error?: string }>
 */
export async function safeSystemSettingsQuery(settingKey: string) {
  try {
    // Validate the setting key
    if (!settingKey || typeof settingKey !== 'string' || settingKey.trim() === '') {
      return {
        success: false,
        error: `Invalid setting key: ${settingKey}`
      };
    }

    // Execute the query with proper parameter validation
    const result = await query(
      'SELECT setting_value FROM system_settings WHERE setting_key = $1',
      [settingKey.trim()]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: `Setting not found: ${settingKey}`
      };
    }

    return {
      success: true,
      value: result.rows[0].setting_value
    };
  } catch (error) {
    console.error(`Error querying system_settings for key "${settingKey}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Safely get multiple system settings with parameter validation
 * @param settingKeys - Array of setting keys to query
 * @returns Promise<{ success: boolean, values?: Record<string, any>, errors?: string[] }>
 */
export async function safeSystemSettingsMultiQuery(settingKeys: string[]) {
  try {
    // Validate the setting keys array
    if (!Array.isArray(settingKeys) || settingKeys.length === 0) {
      return {
        success: false,
        errors: ['Invalid setting keys array']
      };
    }

    // Filter out invalid keys
    const validKeys = settingKeys.filter(key => 
      key && typeof key === 'string' && key.trim() !== ''
    );

    if (validKeys.length === 0) {
      return {
        success: false,
        errors: ['No valid setting keys provided']
      };
    }

    // Build the query with proper parameter placeholders
    const placeholders = validKeys.map((_, index) => `$${index + 1}`).join(',');
    const queryText = `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${placeholders})`;

    const result = await query(queryText, validKeys);

    const values: Record<string, any> = {};
    const errors: string[] = [];

    // Map results
    validKeys.forEach(key => {
      const row = result.rows.find(r => r.setting_key === key);
      if (row) {
        values[key] = row.setting_value;
      } else {
        errors.push(`Setting not found: ${key}`);
      }
    });

    return {
      success: errors.length === 0,
      values,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error querying multiple system_settings:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Safely update a system setting with parameter validation
 * @param settingKey - The setting key to update
 * @param settingValue - The new value
 * @returns Promise<{ success: boolean, error?: string }>
 */
export async function safeSystemSettingsUpdate(settingKey: string, settingValue: any) {
  try {
    // Validate the setting key
    if (!settingKey || typeof settingKey !== 'string' || settingKey.trim() === '') {
      return {
        success: false,
        error: `Invalid setting key: ${settingKey}`
      };
    }

    // Execute the upsert query
    const result = await query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $2, updated_at = NOW()`,
      [settingKey.trim(), settingValue]
    );

    return {
      success: true
    };
  } catch (error) {
    console.error(`Error updating system_settings for key "${settingKey}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 
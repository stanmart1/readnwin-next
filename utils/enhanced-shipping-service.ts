import { query } from '@/utils/database';

export interface ShippingZone {
  id: number;
  name: string;
  description: string;
  countries: string[];
  states: string[];
  is_active: boolean;
}

export interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  base_cost: number;
  cost_per_item: number;
  free_shipping_threshold: number | null;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  sort_order: number;
}

export interface ShippingAddress {
  id?: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  is_default?: boolean;
}

export interface ShippingCalculation {
  shipping_cost: number;
  free_shipping_threshold?: number;
  estimated_days: string;
  available_methods: ShippingMethod[];
}

export class EnhancedShippingService {
  
  /**
   * Get all active shipping methods
   */
  async getShippingMethods(): Promise<ShippingMethod[]> {
    try {
      const result = await query(`
        SELECT * FROM shipping_methods 
        WHERE is_active = true 
        ORDER BY sort_order ASC, name ASC
      `);
      
      return result.rows.map(row => ({
        ...row,
        base_cost: Number(row.base_cost) || 0,
        cost_per_item: Number(row.cost_per_item) || 0,
        free_shipping_threshold: row.free_shipping_threshold ? Number(row.free_shipping_threshold) : null
      }));
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      return [];
    }
  }

  /**
   * Get shipping methods available for a specific zone
   */
  async getShippingMethodsForZone(zoneId: number): Promise<ShippingMethod[]> {
    try {
      const result = await query(`
        SELECT sm.* FROM shipping_methods sm
        INNER JOIN shipping_method_zones smz ON sm.id = smz.shipping_method_id
        WHERE smz.shipping_zone_id = $1 
        AND smz.is_available = true 
        AND sm.is_active = true
        ORDER BY sm.sort_order ASC, sm.name ASC
      `, [zoneId]);
      
      return result.rows.map(row => ({
        ...row,
        base_cost: Number(row.base_cost) || 0,
        cost_per_item: Number(row.cost_per_item) || 0,
        free_shipping_threshold: row.free_shipping_threshold ? Number(row.free_shipping_threshold) : null
      }));
    } catch (error) {
      console.error('Error fetching shipping methods for zone:', error);
      return [];
    }
  }

  /**
   * Get all shipping zones
   */
  async getShippingZones(): Promise<ShippingZone[]> {
    try {
      const result = await query(`
        SELECT * FROM shipping_zones 
        WHERE is_active = true 
        ORDER BY name ASC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching shipping zones:', error);
      return [];
    }
  }

  /**
   * Determine shipping zone based on address
   */
  async getShippingZoneForAddress(address: ShippingAddress): Promise<ShippingZone | null> {
    try {
      const result = await query(`
        SELECT * FROM shipping_zones 
        WHERE is_active = true 
        AND (
          $1 = ANY(countries) 
          OR $2 = ANY(states)
        )
        ORDER BY 
          CASE WHEN $2 = ANY(states) THEN 1 ELSE 2 END,
          name ASC
        LIMIT 1
      `, [address.country, address.state]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error determining shipping zone:', error);
      return null;
    }
  }

  /**
   * Calculate shipping cost for a specific method and cart
   */
  async calculateShippingCost(
    methodId: number, 
    cartSubtotal: number, 
    itemCount: number
  ): Promise<number> {
    try {
      const result = await query(`
        SELECT * FROM shipping_methods WHERE id = $1 AND is_active = true
      `, [methodId]);
      
      if (!result.rows[0]) {
        return 0;
      }
      
      const method = result.rows[0];
      const baseCost = Number(method.base_cost) || 0;
      const perItemCost = Number(method.cost_per_item) || 0;
      const freeThreshold = method.free_shipping_threshold ? Number(method.free_shipping_threshold) : null;
      
      // Check if free shipping threshold is met
      if (freeThreshold && cartSubtotal >= freeThreshold) {
        return 0;
      }
      
      // Calculate shipping cost
      const shippingCost = baseCost + (perItemCost * itemCount);
      return Math.max(0, shippingCost);
      
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      return 0;
    }
  }

  /**
   * Get complete shipping calculation for checkout
   */
  async getShippingCalculation(
    address: ShippingAddress,
    cartSubtotal: number,
    itemCount: number
  ): Promise<ShippingCalculation | null> {
    try {
      // Determine shipping zone
      const zone = await this.getShippingZoneForAddress(address);
      if (!zone) {
        return null;
      }
      
      // Get available methods for this zone
      const methods = await this.getShippingMethodsForZone(zone.id);
      if (methods.length === 0) {
        return null;
      }
      
      // Calculate shipping cost for the first method (default)
      const defaultMethod = methods[0];
      const shippingCost = await this.calculateShippingCost(
        defaultMethod.id, 
        cartSubtotal, 
        itemCount
      );
      
      return {
        shipping_cost: shippingCost,
        free_shipping_threshold: defaultMethod.free_shipping_threshold || undefined,
        estimated_days: `${defaultMethod.estimated_days_min}-${defaultMethod.estimated_days_max} business days`,
        available_methods: methods
      };
      
    } catch (error) {
      console.error('Error getting shipping calculation:', error);
      return null;
    }
  }

  /**
   * Save user shipping address
   */
  async saveUserShippingAddress(userId: number, address: ShippingAddress): Promise<number> {
    try {
      // If this is the first address, make it default
      const existingAddresses = await query(`
        SELECT COUNT(*) FROM user_shipping_addresses WHERE user_id = $1
      `, [userId]);
      
      const isDefault = existingAddresses.rows[0].count === '0' || address.is_default;
      
      // If making this default, unset other defaults
      if (isDefault) {
        await query(`
          UPDATE user_shipping_addresses 
          SET is_default = false 
          WHERE user_id = $1
        `, [userId]);
      }
      
      const result = await query(`
        INSERT INTO user_shipping_addresses (
          user_id, first_name, last_name, email, phone, 
          address_line_1, address_line_2, city, state, 
          postal_code, country, is_default
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        userId,
        address.first_name,
        address.last_name,
        address.email,
        address.phone,
        address.address_line_1,
        address.address_line_2 || '',
        address.city,
        address.state,
        address.postal_code || '',
        address.country,
        isDefault
      ]);
      
      return result.rows[0].id;
      
    } catch (error) {
      console.error('Error saving shipping address:', error);
      throw new Error('Failed to save shipping address');
    }
  }

  /**
   * Get user's shipping addresses
   */
  async getUserShippingAddresses(userId: number): Promise<ShippingAddress[]> {
    try {
      const result = await query(`
        SELECT * FROM user_shipping_addresses 
        WHERE user_id = $1 AND is_active = true
        ORDER BY is_default DESC, created_at DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching user shipping addresses:', error);
      return [];
    }
  }

  /**
   * Get user's default shipping address
   */
  async getUserDefaultShippingAddress(userId: number): Promise<ShippingAddress | null> {
    try {
      const result = await query(`
        SELECT * FROM user_shipping_addresses 
        WHERE user_id = $1 AND is_default = true AND is_active = true
        LIMIT 1
      `, [userId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching default shipping address:', error);
      return null;
    }
  }

  /**
   * Update shipping address
   */
  async updateShippingAddress(addressId: number, address: Partial<ShippingAddress>): Promise<boolean> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      // Build dynamic update query
      Object.entries(address).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });
      
      if (updateFields.length === 0) {
        return false;
      }
      
      values.push(addressId);
      
      await query(`
        UPDATE user_shipping_addresses 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
      `, values);
      
      return true;
      
    } catch (error) {
      console.error('Error updating shipping address:', error);
      return false;
    }
  }

  /**
   * Delete shipping address
   */
  async deleteShippingAddress(addressId: number, userId: number): Promise<boolean> {
    try {
      await query(`
        DELETE FROM user_shipping_addresses 
        WHERE id = $1 AND user_id = $2
      `, [addressId, userId]);
      
      return true;
      
    } catch (error) {
      console.error('Error deleting shipping address:', error);
      return false;
    }
  }
}

export const enhancedShippingService = new EnhancedShippingService();

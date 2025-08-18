import { query, transaction } from './database';

export interface BankTransfer {
  id: number;
  order_id: number;
  user_id: number;
  transaction_reference: string;
  amount: number;
  currency: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  payment_date?: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  admin_notes?: string;
  verified_by?: number;
  verified_at?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentProof {
  id: number;
  bank_transfer_id: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  upload_date: string;
  is_verified: boolean;
  verified_by?: number;
  verified_at?: string;
  admin_notes?: string;
}

export interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  account_type: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BankTransferNotification {
  id: number;
  bank_transfer_id: number;
  user_id: number;
  type: 'initiated' | 'proof_uploaded' | 'verified' | 'rejected' | 'expired';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

class BankTransferService {
  /**
   * Create a new bank transfer transaction
   */
  async createBankTransfer(
    orderId: number, 
    userId: number, 
    amount: number, 
    currency: string = 'NGN'
  ): Promise<BankTransfer> {
    const transactionRef = this.generateTransactionReference();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    const result = await query(`
      INSERT INTO bank_transfers (
        order_id, user_id, transaction_reference, amount, currency, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [orderId, userId, transactionRef, amount, currency, expiresAt]);

    const bankTransfer = result.rows[0];

    // Create notification
    await this.createNotification(
      bankTransfer.id,
      userId,
      'initiated',
      'Bank Transfer Initiated',
      `Your bank transfer of ${currency} ${amount.toLocaleString()} has been initiated. Please complete the transfer within 24 hours.`
    );

    return bankTransfer;
  }

  /**
   * Get bank transfer by ID
   */
  async getBankTransfer(id: number): Promise<BankTransfer | null> {
    const result = await query(`
      SELECT * FROM bank_transfers WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get bank transfer by transaction reference
   */
  async getBankTransferByReference(reference: string): Promise<BankTransfer | null> {
    const result = await query(`
      SELECT * FROM bank_transfers WHERE transaction_reference = $1
    `, [reference]);
    return result.rows[0] || null;
  }

  /**
   * Get bank transfers by user ID
   */
  async getUserBankTransfers(userId: number, page: number = 1, limit: number = 20): Promise<{
    transfers: BankTransfer[];
    total: number;
    pages: number;
  }> {
    const offset = (page - 1) * limit;

    const countResult = await query(`
      SELECT COUNT(*) as total FROM bank_transfers WHERE user_id = $1
    `, [userId]);

    const transfersResult = await query(`
      SELECT * FROM bank_transfers 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return {
      transfers: transfersResult.rows,
      total,
      pages
    };
  }

  /**
   * Get all bank transfers (admin)
   */
  async getAllBankTransfers(
    filters: any = {}, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    transfers: BankTransfer[];
    total: number;
    pages: number;
  }> {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.user_id) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(filters.user_id);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`
      SELECT COUNT(*) as total FROM bank_transfers ${whereClause}
    `, params);

    const transfersResult = await query(`
      SELECT bt.*, u.name as user_name, u.email as user_email, o.order_number
      FROM bank_transfers bt
      LEFT JOIN users u ON bt.user_id = u.id
      LEFT JOIN orders o ON bt.order_id = o.id
      ${whereClause}
      ORDER BY bt.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return {
      transfers: transfersResult.rows,
      total,
      pages
    };
  }

  /**
   * Update bank transfer status
   */
  async updateBankTransferStatus(
    id: number, 
    status: BankTransfer['status'], 
    adminUserId?: number,
    notes?: string
  ): Promise<BankTransfer | null> {
    const result = await query(`
      UPDATE bank_transfers 
      SET status = $2, admin_notes = $3, verified_by = $4, verified_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, status, notes, adminUserId]);

    const bankTransfer = result.rows[0];
    if (bankTransfer) {
      // Create notification
      const notificationType = status === 'verified' ? 'verified' : 
                              status === 'rejected' ? 'rejected' : 'expired';
      
      const title = status === 'verified' ? 'Payment Verified' :
                   status === 'rejected' ? 'Payment Rejected' : 'Payment Expired';
      
      const message = status === 'verified' ? 'Your bank transfer has been verified. Your order is being processed.' :
                     status === 'rejected' ? 'Your bank transfer was rejected. Please contact support.' :
                     'Your bank transfer has expired. Please initiate a new payment.';

      await this.createNotification(
        bankTransfer.id,
        bankTransfer.user_id,
        notificationType,
        title,
        message
      );
    }

    return bankTransfer || null;
  }

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(
    bankTransferId: number,
    fileName: string,
    filePath: string,
    fileSize?: number,
    fileType?: string
  ): Promise<PaymentProof> {
    const result = await query(`
      INSERT INTO payment_proofs (
        bank_transfer_id, file_name, file_path, file_size, file_type
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [bankTransferId, fileName, filePath, fileSize, fileType]);

    const proof = result.rows[0];

    // Get bank transfer details for notification
    const bankTransfer = await this.getBankTransfer(bankTransferId);
    if (bankTransfer) {
      await this.createNotification(
        bankTransferId,
        bankTransfer.user_id,
        'proof_uploaded',
        'Proof of Payment Uploaded',
        'Your proof of payment has been uploaded and is being reviewed.'
      );
    }

    return proof;
  }

  /**
   * Get payment proofs for a bank transfer
   */
  async getPaymentProofs(bankTransferId: number): Promise<PaymentProof[]> {
    const result = await query(`
      SELECT * FROM payment_proofs 
      WHERE bank_transfer_id = $1 
      ORDER BY upload_date DESC
    `, [bankTransferId]);
    return result.rows;
  }

  /**
   * Get bank accounts
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    const result = await query(`
      SELECT * FROM bank_accounts 
      WHERE is_active = true 
      ORDER BY is_default DESC, sort_order ASC
    `);
    return result.rows;
  }

  /**
   * Get default bank account
   */
  async getDefaultBankAccount(): Promise<BankAccount | null> {
    const result = await query(`
      SELECT * FROM bank_accounts 
      WHERE is_default = true AND is_active = true 
      LIMIT 1
    `);
    return result.rows[0] || null;
  }

  /**
   * Create notification
   */
  async createNotification(
    bankTransferId: number,
    userId: number,
    type: BankTransferNotification['type'],
    title: string,
    message: string
  ): Promise<BankTransferNotification> {
    const result = await query(`
      INSERT INTO bank_transfer_notifications (
        bank_transfer_id, user_id, type, title, message
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [bankTransferId, userId, type, title, message]);
    return result.rows[0];
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: number, limit: number = 10): Promise<BankTransferNotification[]> {
    const result = await query(`
      SELECT * FROM bank_transfer_notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [userId, limit]);
    return result.rows;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: number): Promise<void> {
    await query(`
      UPDATE bank_transfer_notifications 
      SET is_read = true 
      WHERE id = $1
    `, [notificationId]);
  }

  /**
   * Clean up expired transfers
   */
  async cleanupExpiredTransfers(): Promise<number> {
    const result = await query(`
      UPDATE bank_transfers 
      SET status = 'expired' 
      WHERE status = 'pending' AND expires_at < CURRENT_TIMESTAMP
    `);
    return result.rowCount;
  }

  /**
   * Generate unique transaction reference
   */
  private generateTransactionReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BT-${timestamp}-${random}`;
  }
}

export const bankTransferService = new BankTransferService(); 
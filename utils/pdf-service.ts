import * as puppeteer from 'puppeteer';

export interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: Array<{
    title: string;
    author: string;
    format: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
}

export interface ReceiptData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    title: string;
    author: string;
    format: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
}

export class PDFService {
  private browser: puppeteer.Browser | null = null;

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      console.log('Launching Puppeteer browser...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      console.log('Puppeteer browser launched successfully');
    }
    return this.browser;
  }

  private generateInvoiceHTML(data: InvoiceData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${data.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
          }
          
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3B82F6;
            margin-bottom: 10px;
          }
          
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 5px;
          }
          
          .invoice-number {
            font-size: 16px;
            color: #6B7280;
          }
          
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          
          .customer-info, .invoice-info {
            flex: 1;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 5px;
          }
          
          .info-row {
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            color: #6B7280;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .items-table th {
            background-color: #F3F4F6;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #374151;
            border-bottom: 2px solid #E5E7EB;
          }
          
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 14px;
          }
          
          .items-table tr:nth-child(even) {
            background-color: #F9FAFB;
          }
          
          .format-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .format-ebook {
            background-color: #DBEAFE;
            color: #1E40AF;
          }
          
          .format-physical {
            background-color: #FEF3C7;
            color: #92400E;
          }
          
          .totals-section {
            margin-left: auto;
            width: 300px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          
          .total-row.grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #1F2937;
            border-top: 2px solid #E5E7EB;
            padding-top: 15px;
            margin-top: 10px;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6B7280;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-paid {
            background-color: #D1FAE5;
            color: #065F46;
          }
          
          .status-pending {
            background-color: #FEF3C7;
            color: #92400E;
          }
          
          .status-failed {
            background-color: #FEE2E2;
            color: #991B1B;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">📚 ReadnWin</div>
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">#${data.orderNumber}</div>
        </div>
        
        <div class="invoice-details">
          <div class="customer-info">
            <div class="section-title">Bill To:</div>
            <div class="info-row">
              <span class="info-label">Name:</span> ${data.customerName}
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span> ${data.customerEmail}
            </div>
            <div class="info-row">
              <span class="info-label">Address:</span> ${data.customerAddress}
            </div>
          </div>
          
          <div class="invoice-info">
            <div class="section-title">Invoice Details:</div>
            <div class="info-row">
              <span class="info-label">Invoice Date:</span> ${data.orderDate}
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span> ${data.paymentMethod}
            </div>
            <div class="info-row">
              <span class="info-label">Transaction ID:</span> ${data.transactionId}
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span> 
              <span class="status-badge status-${data.status.toLowerCase()}">${data.status}</span>
            </div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Author</th>
              <th>Format</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.author}</td>
                <td>
                  <span class="format-badge format-${item.format.toLowerCase()}">${item.format}</span>
                </td>
                <td>${item.quantity}</td>
                <td>₦${item.unitPrice.toLocaleString()}</td>
                <td>₦${item.totalPrice.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₦${data.subtotal.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>₦${data.taxAmount.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>₦${data.shippingAmount.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Discount:</span>
            <span>-₦${data.discountAmount.toLocaleString()}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>₦${data.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>© 2025 ReadnWin. All rights reserved.</p>
          <p>For support, contact us at support@readnwin.com</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateReceiptHTML(data: ReceiptData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt - ${data.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #10B981;
            padding-bottom: 20px;
          }
          
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #10B981;
            margin-bottom: 10px;
          }
          
          .receipt-title {
            font-size: 28px;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 5px;
          }
          
          .receipt-number {
            font-size: 16px;
            color: #6B7280;
          }
          
          .receipt-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          
          .customer-info, .receipt-info {
            flex: 1;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 5px;
          }
          
          .info-row {
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            color: #6B7280;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .items-table th {
            background-color: #F3F4F6;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #374151;
            border-bottom: 2px solid #E5E7EB;
          }
          
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 14px;
          }
          
          .items-table tr:nth-child(even) {
            background-color: #F9FAFB;
          }
          
          .format-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .format-ebook {
            background-color: #DBEAFE;
            color: #1E40AF;
          }
          
          .format-physical {
            background-color: #FEF3C7;
            color: #92400E;
          }
          
          .totals-section {
            margin-left: auto;
            width: 300px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          
          .total-row.grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #1F2937;
            border-top: 2px solid #E5E7EB;
            padding-top: 15px;
            margin-top: 10px;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6B7280;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-paid {
            background-color: #D1FAE5;
            color: #065F46;
          }
          
          .status-pending {
            background-color: #FEF3C7;
            color: #92400E;
          }
          
          .status-failed {
            background-color: #FEE2E2;
            color: #991B1B;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">📚 ReadnWin</div>
          <div class="receipt-title">RECEIPT</div>
          <div class="receipt-number">#${data.orderNumber}</div>
        </div>
        
        <div class="receipt-details">
          <div class="customer-info">
            <div class="section-title">Customer:</div>
            <div class="info-row">
              <span class="info-label">Name:</span> ${data.customerName}
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span> ${data.customerEmail}
            </div>
          </div>
          
          <div class="receipt-info">
            <div class="section-title">Receipt Details:</div>
            <div class="info-row">
              <span class="info-label">Date:</span> ${data.orderDate}
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span> ${data.paymentMethod}
            </div>
            <div class="info-row">
              <span class="info-label">Transaction ID:</span> ${data.transactionId}
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span> 
              <span class="status-badge status-${data.status.toLowerCase()}">${data.status}</span>
            </div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Author</th>
              <th>Format</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.author}</td>
                <td>
                  <span class="format-badge format-${item.format.toLowerCase()}">${item.format}</span>
                </td>
                <td>${item.quantity}</td>
                <td>₦${item.unitPrice.toLocaleString()}</td>
                <td>₦${item.totalPrice.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₦${data.subtotal.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>₦${data.taxAmount.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>₦${data.shippingAmount.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Discount:</span>
            <span>-₦${data.discountAmount.toLocaleString()}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>₦${data.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>© 2025 ReadnWin. All rights reserved.</p>
          <p>For support, contact us at support@readnwin.com</p>
        </div>
      </body>
      </html>
    `;
  }

  async generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    try {
      console.log('Starting invoice PDF generation...');
    const browser = await this.getBrowser();
      console.log('Browser obtained, creating new page...');
      
    const page = await browser.newPage();
      console.log('Page created, setting content...');
    
    const html = this.generateInvoiceHTML(data);
    await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('Content set, generating PDF...');
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
      console.log('PDF generated, closing page...');
    await page.close();
      console.log('Invoice PDF generation completed successfully');
      return Buffer.from(pdf);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  async generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
    try {
      console.log('Starting receipt PDF generation...');
    const browser = await this.getBrowser();
      console.log('Browser obtained, creating new page...');
      
    const page = await browser.newPage();
      console.log('Page created, setting content...');
    
    const html = this.generateReceiptHTML(data);
    await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('Content set, generating PDF...');
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
      console.log('PDF generated, closing page...');
    await page.close();
      console.log('Receipt PDF generation completed successfully');
      return Buffer.from(pdf);
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('Closing Puppeteer browser...');
      await this.browser.close();
      this.browser = null;
      console.log('Puppeteer browser closed');
    }
  }
}

export const pdfService = new PDFService(); 
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { query } from "./database";
import { emailTemplateService } from "./email-template-service";

// Email gateway configuration interface
interface EmailGatewayConfig {
  id: string;
  name: string;
  type: "resend" | "smtp";
  isActive: boolean;
  fromEmail?: string;
  fromName?: string;
  // SMTP specific fields
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  // Resend specific fields
  resendApiKey?: string;
  resendDomain?: string;
}

// Get email gateway configuration from database
async function getEmailGatewayConfig(): Promise<EmailGatewayConfig | null> {
  try {
    const result = await query(`
      SELECT
        setting_key,
        setting_value
      FROM system_settings
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);

    // Get active gateway
    const activeGatewayResult = await query(`
      SELECT setting_value FROM system_settings
      WHERE setting_key = 'email_gateway_active'
    `);

    const activeGateway =
      activeGatewayResult.rows[0]?.setting_value || "resend";

    // Build gateway config
    const gatewayConfig: EmailGatewayConfig = {
      id: activeGateway,
      name: activeGateway === "resend" ? "Resend" : "SMTP Server",
      type: activeGateway as "resend" | "smtp",
      isActive: false,
      fromEmail: "noreply@readnwin.com",
      fromName: "ReadnWin",
    };

    // Map settings to config
    result.rows.forEach((row: any) => {
      const key = row.setting_key;
      const value = row.setting_value;

      if (key.startsWith(`email_gateway_${activeGateway}_`)) {
        const field = key.replace(`email_gateway_${activeGateway}_`, "");

        if (field === "is_active") {
          gatewayConfig.isActive = value === "true";
        } else if (field === "from_email") {
          gatewayConfig.fromEmail = value;
        } else if (field === "from_name") {
          gatewayConfig.fromName = value;
        } else if (activeGateway === "resend") {
          if (field === "api_key") {
            // Use database API key (admin configuration takes priority)
            gatewayConfig.resendApiKey = value;
          } else if (field === "domain") {
            gatewayConfig.resendDomain = value;
          }
        } else if (activeGateway === "smtp") {
          if (field === "host") {
            gatewayConfig.smtpHost = value;
          } else if (field === "port") {
            gatewayConfig.smtpPort = parseInt(value);
          } else if (field === "username") {
            gatewayConfig.smtpUsername = value;
          } else if (field === "password") {
            gatewayConfig.smtpPassword = value;
          } else if (field === "secure") {
            gatewayConfig.smtpSecure = value === "true";
          }
        }
      }
    });

    // Ensure the gateway is active if it has the required configuration
    if (activeGateway === "resend" && gatewayConfig.resendApiKey) {
      gatewayConfig.isActive = true;
    } else if (
      activeGateway === "smtp" &&
      gatewayConfig.smtpHost &&
      gatewayConfig.smtpUsername &&
      gatewayConfig.smtpPassword
    ) {
      gatewayConfig.isActive = true;
    }

    return gatewayConfig.isActive ? gatewayConfig : null;
  } catch (error) {
    console.error("Error loading email gateway config:", error);
    return null;
  }
}

// Fallback Resend configuration (for backward compatibility)
const fallbackResend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Helper function to create SMTP transporter with consistent configuration
function createSMTPTransporter(config: EmailGatewayConfig) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort || 587,
    secure: config.smtpSecure || false,
    auth: {
      user: config.smtpUsername,
      pass: config.smtpPassword,
    },
    // Additional options for better compatibility
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
    // Connection timeout
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

// Email templates
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Email verification template
export const getEmailVerificationTemplate = (
  userName: string,
  verificationToken: string,
): EmailTemplate => ({
  subject: "Verify Your ReadnWin Account ✉️",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Account ✉️</h1>
          <p>One step away from joining ReadnWin!</p>
        </div>
        <div class="content">
          <h2>Hello ${userName}! 👋</h2>
          <p>Thank you for signing up for ReadnWin! To complete your registration and start your reading journey, please verify your email address by clicking the button below.</p>

          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || "https://readnwin.com"}/api/auth/verify-email?token=${verificationToken}" class="button">Verify My Email Address</a>
          </div>

          <div class="warning">
            <strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification link.
          </div>

          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6B7280; font-size: 14px;">${process.env.NEXTAUTH_URL || "https://readnwin.com"}/api/auth/verify-email?token=${verificationToken}</p>

          <p>If you didn't create an account with ReadnWin, you can safely ignore this email.</p>

          <p>Best regards,<br>The ReadnWin Team</p>
        </div>
        <div class="footer">
          <p>© 2025 ReadnWin. All rights reserved.</p>
          <p>This email was sent to you because you signed up for ReadnWin.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Verify Your ReadnWin Account ✉️

    Hello ${userName}! 👋

    Thank you for signing up for ReadnWin! To complete your registration and start your reading journey, please verify your email address by clicking the link below.

    Verify your email: ${process.env.NEXTAUTH_URL || "https://readnwin.com"}/api/auth/verify-email?token=${verificationToken}

    Important: This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification link.

    If you didn't create an account with ReadnWin, you can safely ignore this email.

    Best regards,
    The ReadnWin Team

    © 2025 ReadnWin. All rights reserved.
  `,
});

// Enhanced welcome email template with more useful information
export const getWelcomeEmailTemplate = (userName: string): EmailTemplate => ({
  subject: "Welcome to ReadnWin! 📚 Your Reading Journey Begins",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ReadnWin</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .feature-box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; margin: 15px 0; }
        .tip { background: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ReadnWin! 📚</h1>
          <p>Your journey to better reading starts here</p>
        </div>
        <div class="content">
          <h2>Hello ${userName}! 👋</h2>
          <p>Welcome to ReadnWin, your ultimate destination for digital reading and learning. We're excited to have you join our community of book lovers!</p>

          <div class="feature-box">
            <h3>🚀 Getting Started - Quick Guide</h3>
            <p><strong>1. Explore Our Library:</strong> Browse thousands of books across all genres</p>
            <p><strong>2. Set Reading Goals:</strong> Track your progress and stay motivated</p>
            <p><strong>3. Use Our E-Reader:</strong> Enjoy a seamless reading experience on any device</p>
            <p><strong>4. Join Discussions:</strong> Connect with fellow readers and share insights</p>
          </div>

          <div class="feature-box">
            <h3>💡 Pro Tips for Maximum Enjoyment</h3>
            <ul>
              <li><strong>Personalize Your Experience:</strong> Update your profile with your favorite genres</li>
              <li><strong>Set Daily Reading Goals:</strong> Even 15 minutes a day can transform your reading habit</li>
              <li><strong>Use Bookmarks & Notes:</strong> Save important passages and add your thoughts</li>
              <li><strong>Explore Recommendations:</strong> Our AI suggests books based on your reading history</li>
              <li><strong>Join Reading Challenges:</strong> Participate in monthly reading challenges for rewards</li>
            </ul>
          </div>

          <div class="tip">
            <strong>💡 Quick Tip:</strong> Enable notifications to get personalized book recommendations and reading reminders!
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || "https://readnwin.com"}/dashboard" class="button">Start Your Reading Journey</a>
          </div>

          <h3>📱 Available Everywhere</h3>
          <p>Read on your computer, tablet, or phone. Your progress syncs across all devices, so you can pick up right where you left off.</p>

          <h3>🎯 Track Your Progress</h3>
          <p>Monitor your reading statistics, set goals, and celebrate milestones. Our dashboard gives you insights into your reading habits and helps you stay motivated.</p>

          <h3>🤝 Need Help?</h3>
          <p>Our support team is here to help! If you have any questions or need assistance, don't hesitate to reach out.</p>

          <p>Happy reading! 📖<br>The ReadnWin Team</p>
        </div>
        <div class="footer">
          <p>© 2025 ReadnWin. All rights reserved.</p>
          <p>This email was sent to you because you signed up for ReadnWin.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Welcome to ReadnWin! 📚 Your Reading Journey Begins

    Hello ${userName}! 👋

    Welcome to ReadnWin, your ultimate destination for digital reading and learning. We're excited to have you join our community of book lovers!

    🚀 Getting Started - Quick Guide:
    1. Explore Our Library: Browse thousands of books across all genres
    2. Set Reading Goals: Track your progress and stay motivated
    3. Use Our E-Reader: Enjoy a seamless reading experience on any device
    4. Join Discussions: Connect with fellow readers and share insights

    💡 Pro Tips for Maximum Enjoyment:
    - Personalize Your Experience: Update your profile with your favorite genres
    - Set Daily Reading Goals: Even 15 minutes a day can transform your reading habit
    - Use Bookmarks & Notes: Save important passages and add your thoughts
    - Explore Recommendations: Our AI suggests books based on your reading history
    - Join Reading Challenges: Participate in monthly reading challenges for rewards

    💡 Quick Tip: Enable notifications to get personalized book recommendations and reading reminders!

    Start your reading journey: ${process.env.NEXTAUTH_URL || "https://readnwin.com"}/dashboard

    📱 Available Everywhere
    Read on your computer, tablet, or phone. Your progress syncs across all devices, so you can pick up right where you left off.

    🎯 Track Your Progress
    Monitor your reading statistics, set goals, and celebrate milestones. Our dashboard gives you insights into your reading habits and helps you stay motivated.

    🤝 Need Help?
    Our support team is here to help! If you have any questions or need assistance, don't hesitate to reach out.

    Happy reading! 📖
    The ReadnWin Team

    © 2025 ReadnWin. All rights reserved.
  `,
});

// Password reset email template
export const getPasswordResetEmailTemplate = (
  resetToken: string,
  userName: string,
): EmailTemplate => ({
  subject: "Reset Your ReadnWin Password 🔐",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password 🔐</h1>
          <p>Secure your ReadnWin account</p>
        </div>
        <div class="content">
          <h2>Hello ${userName}! 👋</h2>
          <p>We received a request to reset your password for your ReadnWin account. If you didn't make this request, you can safely ignore this email.</p>

          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || "https://readnwin.com"}/reset-password?token=${resetToken}" class="button">Reset Password</a>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>Never share this link with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3B82F6;">${process.env.NEXTAUTH_URL || "https://readnwin.com"}/reset-password?token=${resetToken}</p>

          <p>Best regards,<br>The ReadnWin Security Team</p>
        </div>
        <div class="footer">
          <p>© 2025 ReadnWin. All rights reserved.</p>
          <p>This email was sent to you because you requested a password reset.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Reset Your ReadnWin Password 🔐

    Hello ${userName}! 👋

    We received a request to reset your password for your ReadnWin account. If you didn't make this request, you can safely ignore this email.

    Reset your password: ${process.env.NEXTAUTH_URL || "https://readnwin.com"}/reset-password?token=${resetToken}

    ⚠️ Security Notice:
    - This link will expire in 1 hour
    - Never share this link with anyone
    - If you didn't request this, please ignore this email

    If the link doesn't work, copy and paste this URL into your browser:
    ${process.env.NEXTAUTH_URL || "https://readnwin.com"}/reset-password?token=${resetToken}

    Best regards,
    The ReadnWin Security Team

    © 2025 ReadnWin. All rights reserved.
  `,
});

// Order confirmation email template
export const getOrderConfirmationEmailTemplate = (
  orderDetails: any,
  userName: string,
): EmailTemplate => ({
  subject: "Order Confirmed - Thank You for Your Purchase! 📦",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .order-item { border: 1px solid #E5E7EB; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .total { font-weight: bold; font-size: 18px; border-top: 2px solid #E5E7EB; padding-top: 15px; margin-top: 15px; }
        .button { display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed! 📦</h1>
          <p>Thank you for your purchase</p>
        </div>
        <div class="content">
          <h2>Hello ${userName}! 👋</h2>
          <p>Your order has been successfully confirmed and is being processed. Here are your order details:</p>

          <h3>Order Summary:</h3>
          ${orderDetails.items
            ?.map(
              (item: any) => `
            <div class="order-item">
              <strong>${item.title}</strong> by ${item.author}<br>
              <span style="color: #6B7280;">Quantity: ${item.quantity}</span><br>
              <span style="color: #059669; font-weight: bold;">$${item.price}</span>
            </div>
          `,
            )
            .join("")}

          <div class="total">
            <strong>Total: $${orderDetails.total}</strong>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || "https://readnwin.com"}/dashboard" class="button">View Your Library</a>
          </div>

          <p>Your books are now available in your digital library. You can start reading immediately!</p>

          <p>If you have any questions about your order, please don't hesitate to contact our support team.</p>

          <p>Happy reading!<br>The ReadnWin Team</p>
        </div>
        <div class="footer">
          <p>© 2025 ReadnWin. All rights reserved.</p>
          <p>Order ID: ${orderDetails.orderId}</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Order Confirmed! 📦

    Hello ${userName}! 👋

    Your order has been successfully confirmed and is being processed. Here are your order details:

    Order Summary:
    ${orderDetails.items?.map((item: any) => `- ${item.title} by ${item.author} (Qty: ${item.quantity}) - $${item.price}`).join("\n")}

    Total: $${orderDetails.total}

    View your library: ${process.env.NEXTAUTH_URL || "https://readnwin.com"}/dashboard

    Your books are now available in your digital library. You can start reading immediately!

    If you have any questions about your order, please don't hesitate to contact our support team.

    Happy reading!
    The ReadnWin Team

    © 2025 ReadnWin. All rights reserved.
    Order ID: ${orderDetails.orderId}
  `,
});

// Email confirmation template (sent after successful verification)
export const getEmailConfirmationTemplate = (
  userName: string,
): EmailTemplate => ({
  subject: "Email Confirmed! Welcome to ReadnWin 🎉",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Confirmed - Welcome to ReadnWin</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .success-box { background: #ECFDF5; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Confirmed! 🎉</h1>
          <p>Your ReadnWin account is now active</p>
        </div>
        <div class="content">
          <div class="success-box">
            <h2>Congratulations ${userName}! 👋</h2>
            <p>Your email address has been successfully verified and your ReadnWin account is now fully activated!</p>
          </div>

          <p>You can now access all the features of ReadnWin and start your reading journey. Here's what you can do next:</p>

          <ul>
            <li>📚 Browse our extensive library of books</li>
            <li>🎯 Set up your reading goals and preferences</li>
            <li>📱 Start reading on any device</li>
            <li>💡 Discover personalized recommendations</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || "https://readnwin.com"}/dashboard" class="button">Start Reading Now</a>
          </div>

          <p>If you have any questions or need assistance, our support team is here to help!</p>

          <p>Happy reading! 📖<br>The ReadnWin Team</p>
        </div>
        <div class="footer">
          <p>© 2025 ReadnWin. All rights reserved.</p>
          <p>This email was sent to confirm your email verification.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Email Confirmed! Welcome to ReadnWin 🎉

    Congratulations ${userName}! 👋

    Your email address has been successfully verified and your ReadnWin account is now fully activated!

    You can now access all the features of ReadnWin and start your reading journey. Here's what you can do next:

    - 📚 Browse our extensive library of books
    - 🎯 Set up your reading goals and preferences
    - 📱 Start reading on any device
    - 💡 Discover personalized recommendations

    Start reading now: https://readnwin.com/dashboard

    If you have any questions or need assistance, our support team is here to help!

    Happy reading! 📖
    The ReadnWin Team

    © 2025 ReadnWin. All rights reserved.
  `,
});

// Email sending functions
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  userId?: number,
) => {
  try {
    // Generate welcome token if userId is provided
    let welcomeToken = "";
    if (userId) {
      const jwt = require("jsonwebtoken");
      welcomeToken = jwt.sign(
        { userId, type: "welcome" },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" },
      );
    }

    // Use the new function-based email system
    const variables = {
      userName: userName,
      userEmail: userEmail,
      welcomeToken: welcomeToken,
      welcomeUrl: welcomeToken
        ? `${process.env.NEXTAUTH_URL || "https://readnwin.com"}/api/auth/welcome-link?token=${welcomeToken}&redirect=/dashboard`
        : `${process.env.NEXTAUTH_URL || "https://readnwin.com"}/dashboard`,
    };

    const result = await sendFunctionEmail(userEmail, "welcome", variables);
    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (
  userEmail: string,
  resetToken: string,
  userName: string,
) => {
  try {
    // Use the new function-based email system
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    const variables = {
      userName: userName,
      resetToken: resetToken,
      resetUrl: resetUrl,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "password-reset",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
};

export const sendOrderConfirmationEmail = async (
  userEmail: string,
  orderDetails: any,
  userName: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      orderNumber: orderDetails.orderId || orderDetails.orderNumber,
      orderTotal: orderDetails.total || orderDetails.orderTotal,
      orderItems: orderDetails.items || [],
    };

    const result = await sendFunctionEmail(
      userEmail,
      "order-confirmation",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error };
  }
};

export const sendOrderShippedEmail = async (
  userEmail: string,
  orderDetails: any,
  userName: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      orderNumber: orderDetails.orderId || orderDetails.orderNumber,
      trackingNumber:
        orderDetails.trackingNumber ||
        "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      estimatedDelivery:
        orderDetails.estimatedDelivery ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };

    const result = await sendFunctionEmail(
      userEmail,
      "order-shipped",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending order shipped email:", error);
    return { success: false, error };
  }
};

export const sendEmailVerification = async (
  userEmail: string,
  verificationToken: string,
  userName: string,
) => {
  try {
    // Use the new function-based email system
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
    const variables = {
      userName: userName,
      verificationToken: verificationToken,
      verificationUrl: verificationUrl,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "account-verification",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending email verification:", error);
    return { success: false, error };
  }
};

export const sendEmailConfirmation = async (
  userEmail: string,
  userName: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      userEmail: userEmail,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "email-confirmation",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending email confirmation:", error);
    return { success: false, error };
  }
};

export const sendOrderStatusUpdateEmail = async (
  userEmail: string,
  orderDetails: any,
  userName: string,
) => {
  try {
    // Enhanced order status update email with comprehensive details
    const statusMessages = {
      pending: {
        subject: "Order Confirmation - Payment Processing",
        message: "Your order has been received and payment is being processed.",
        color: "#f59e0b",
      },
      paid: {
        subject: "Payment Confirmed - Books Available Now!",
        message:
          "Great news! Your payment has been confirmed and your books are now available in your library.",
        color: "#10b981",
      },
      confirmed: {
        subject: "Order Confirmed - Welcome to ReadnWin!",
        message:
          "Your order has been confirmed! You now have full access to your purchased books.",
        color: "#10b981",
      },
      failed: {
        subject: "Payment Failed - Action Required",
        message:
          "We were unable to process your payment. Please try again or contact our support team.",
        color: "#ef4444",
      },
      cancelled: {
        subject: "Order Cancelled",
        message: "Your order has been cancelled. No payment has been charged.",
        color: "#6b7280",
      },
      refunded: {
        subject: "Refund Processed",
        message:
          "Your refund has been processed and will appear in your account within 3-5 business days.",
        color: "#8b5cf6",
      },
    };

    const statusInfo =
      statusMessages[orderDetails.status] || statusMessages.pending;

    // Format order items for email
    const itemsList = Array.isArray(orderDetails.items)
      ? orderDetails.items
          .map(
            (item) =>
              `• ${item.title || item.name} - ₦${item.price || item.total}`,
          )
          .join("\n")
      : "";

    const variables = {
      userName: userName,
      orderNumber: orderDetails.orderNumber || orderDetails.orderId,
      status: orderDetails.status,
      statusDescription: orderDetails.statusDescription || statusInfo.message,
      statusColor: statusInfo.color,
      paymentMethod: orderDetails.paymentMethod || "N/A",
      totalAmount: orderDetails.totalAmount || "0",
      currency: orderDetails.currency || "NGN",
      itemsList: itemsList,
      loginUrl: `${process.env.NEXTAUTH_URL || "https://readnwin.com"}/auth/login`,
      libraryUrl: `${process.env.NEXTAUTH_URL || "https://readnwin.com"}/library`,
      supportEmail: "support@readnwin.com",
    };

    // Create HTML email template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusInfo.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">ReadnWin</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Your Digital Library</p>
        </div>

        <!-- Status Banner -->
        <div style="background-color: ${statusInfo.color}; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Order #${variables.orderNumber}</h2>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${variables.statusDescription}</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hello ${variables.userName},</p>

          <div style="background-color: #f9fafb; border-left: 4px solid ${statusInfo.color}; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Order Details</h3>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Order Number:</strong> #${variables.orderNumber}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Status:</strong> ${variables.status.toUpperCase()}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Payment Method:</strong> ${variables.paymentMethod}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Total Amount:</strong> ${variables.currency} ${variables.totalAmount}</p>
          </div>

          ${
            variables.itemsList
              ? `
          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 18px;">Your Books</h3>
            <div style="color: #075985; font-size: 14px; line-height: 1.6; white-space: pre-line;">${variables.itemsList}</div>
          </div>
          `
              : ""
          }

          ${
            orderDetails.status === "paid" ||
            orderDetails.status === "confirmed"
              ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${variables.libraryUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Access Your Library</a>
          </div>
          `
              : ""
          }

          ${
            orderDetails.status === "failed"
              ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${variables.loginUrl}" style="background-color: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Try Again</a>
          </div>
          `
              : ""
          }

          <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0;">
            If you have any questions about your order, please don't hesitate to contact our support team at
            <a href="mailto:${variables.supportEmail}" style="color: #667eea; text-decoration: none;">${variables.supportEmail}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2025 ReadnWin. All rights reserved.<br>
            <a href="https://readnwin.com" style="color: #667eea; text-decoration: none;">Visit our website</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email using the function-based system with enhanced template
    const result = await sendFunctionEmail(userEmail, "order-status-update", {
      ...variables,
      subject: statusInfo.subject,
      htmlContent: htmlContent,
    });

    return result;
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return { success: false, error };
  }
};

export const sendPaymentConfirmationEmail = async (
  userEmail: string,
  orderDetails: any,
  userName: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      orderNumber: orderDetails.orderNumber || orderDetails.orderId,
      paymentAmount: orderDetails.paymentAmount || orderDetails.total,
      paymentMethod: orderDetails.paymentMethod || "Credit Card",
    };

    const result = await sendFunctionEmail(
      userEmail,
      "payment-confirmation",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return { success: false, error };
  }
};

export const sendShippingNotificationEmail = async (
  userEmail: string,
  orderDetails: any,
  userName: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      orderNumber: orderDetails.orderNumber || orderDetails.orderId,
      shippingMethod: orderDetails.shippingMethod || "Standard Shipping",
      estimatedDelivery:
        orderDetails.estimatedDelivery ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };

    const result = await sendFunctionEmail(
      userEmail,
      "shipping-notification",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending shipping notification email:", error);
    return { success: false, error };
  }
};

// Security and Account Management Emails
export const sendPasswordChangedEmail = async (
  userEmail: string,
  userName: string,
  changedAt: string,
  ipAddress: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      changedAt: changedAt,
      ipAddress: ipAddress,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "password-changed",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending password changed email:", error);
    return { success: false, error };
  }
};

export const sendLoginAlertEmail = async (
  userEmail: string,
  userName: string,
  loginTime: string,
  ipAddress: string,
  deviceInfo: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      loginTime: loginTime,
      ipAddress: ipAddress,
      deviceInfo: deviceInfo,
    };

    const result = await sendFunctionEmail(userEmail, "login-alert", variables);
    return result;
  } catch (error) {
    console.error("Error sending login alert email:", error);
    return { success: false, error };
  }
};

export const sendAccountDeactivationEmail = async (
  userEmail: string,
  userName: string,
  deactivationReason: string,
  reactivationUrl: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      deactivationReason: deactivationReason,
      reactivationUrl: reactivationUrl,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "account-deactivation",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending account deactivation email:", error);
    return { success: false, error };
  }
};

// Marketing and Notification Emails
export const sendNewsletterSubscriptionEmail = async (
  userEmail: string,
  userName: string,
  subscriptionType: string,
  unsubscribeUrl: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      subscriptionType: subscriptionType,
      unsubscribeUrl: unsubscribeUrl,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "newsletter-subscription",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending newsletter subscription email:", error);
    return { success: false, error };
  }
};

export const sendPromotionalOfferEmail = async (
  userEmail: string,
  userName: string,
  offerTitle: string,
  offerDescription: string,
  expiryDate: string,
  discountCode: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      userName: userName,
      offerTitle: offerTitle,
      offerDescription: offerDescription,
      expiryDate: expiryDate,
      discountCode: discountCode,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "promotional-offer",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending promotional offer email:", error);
    return { success: false, error };
  }
};

export const sendSystemMaintenanceEmail = async (
  userEmail: string,
  maintenanceType: string,
  startTime: string,
  endTime: string,
  affectedServices: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      maintenanceType: maintenanceType,
      startTime: startTime,
      endTime: endTime,
      affectedServices: affectedServices,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "system-maintenance",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending system maintenance email:", error);
    return { success: false, error };
  }
};

export const sendSecurityAlertEmail = async (
  userEmail: string,
  alertType: string,
  severity: string,
  description: string,
  actionRequired: string,
) => {
  try {
    // Use the new function-based email system
    const variables = {
      alertType: alertType,
      severity: severity,
      description: description,
      actionRequired: actionRequired,
    };

    const result = await sendFunctionEmail(
      userEmail,
      "security-alert",
      variables,
    );
    return result;
  } catch (error) {
    console.error("Error sending security alert email:", error);
    return { success: false, error };
  }
};

// Helper function to get status descriptions
const getStatusDescription = (status: string): string => {
  const descriptions: { [key: string]: string } = {
    pending: "Your order is being reviewed and will be processed soon.",
    payment_processing:
      "We are processing your payment. This usually takes a few minutes.",
    paid: "Payment has been confirmed and your order is being prepared.",
    processing: "Your order is being prepared for shipping.",
    shipped: "Your order has been shipped and is on its way to you.",
    delivered: "Your order has been successfully delivered.",
    cancelled: "Your order has been cancelled as requested.",
    refunded:
      "Your order has been refunded and the amount will be returned to your payment method.",
  };

  return descriptions[status] || "Your order status has been updated.";
};

// Send email using template
export const sendTemplateEmail = async (
  to: string,
  templateSlug: string,
  variables: Record<string, any>,
) => {
  try {
    const renderedTemplate = await emailTemplateService.renderTemplate(
      templateSlug,
      variables,
    );

    if (!renderedTemplate) {
      throw new Error(`Template '${templateSlug}' not found or inactive`);
    }

    return await sendEmail(
      to,
      renderedTemplate.subject,
      renderedTemplate.html,
      renderedTemplate.text,
    );
  } catch (error) {
    console.error("Error sending template email:", error);
    return { success: false, error };
  }
};

// Generic email sending function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
) => {
  try {
    // First, try to use admin-selected email gateway from database configuration
    const gatewayConfig = await getEmailGatewayConfig();

    if (gatewayConfig) {
      if (gatewayConfig.type === "resend") {
        console.log("📧 Using Resend from admin settings");
        const resend = new Resend(gatewayConfig.resendApiKey);
        const result = await resend.emails.send({
          from: `${gatewayConfig.fromName} <${gatewayConfig.fromEmail}>`,
          to: [to],
          subject,
          html,
          text,
        });
        return { success: true, data: result };
      } else if (gatewayConfig.type === "smtp") {
        console.log("📧 Using SMTP from admin settings");
        const transporter = createSMTPTransporter(gatewayConfig);

        const result = await transporter.sendMail({
          from: `${gatewayConfig.fromName} <${gatewayConfig.fromEmail}>`,
          to: to,
          subject,
          html,
          text,
        });
        return { success: true, data: result };
      }
    }

    // Fallback to environment variable RESEND_API_KEY if no admin configuration
    if (process.env.RESEND_API_KEY) {
      console.log(
        "📧 Using RESEND_API_KEY from environment variable (fallback)",
      );
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: "ReadnWin <noreply@readnwin.com>",
        to: [to],
        subject,
        html,
        text,
      });
      return { success: true, data: result };
    }

    // Final fallback to default Resend
    if (fallbackResend) {
      console.log("📧 Using fallback Resend configuration");
      const result = await fallbackResend.emails.send({
        from: "ReadnWin <noreply@readnwin.com>",
        to: [to],
        subject,
        html,
        text,
      });
      return { success: true, data: result };
    }

    // If no email gateway is configured, return error
    throw new Error(
      "No email gateway configured. Please configure an email gateway in the admin settings.",
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

// Send email using function assignment
export const sendFunctionEmail = async (
  to: string,
  functionSlug: string,
  variables: Record<string, any>,
) => {
  try {
    const template = await emailTemplateService.getTemplateForFunction(
      functionSlug,
      variables,
    );

    if (!template) {
      throw new Error(
        `No active template assigned to function: ${functionSlug}`,
      );
    }

    return await sendEmail(to, template.subject, template.html, template.text);
  } catch (error) {
    console.error("Error sending function email:", error);
    return { success: false, error };
  }
};

# Email System Documentation

## Overview

The ReadnWin application has a robust email system that ensures users receive welcome emails even if the initial email sending fails during registration.

## Key Principles

✅ **Registration Never Blocks on Email Failures**
- User registration continues even if welcome email fails
- Users can sign up and use the application immediately
- Email failures don't prevent account creation

✅ **Guaranteed Email Delivery**
- Failed emails are automatically retried
- Background job system ensures eventual delivery
- Users will receive welcome emails even if delayed

## Email Flow

### 1. Registration Process
```
User Registration → Create Account → Try Send Welcome Email → Continue Registration
                                    ↓
                              Email Success → Mark as sent
                                    ↓
                              Email Failure → Log error, continue registration
```

### 2. Background Retry System
```
Failed Email → Add to Retry Queue → Retry with exponential backoff → Mark as sent
                                    ↓
                              Max retries reached → Mark as failed
```

## Email Configuration

### Current Settings
- **Email Gateway**: Resend (Primary)
- **SMTP**: Configured but inactive
- **Double Opt-in**: Disabled (welcome emails sent immediately)
- **Retry System**: Active with exponential backoff

### Email Templates
- **Welcome Email**: Sent to new users upon registration
- **Verification Email**: Sent when double opt-in is enabled
- **Password Reset**: Sent when users request password reset

## Troubleshooting

### If a user doesn't receive a welcome email:

1. **Check if user exists and email was sent:**
   ```bash
   node scripts/debug-email-issue.js
   ```

2. **Send missing welcome emails:**
   ```bash
   npm run send-welcome
   ```

3. **Run email retry job:**
   ```bash
   npm run email-retry
   ```

4. **Fix email system issues:**
   ```bash
   npm run fix-emails
   ```

### Manual Email Sending

To manually send a welcome email to a specific user:

```bash
# Send welcome email to a specific user
curl -X POST ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "userName": "User Name"}'
```

## Background Jobs

### Email Retry Job
The email retry job can be run manually or scheduled:

```bash
# Run manually
npm run email-retry

# Or run the script directly
node scripts/email-retry-job.js
```

### Scheduling (Optional)
To run the retry job automatically, you can set up a cron job:

```bash
# Run every 15 minutes
*/15 * * * * cd /path/to/readnwinnext2 && npm run email-retry

# Run every hour
0 * * * * cd /path/to/readnwinnext2 && npm run email-retry
```

## Database Tables

### Users Table
- `welcome_email_sent`: Boolean flag indicating if welcome email was sent
- `email_verified`: Boolean flag indicating if email is verified
- `status`: User status (active, pending, etc.)

### Email Retry Queue Table
- `user_id`: Reference to users table
- `email_type`: Type of email (welcome, verification, etc.)
- `email_address`: Email address to send to
- `user_name`: User's name for personalization
- `retry_count`: Number of retry attempts
- `max_retries`: Maximum number of retries (default: 3)
- `next_retry_at`: When to retry next
- `status`: Job status (pending, processing, completed, failed)

## Monitoring

### Check Email Status
```bash
# Check all users and their email status
node scripts/debug-email-issue.js
```

### Check Retry Queue
```sql
-- Check pending emails
SELECT * FROM email_retry_queue WHERE status = 'pending';

-- Check failed emails
SELECT * FROM email_retry_queue WHERE status = 'failed';

-- Check completed emails
SELECT * FROM email_retry_queue WHERE status = 'completed';
```

## Best Practices

1. **Never block registration on email failures**
2. **Always log email errors for debugging**
3. **Use exponential backoff for retries**
4. **Clean up old failed jobs regularly**
5. **Monitor email delivery rates**
6. **Test email system regularly**

## Common Issues

### Email Not Sent During Registration
- Check if server is running (`npm run dev`)
- Check email gateway configuration
- Check if user exists in database
- Run email retry job

### Email Sent but User Didn't Receive
- Check spam/junk folder
- Verify email address is correct
- Check email gateway logs
- Test with a different email address

### Retry Job Not Working
- Check if server is running
- Check database connection
- Check email gateway configuration
- Review error logs

## Support

If you encounter email issues:

1. Run the diagnostic script: `node scripts/debug-email-issue.js`
2. Check the email retry queue
3. Verify email gateway configuration
4. Test with a known working email address
5. Check server logs for errors

The email system is designed to be resilient and ensure users receive their welcome emails even if there are temporary issues with the email service. 
# Password Reset Functionality - Diagnostic & Fix Guide

## Current Issues Identified

Based on the code analysis, the password reset functionality appears to be properly implemented. However, there might be issues with:

1. **Email Service Configuration**
2. **Database Table Schema**
3. **Environment Variables**
4. **Frontend/Backend URL Configuration**

## Diagnostic Steps

### Step 1: Check Email Service Configuration

**Backend (.env file should have):**
```env
# Option 1: Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Option 2: SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Option 3: Custom SMTP
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-user
EMAIL_PASSWORD=your-smtp-password

# Email From Details
EMAIL_FROM=noreply@trunklogistics.com
EMAIL_FROM_NAME=TrunkLogistics

# Client URL for reset links
CLIENT_URL=https://trunklogistics.netlify.app
```

### Step 2: Verify Database Table

Run this query to check if the password_reset_tokens table exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'password_reset_tokens'
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid)
- user_id (uuid)
- token (varchar/text)
- expires_at (timestamp)
- used_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)

### Step 3: Test Email Service

Create a test endpoint or run this in your server console:

```javascript
import emailService from './src/services/emailService.js';

// Test email sending
const testEmail = async () => {
  try {
    const result = await emailService.sendPasswordResetEmail(
      'test@example.com',
      'Test User',
      'https://trunklogistics.netlify.app/reset-password/test-token'
    );
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

testEmail();
```

## Common Issues & Solutions

### Issue 1: Email Not Sending

**Symptoms:**
- User submits email but never receives reset link
- Backend logs show email service errors

**Solutions:**

1. **Check if email service is initialized:**
```javascript
// In server/src/services/emailService.js
// Check the logs when server starts
// Should see: "Email service initialized successfully"
```

2. **Verify Gmail App Password (if using Gmail):**
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate new app password
   - Use that password (not your regular Gmail password)

3. **Check SendGrid API Key (if using SendGrid):**
   - Verify API key is valid at https://app.sendgrid.com/settings/api_keys
   - Ensure it has "Mail Send" permission

4. **Check firewall/network:**
   - Ensure port 587 (SMTP) is not blocked
   - If on Render/Heroku, check if external SMTP is allowed

### Issue 2: Invalid or Expired Token

**Symptoms:**
- User clicks link but gets "invalid token" error
- Token exists in database but shows as expired

**Solutions:**

1. **Check token expiration time:**
```javascript
// In server/src/utils/passwordReset.js
// Line 22: Token expires in 1 hour
const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
```

2. **Verify timezone settings:**
```sql
-- Check if server timezone matches database timezone
SELECT NOW(), CURRENT_TIMESTAMP;
```

3. **Clear old tokens:**
```javascript
// Run cleanup
import PasswordReset from './server/src/utils/passwordReset.js';
await PasswordReset.cleanupExpiredTokens();
```

### Issue 3: CLIENT_URL Not Set Correctly

**Symptoms:**
- Reset link points to localhost instead of production URL
- Reset link returns 404

**Solution:**

Update environment variable:
```env
# On Render/production
CLIENT_URL=https://trunklogistics.netlify.app

# On local development
CLIENT_URL=http://localhost:5173
```

### Issue 4: Frontend API URL Mismatch

**Symptoms:**
- Frontend can't reach reset password endpoint
- CORS errors in browser console

**Solution:**

Check frontend API configuration:
```javascript
// In client/src/utils/apiClient.js or similar
const API_URL = import.meta.env.VITE_API_URL || 'https://trunklogistics-api.onrender.com/api';
```

## Testing the Full Flow

### Manual Test Steps:

1. **Request Password Reset:**
```bash
curl -X POST https://trunklogistics-api.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "message": "If an account with that email exists, we have sent a password reset link."
}
```

2. **Check Database for Token:**
```sql
SELECT * FROM password_reset_tokens 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-test-email@example.com')
ORDER BY created_at DESC 
LIMIT 1;
```

3. **Check Email Inbox:**
   - Look in inbox and spam folder
   - Email should arrive within 1-2 minutes
   - Click the reset link

4. **Reset Password:**
```bash
curl -X POST https://trunklogistics-api.onrender.com/api/auth/reset-password/[TOKEN] \
  -H "Content-Type: application/json" \
  -d '{"password":"NewPassword123!"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

5. **Verify Token Marked as Used:**
```sql
SELECT * FROM password_reset_tokens 
WHERE token = '[YOUR-TOKEN]';
-- Should show used_at is not NULL
```

## Quick Fix Script

If you need to manually send a reset email, run this on your server:

```javascript
// create-manual-reset-link.js
import PasswordReset from './server/src/utils/passwordReset.js';
import User from './server/src/models/User.js';
import emailService from './server/src/services/emailService.js';

async function manualPasswordReset(userEmail) {
  try {
    // Find user
    const user = await User.findByEmail(userEmail);
    if (!user) {
      console.log('User not found');
      return;
    }

    // Create token
    const resetToken = await PasswordReset.createResetToken(user.id);
    
    // Generate URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken.token}`;
    
    console.log('\\n========================================');
    console.log('Password Reset Link Generated:');
    console.log('========================================');
    console.log(`User: ${user.email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token: ${resetToken.token}`);
    console.log(`Expires: ${resetToken.expires_at}`);
    console.log('========================================\\n');
    
    // Try to send email
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email,
      user.first_name || 'User',
      resetUrl
    );
    
    if (emailSent) {
      console.log('✅ Email sent successfully');
    } else {
      console.log('❌ Email failed to send - but you can use the URL above manually');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage:
// node create-manual-reset-link.js
manualPasswordReset('user@example.com');
```

## Environment Variables Checklist

Make sure these are set in your production environment (Render):

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d

# Email (Choose one method)
EMAIL_SERVICE=sendgrid  # or 'gmail' or leave empty for custom SMTP
SENDGRID_API_KEY=SG.xxx...  # if using SendGrid
EMAIL_USER=...  # if using Gmail or custom SMTP
EMAIL_PASSWORD=...  # if using Gmail or custom SMTP

# Email Details
EMAIL_FROM=noreply@trunklogistics.com
EMAIL_FROM_NAME=TrunkLogistics

# URLs
CLIENT_URL=https://trunklogistics.netlify.app
NODE_ENV=production
```

## Monitoring & Logs

Check these logs to diagnose issues:

1. **Server startup logs:**
```
✅ "Email service initialized successfully"
✅ "Gmail/SendGrid/SMTP email service configured"
```

2. **Forgot password request logs:**
```
✅ "Password reset email sent to: user@example.com"
✅ "Password reset token created for user [uuid]"
```

3. **Reset password logs:**
```
✅ "Password reset completed for user: user@example.com"
```

## Frontend Debug Mode

Add this to your ForgotPassword.jsx to see more details:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log('🔄 Submitting forgot password for:', email);
  console.log('📡 API URL:', axios.defaults.baseURL);
  
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    console.log('✅ Response:', response.data);
    
    if (response.data.success) {
      setSuccess(true);
    }
  } catch (err) {
    console.error('❌ Error details:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    setError(err.response?.data?.error || 'Failed to send reset email');
  }
};
```

## Next Steps

1. Check server logs for email service initialization
2. Verify environment variables are set
3. Test with a real email address you control
4. Check spam folder
5. If email doesn't arrive, use manual script to generate link
6. Review Render logs for any errors

## Support

If issues persist after following this guide:
1. Check Render logs: https://dashboard.render.com
2. Verify email service (SendGrid) dashboard for delivery status
3. Check database for password_reset_tokens entries
4. Review browser console for frontend errors

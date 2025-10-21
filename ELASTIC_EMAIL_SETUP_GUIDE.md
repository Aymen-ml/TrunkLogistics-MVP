# Elastic Email Setup Guide for Production

## Overview

Elastic Email provides 100 emails per day for free with no credit card required. Perfect for your production password reset functionality.

## Step-by-Step Setup

### Step 1: Create Elastic Email Account

1. **Go to**: https://elasticemail.com/
2. **Click**: "Start Free Trial" or "Sign Up"
3. **Fill in**:
   - Email: `korichiaymen27@gmail.com` (or your preferred email)
   - Password: Create a strong password
   - Company name: `TrunkLogistics`
4. **Sign up** - No credit card required! ✅
5. **Verify your email**: Check Gmail for verification email from Elastic Email

### Step 2: Verify Your Sender Email

After logging in:

1. **Go to**: Settings → Manage Senders
2. **Click**: "Add Sender"
3. **Enter**: `korichiaymen27@gmail.com`
4. **Click**: "Add and Verify"
5. **Check Gmail**: You'll receive a verification email
6. **Click verification link** in the email
7. **Wait for approval**: Usually instant, sometimes takes a few minutes
8. **Verify status**: Green checkmark appears when approved ✅

### Step 3: Get SMTP Credentials

1. **Go to**: Settings → SMTP/API
2. **Find SMTP Configuration**:
   - **SMTP Server**: `smtp.elasticemail.com`
   - **Port**: `2525` (recommended) or `587`
   - **Username**: Your email address (e.g., `korichiaymen27@gmail.com`)
3. **Create API Key** (used as SMTP password):
   - Click "Create Additional API Key"
   - Name: `TrunkLogistics-Production`
   - Select permissions: Check "SMTP"
   - Click "Create"
   - **Copy the API Key** - You won't see it again! ⚠️

### Step 4: Update Render Environment Variables

Go to your Render dashboard:

1. **Navigate to**: Your web service → Environment
2. **Remove or comment out SendGrid variables**:
   ```
   # EMAIL_SERVICE=sendgrid
   # SENDGRID_API_KEY=...
   ```
3. **Add Elastic Email configuration**:
   ```env
   EMAIL_HOST=smtp.elasticemail.com
   EMAIL_PORT=2525
   EMAIL_SECURE=false
   EMAIL_USER=korichiaymen27@gmail.com
   EMAIL_PASSWORD=your-elastic-email-api-key-here
   
   EMAIL_FROM=korichiaymen27@gmail.com
   EMAIL_FROM_NAME=TrunkLogistics
   
   CLIENT_URL=https://truck-logistics-mvp.vercel.app
   NODE_ENV=production
   ```

**Important Notes**:
- ⚠️ Use port `2525` or `587` (Elastic Email recommends 2525)
- ⚠️ `EMAIL_PASSWORD` is your API Key, not your account password
- ⚠️ `EMAIL_USER` is your verified sender email
- ⚠️ Don't set `EMAIL_SERVICE` - leave it empty for generic SMTP

### Step 5: Restart Render Service

1. **Go to**: Your Render service dashboard
2. **Click**: "Manual Deploy" → "Deploy latest commit"
3. **Or**: Click the restart button
4. **Wait**: For service to restart (~30 seconds)

### Step 6: Test Password Reset

1. **Go to**: https://truck-logistics-mvp.vercel.app/forgot-password
2. **Enter**: Any test email (e.g., your Gmail)
3. **Click**: "Send Reset Link"
4. **Check**: Your email inbox (and spam folder)
5. **Verify**: You receive the password reset email
6. **Click**: Reset link and set new password
7. **Test**: Login with new password

## Complete Environment Variables

Here's what your Render environment variables should look like:

```env
# Database (keep existing)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...

# JWT (keep existing)
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

# Elastic Email SMTP Configuration
EMAIL_HOST=smtp.elasticemail.com
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=korichiaymen27@gmail.com
EMAIL_PASSWORD=your-elastic-email-api-key

# Email Details
EMAIL_FROM=korichiaymen27@gmail.com
EMAIL_FROM_NAME=TrunkLogistics

# App URLs
CLIENT_URL=https://truck-logistics-mvp.vercel.app
PORT=5000
NODE_ENV=production

# Cloudinary (keep existing)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# DO NOT SET (when using generic SMTP):
# EMAIL_SERVICE=
```

## How Your Code Works with Elastic Email

Your existing code in `server/src/services/emailService.js` already supports Elastic Email:

```javascript
// When EMAIL_SERVICE is not set, it uses generic SMTP
this.transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,        // smtp.elasticemail.com
  port: parseInt(process.env.EMAIL_PORT || '587'),  // 2525
  secure: process.env.EMAIL_SECURE === 'true',      // false
  auth: {
    user: process.env.EMAIL_USER,      // korichiaymen27@gmail.com
    pass: process.env.EMAIL_PASSWORD   // API Key
  }
});
```

**No code changes needed!** ✅

## Elastic Email Dashboard

After setup, you can monitor emails:

1. **Go to**: https://elasticemail.com/account/
2. **Navigate to**: Reports → Email Log
3. **See**: All sent emails, delivery status, opens, clicks
4. **Filter by**: Date, status, recipient
5. **Useful for**: Debugging delivery issues

## Free Tier Limits

Elastic Email free tier includes:
- ✅ **100 emails per day**
- ✅ **3,000 emails per month**
- ✅ **No credit card required**
- ✅ **Email tracking and statistics**
- ✅ **Email validation tools**

## Testing Checklist

- [ ] Elastic Email account created
- [ ] Account email verified
- [ ] Sender email (`korichiaymen27@gmail.com`) added and verified
- [ ] API Key created with SMTP permissions
- [ ] API Key copied and saved
- [ ] Render environment variables updated
- [ ] Render service restarted
- [ ] Test email sent from forgot password page
- [ ] Email received in inbox
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password

## Troubleshooting

### Issue: "Authentication failed"

**Possible causes**:
- Wrong API key
- API key doesn't have SMTP permissions
- Wrong username

**Solution**:
1. Verify `EMAIL_USER` is your verified sender email
2. Verify `EMAIL_PASSWORD` is your API Key (not account password)
3. Check API Key has "SMTP" permission enabled
4. Create a new API Key if needed

### Issue: "Sender not verified"

**Solution**:
1. Go to Settings → Manage Senders
2. Verify `korichiaymen27@gmail.com` has green checkmark
3. If not, click "Resend verification email"
4. Check Gmail and click verification link
5. Wait for approval (usually instant)

### Issue: "Connection timeout"

**Possible causes**:
- Wrong port
- Firewall blocking SMTP

**Solution**:
1. Try port `2525` instead of `587`
2. Verify Render allows outbound SMTP connections
3. Check `EMAIL_HOST` is exactly `smtp.elasticemail.com`

### Issue: Email not received

**Debug steps**:
1. **Check Render logs**:
   - Look for "Email sent successfully" message
   - Look for error messages
2. **Check Elastic Email dashboard**:
   - Go to Reports → Email Log
   - Verify email was sent
   - Check delivery status
3. **Check spam folder**:
   - Password reset emails sometimes go to spam
4. **Verify sender**:
   - Make sure sender email is verified in Elastic Email
5. **Check email address**:
   - Make sure recipient email is valid

### Issue: "Invalid recipient"

**Solution**:
- Verify you're entering a valid email address
- Try with a different email provider (Gmail, Yahoo, etc.)
- Check Elastic Email logs for more details

## Port Options

Elastic Email supports multiple ports:

```env
# Option 1: Port 2525 (Recommended)
EMAIL_PORT=2525
EMAIL_SECURE=false

# Option 2: Port 587 (Standard)
EMAIL_PORT=587
EMAIL_SECURE=false

# Option 3: Port 465 (Secure)
EMAIL_PORT=465
EMAIL_SECURE=true

# Option 4: Port 25 (May be blocked)
EMAIL_PORT=25
EMAIL_SECURE=false
```

**Recommendation**: Use port `2525` - it's Elastic Email's recommended port and less likely to be blocked by hosting providers.

## Monitoring Email Delivery

### Check Delivery Status:

1. **Go to**: Elastic Email Dashboard
2. **Navigate to**: Reports → Email Log
3. **Look for**:
   - ✅ **Delivered**: Email successfully sent
   - 📬 **In Progress**: Email being processed
   - ❌ **Failed**: Delivery failed (check reason)
   - 🚫 **Bounced**: Invalid recipient email

### Email Statistics:

View detailed statistics:
- Total emails sent
- Delivery rate
- Open rate (if tracking enabled)
- Click rate
- Bounce rate
- Spam complaints

## Security Best Practices

### Protect Your API Key:

1. ✅ **Never commit API key to Git**
2. ✅ **Store in Render environment variables only**
3. ✅ **Don't share API key publicly**
4. ✅ **Regenerate if compromised**
5. ✅ **Use different keys for dev/production**

### Create Separate API Keys:

```
Development:   TrunkLogistics-Dev
Staging:       TrunkLogistics-Staging
Production:    TrunkLogistics-Production
```

This way, you can revoke one without affecting others.

## Upgrading Later

If you need more than 100 emails/day:

### Elastic Email Paid Plans:
- **Pay as you go**: $0.09 per 1,000 emails
- **Premium 2K**: $9/month for 2,000 emails/month
- **Premium 5K**: $19/month for 5,000 emails/month

### Check usage:
1. Go to Elastic Email dashboard
2. View Reports → Usage
3. Monitor daily/monthly email count

## Comparing with Other Services

| Feature | Elastic Email | Brevo | Gmail |
|---------|---------------|-------|-------|
| Free emails/day | 100 | 300 | 500 |
| Credit card | No | No | No |
| Verification | Email | Email | None |
| Setup time | 5 min | 5 min | 2 min |
| Dashboard | Excellent | Good | Basic |
| API access | Yes | Yes | No |
| For production | Yes ✅ | Yes ✅ | Okay |

## Testing Locally (Optional)

Test Elastic Email before deploying:

1. **Create** `.env` file in `/server` directory:
   ```env
   EMAIL_HOST=smtp.elasticemail.com
   EMAIL_PORT=2525
   EMAIL_SECURE=false
   EMAIL_USER=korichiaymen27@gmail.com
   EMAIL_PASSWORD=your-elastic-api-key
   EMAIL_FROM=korichiaymen27@gmail.com
   EMAIL_FROM_NAME=TrunkLogistics
   CLIENT_URL=http://localhost:5173
   ```

2. **Run test script**:
   ```bash
   cd server
   node test-password-reset.js your-test-email@gmail.com
   ```

3. **Check output**:
   ```
   ✅ Password reset email sent successfully
   ```

4. **Check inbox**: Verify you received the email

## Support Resources

- **Elastic Email Dashboard**: https://elasticemail.com/account/
- **Documentation**: https://elasticemail.com/developers/
- **API Documentation**: https://api.elasticemail.com/public/help
- **SMTP Configuration**: https://help.elasticemail.com/en/articles/2168-smtp-api
- **Support**: https://elasticemail.com/contact/

## Quick Reference Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         ELASTIC EMAIL SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render Environment Variables:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMAIL_HOST=smtp.elasticemail.com
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=korichiaymen27@gmail.com
EMAIL_PASSWORD=[Your API Key]
EMAIL_FROM=korichiaymen27@gmail.com
EMAIL_FROM_NAME=TrunkLogistics
CLIENT_URL=https://truck-logistics-mvp.vercel.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dashboard: https://elasticemail.com/account/
Email Log: Reports → Email Log
API Keys: Settings → SMTP/API
Senders: Settings → Manage Senders

Free Tier: 100 emails/day
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Summary

✅ **Elastic Email is ready for production!**

### What you get:
- 100 free emails per day
- No credit card required
- Professional email service
- Email tracking and statistics
- Good deliverability
- Easy sender verification

### Setup time:
- **5 minutes** to create account and get credentials
- **2 minutes** to update Render and restart
- **Total: ~7 minutes** 🚀

### Next steps:
1. Create Elastic Email account
2. Verify sender email
3. Get API key
4. Update Render environment variables
5. Restart service
6. Test password reset
7. You're done! ✅

---

**Ready to start?** Go to https://elasticemail.com/ and create your account! 🚀

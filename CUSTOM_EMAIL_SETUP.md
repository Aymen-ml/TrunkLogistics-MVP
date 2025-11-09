# 📧 Custom Email Setup Guide - noreply@movelinker.com

**Date:** October 22, 2025  
**Email:** noreply@movelinker.com  
**Purpose:** Complete setup and testing guide for custom domain email

---

## 🎯 Quick Setup Checklist

- [ ] Domain DNS records configured (SPF, DKIM, DMARC)
- [ ] Email hosting service configured
- [ ] SMTP credentials obtained
- [ ] Environment variables updated
- [ ] Email service tested
- [ ] All email templates working

---

## 🔧 Step 1: Update Environment Variables

### Option A: Using SMTP (Direct Email Server)

Update your `server/.env` file:

```bash
# Email Configuration - Custom Domain
EMAIL_SERVICE=smtp
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=TruckLogistics

# SMTP Server Settings (from your email provider)
EMAIL_HOST=mail.movelinker.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@movelinker.com
EMAIL_PASSWORD=your_email_password_here

# OR if using TLS
EMAIL_PORT=465
EMAIL_SECURE=true
```

### Option B: Using SendGrid (Recommended for Production)

```bash
# Email Configuration - SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=TruckLogistics
```

### Option C: Using Resend (Modern Alternative)

```bash
# Email Configuration - Resend
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=TruckLogistics
```

---

## 🌐 Step 2: Configure DNS Records

### Required DNS Records for Custom Email

Add these to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

#### 1. MX Records (Mail Exchange)
```
Type: MX
Host: @
Value: mail.movelinker.com (or your email provider's server)
Priority: 10
TTL: 3600
```

#### 2. SPF Record (Sender Policy Framework)
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.mail.movelinker.com ~all
TTL: 3600
```

**If using SendGrid:**
```
Type: TXT
Host: @
Value: v=spf1 include:sendgrid.net ~all
```

#### 3. DKIM Record (DomainKeys Identified Mail)
```
Type: TXT
Host: default._domainkey
Value: [Provided by your email service]
TTL: 3600
```

#### 4. DMARC Record (Domain-based Message Authentication)
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@movelinker.com
TTL: 3600
```

### Verify DNS Records

Use these tools to verify your DNS configuration:
- https://mxtoolbox.com/SuperTool.aspx
- https://www.mail-tester.com/
- https://dmarcian.com/dmarc-inspector/

---

## 🧪 Step 3: Test Your Email Configuration

### Method 1: Quick Test Script

Run the test script I created:

```bash
# Test with default recipient (your email from env)
node test-custom-email.js

# Test with specific recipient
node test-custom-email.js youremail@example.com
```

### Method 2: Test Individual Email Types

#### Test Password Reset Email
```bash
node server/test-password-reset.js noreply@movelinker.com
```

#### Test Welcome Email
```bash
# Through registration flow
# Register a new test user on your platform
```

#### Test Booking Notification
```bash
# Create a test booking
# Email notifications will be sent automatically
```

---

## 📋 Expected Test Results

When you run the test script, you should see:

```
🔧 TruckLogistics - Custom Email Test

========================================
Testing: noreply@movelinker.com
========================================

1️⃣  Checking environment configuration...

Configuration:
   Service Type: smtp
   From Email: noreply@movelinker.com
   From Name: TruckLogistics
   SMTP Host: mail.movelinker.com
   SMTP Port: 587
   SMTP Secure: false
   Email User: ✅ SET
   Email Password: ✅ SET

✅ Email sender correctly set to noreply@movelinker.com
✅ Email service initialized successfully

2️⃣  Sending test email...

   Recipient: youremail@example.com
   From: TruckLogistics <noreply@movelinker.com>

✅ Test email sent successfully!

   Message ID: <some-message-id@movelinker.com>

========================================
📬 Check your inbox at: youremail@example.com
========================================

3️⃣  Additional Email Templates Test...

   Testing Password Reset Email...
   ✅ Password reset email sent

   Testing Welcome Email...
   ✅ Welcome email sent

========================================
🎊 ALL EMAIL TESTS COMPLETED SUCCESSFULLY!
========================================

Summary:
   ✅ Test email sent
   ✅ Password reset email sent
   ✅ Welcome email sent
   ✅ Custom domain verified

Check your inbox for all test emails!
```

---

## 🔍 Troubleshooting Common Issues

### Issue 1: Authentication Failed (535 Error)

**Symptoms:**
```
Error: Authentication failed
Code: 535
```

**Solutions:**
1. Verify EMAIL_USER and EMAIL_PASSWORD are correct
2. If using Gmail/Google Workspace, enable "Less secure apps" or use App Password
3. Check if 2FA is enabled (requires app-specific password)
4. Verify SMTP host and port are correct

### Issue 2: Connection Timeout

**Symptoms:**
```
Error: Connection timeout
Code: ETIMEDOUT
```

**Solutions:**
1. Check firewall allows outbound SMTP (port 587 or 465)
2. Verify EMAIL_HOST is correct
3. Try different EMAIL_PORT (587 vs 465)
4. Check if EMAIL_SECURE setting matches port

### Issue 3: Email Delivered to Spam

**Symptoms:**
- Email sent successfully but appears in spam folder

**Solutions:**
1. Verify SPF record is correctly configured
2. Add DKIM record from your email provider
3. Add DMARC record
4. Warm up your domain (send increasing volume over time)
5. Check email content doesn't trigger spam filters
6. Use https://www.mail-tester.com/ to check email score

### Issue 4: Email Not Configured Error

**Symptoms:**
```
❌ ERROR: Email service not initialized!
```

**Solutions:**
1. Check `.env` file exists in `server/` directory
2. Verify all required variables are set
3. Restart your server after changing .env
4. Check for typos in variable names

### Issue 5: "Email From Not Verified" (SendGrid/Resend)

**Symptoms:**
```
Error: Sender email not verified
```

**Solutions:**
1. Log into SendGrid/Resend dashboard
2. Go to Sender Authentication
3. Add and verify noreply@movelinker.com
4. Wait for verification email and confirm

---

## 📧 Email Provider Setup Guides

### Using Your Own Email Server (cPanel/Plesk)

1. **Create Email Account:**
   - Login to cPanel/Plesk
   - Navigate to Email Accounts
   - Create `noreply@movelinker.com`
   - Set a strong password

2. **Get SMTP Settings:**
   - Usually: `mail.movelinker.com`
   - Port: 587 (TLS) or 465 (SSL)
   - Authentication: Required

3. **Update .env:**
   ```bash
   EMAIL_HOST=mail.movelinker.com
   EMAIL_USER=noreply@movelinker.com
   EMAIL_PASSWORD=your_password
   ```

### Using Google Workspace

1. **Setup:**
   - Add domain to Google Workspace
   - Create `noreply@movelinker.com` account
   - Enable 2-Step Verification
   - Generate App Password

2. **Update .env:**
   ```bash
   EMAIL_SERVICE=smtp
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=noreply@movelinker.com
   EMAIL_PASSWORD=your_app_password
   ```

### Using SendGrid (Recommended)

1. **Setup:**
   - Create SendGrid account
   - Generate API key with "Mail Send" permission
   - Authenticate sender (noreply@movelinker.com)
   - Verify domain or single sender

2. **Update .env:**
   ```bash
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
   EMAIL_FROM=noreply@movelinker.com
   ```

3. **Verify Sender:**
   - Go to Settings → Sender Authentication
   - Choose "Domain Authentication" (best) or "Single Sender Verification"
   - Follow verification steps

---

## ✅ Production Deployment Checklist

Before deploying to production:

### Environment Variables (Render/Railway/etc)

Update these on your hosting platform:

```bash
# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_production_key
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=TruckLogistics

# URLs
CLIENT_URL=https://movelinker.com
FRONTEND_URL=https://movelinker.com
```

### DNS Configuration
- [ ] SPF record added and verified
- [ ] DKIM record added and verified
- [ ] DMARC record added
- [ ] MX records pointing correctly
- [ ] Wait 24-48 hours for DNS propagation

### Testing
- [ ] Send test email from production
- [ ] Verify email lands in inbox (not spam)
- [ ] Test password reset flow
- [ ] Test welcome email
- [ ] Test booking notifications
- [ ] Check email deliverability score

### Monitoring
- [ ] Set up email delivery monitoring
- [ ] Configure SendGrid/email service webhooks
- [ ] Monitor bounce rates
- [ ] Track open rates (if enabled)
- [ ] Set up alerts for delivery failures

---

## 📊 Email Templates Included

Your platform sends these email types:

1. **Welcome Email** - New user registration
2. **Email Verification** - Confirm email address
3. **Password Reset** - Forgot password flow
4. **Booking Confirmation** - Booking created
5. **Booking Status Update** - Status changes
6. **Provider Verification** - Provider approval
7. **Notification Summary** - System notifications

All templates will use `noreply@movelinker.com` as sender.

---

## 🔗 Helpful Resources

- **DNS Checker:** https://dnschecker.org/
- **Email Tester:** https://www.mail-tester.com/
- **MX Toolbox:** https://mxtoolbox.com/
- **SPF Generator:** https://www.spfwizard.net/
- **DKIM Checker:** https://dkimcore.org/tools/
- **SendGrid Docs:** https://docs.sendgrid.com/
- **Nodemailer Docs:** https://nodemailer.com/

---

## 🚀 Next Steps

After successful email testing:

1. **Update Production Environment**
   - Deploy updated .env variables to production
   - Restart production server

2. **Monitor Email Delivery**
   - Check SendGrid dashboard (if using)
   - Monitor error logs
   - Track delivery success rates

3. **Optimize Email Content**
   - Ensure mobile-friendly templates
   - Add unsubscribe links (if required)
   - Include company footer
   - Test across email clients

4. **Set Up Email Analytics**
   - Track open rates (optional)
   - Monitor click-through rates
   - Analyze bounce rates
   - Identify deliverability issues

---

## 💡 Pro Tips

1. **Warm Up Your Domain:**
   - Start with low volume (10-20 emails/day)
   - Gradually increase over 2-3 weeks
   - This builds sender reputation

2. **Monitor Blacklists:**
   - Check if your domain/IP is blacklisted
   - Use: https://mxtoolbox.com/blacklists.aspx

3. **Email Content Best Practices:**
   - Avoid spam trigger words
   - Include plain text version
   - Add physical address in footer
   - Include unsubscribe option
   - Keep HTML simple and clean

4. **Security:**
   - Use strong SMTP passwords
   - Rotate API keys regularly
   - Enable 2FA on email accounts
   - Monitor for unauthorized access

---

## ✅ Success Indicators

Your email is properly configured when:

- ✅ Test emails arrive in inbox (not spam)
- ✅ Email headers show proper SPF/DKIM/DMARC pass
- ✅ Mail-tester.com score is 8/10 or higher
- ✅ All email templates work correctly
- ✅ No authentication errors in logs
- ✅ Production emails sending successfully

---

**Created:** October 22, 2025  
**Last Updated:** October 22, 2025  
**Next Review:** After production deployment

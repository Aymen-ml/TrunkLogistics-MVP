# 📧 Resend Email Setup for movelinker

**Date:** November 9, 2025  
**Domain:** movelinker.com  
**Email Addresses:** noreply@movelinker.com, support@movelinker.com

---

## Step 1: Create Resend Account

### 1.1 Sign Up
1. Go to **https://resend.com/signup**
2. Sign up with your email (use your business email or GitHub)
3. Verify your email address
4. Complete the onboarding

### 1.2 Free Plan Features
- ✅ **3,000 emails/month** for free
- ✅ **1 custom domain**
- ✅ **100 emails/day**
- ✅ Email API access
- ✅ SMTP access
- ✅ Email logs and analytics

---

## Step 2: Add Your Domain

### 2.1 Add Domain in Resend
1. Log in to **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter: `movelinker.com`
4. Click **"Add"**

### 2.2 DNS Records (CRITICAL)

Resend will provide you with DNS records. You need to add these to your domain registrar:

#### Example DNS Records (Yours will be different):

```dns
# SPF Record (TXT)
Type: TXT
Name: @ (or movelinker.com)
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600

# DKIM Record (TXT) - Example, use YOUR actual values
Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4...
TTL: 3600

# DKIM Record (CNAME) - If provided
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600
```

### 2.3 Verify Domain
1. Add all DNS records to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)
2. Wait 5-30 minutes for DNS propagation
3. Go back to Resend dashboard
4. Click **"Verify Domain"**
5. Wait for green checkmarks on all records ✅

**Note:** Domain verification can take up to 72 hours, but usually completes within 15-30 minutes.

---

## Step 3: Get API Key

### 3.1 Create API Key
1. Go to **https://resend.com/api-keys**
2. Click **"Create API Key"**
3. Name it: `movelinker-production`
4. Permission: **Full Access** (or "Sending access" for security)
5. Click **"Create"**
6. **COPY THE API KEY IMMEDIATELY** (you won't see it again!)

### 3.2 API Key Format
Your API key will look like:
```
re_123abc456def789ghi012jkl345mno678
```

⚠️ **IMPORTANT:** Store this securely! You can't retrieve it later.

---

## Step 4: Configure Your Application

### 4.1 Update Server Environment Variables

Edit `server/.env`:

```env
# Email Service Configuration
EMAIL_SERVICE=resend
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE

# Email Sender Configuration
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=movelinker

# URLs
CLIENT_URL=https://movelinker.com
FRONTEND_URL=https://movelinker.com
```

### 4.2 Update Production Environment (Render)

If you're using Render:

1. Go to **https://dashboard.render.com**
2. Select your backend service
3. Go to **Environment** tab
4. Add/Update these variables:

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=movelinker
CLIENT_URL=https://movelinker.com
FRONTEND_URL=https://movelinker.com
```

5. Click **"Save Changes"**
6. Service will automatically redeploy

---

## Step 5: Test Email Sending

### 5.1 Test with Node Script

Create a test file `test-resend-setup.js`:

```javascript
const fetch = require('node-fetch');
require('dotenv').config({ path: './server/.env' });

async function testResendEmail() {
  console.log('🧪 Testing Resend Email Setup for movelinker\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'noreply@movelinker.com';
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in .env file');
    return;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  console.log('✅ From Email:', fromEmail);
  console.log('');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `movelinker <${fromEmail}>`,
        to: 'YOUR_EMAIL@example.com', // Change this to your email
        subject: '✅ Test Email - movelinker Setup',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1E3A8A;">movelinker Email Test</h1>
            <p>Hello!</p>
            <p>This is a test email from your movelinker application.</p>
            <p><strong>From:</strong> ${fromEmail}</p>
            <p><strong>Service:</strong> Resend</p>
            <p><strong>Status:</strong> ✅ Email service is working correctly!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated test from movelinker.<br>
              Need help? Contact us at support@movelinker.com
            </p>
            <p style="color: #6b7280; font-size: 12px;">
              © 2025 movelinker. All rights reserved.
            </p>
          </div>
        `
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Email ID:', data.id);
      console.log('');
      console.log('🎉 Your Resend setup is complete and working!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Check your inbox for the test email');
      console.log('2. Verify sender shows as: movelinker <noreply@movelinker.com>');
      console.log('3. Check spam folder if you don\'t see it');
      console.log('4. Test password reset and verification flows');
    } else {
      console.error('❌ Failed to send email');
      console.error('Status:', response.status);
      console.error('Error:', data);
      
      if (data.message && data.message.includes('Domain not found')) {
        console.log('\n⚠️  Domain not verified yet. Please:');
        console.log('1. Go to https://resend.com/domains');
        console.log('2. Verify all DNS records are added correctly');
        console.log('3. Click "Verify Domain"');
        console.log('4. Wait for all checkmarks to turn green ✅');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testResendEmail();
```

### 5.2 Run the Test

```bash
# Install node-fetch if not already installed
npm install node-fetch

# Run the test
node test-resend-setup.js
```

### 5.3 Test Password Reset Flow

```bash
# Test password reset with existing script
node server/test-password-reset.js your-email@example.com
```

Expected output:
```
✅ Password reset email sent successfully
From: movelinker <noreply@movelinker.com>
Subject: Password Reset Request - movelinker
```

---

## Step 6: Set Up Second Email (support@movelinker.com)

### Option A: Use Resend for Support Email

1. In Resend dashboard, you can send from any email @movelinker.com once domain is verified
2. Just update your code to use `support@movelinker.com` where needed
3. No additional setup required!

### Option B: Forward to Your Gmail/Email

1. Set up email forwarding in your domain registrar:
   ```
   support@movelinker.com → your-actual-email@gmail.com
   ```

2. This way you receive all support emails in your personal inbox

---

## Step 7: Verify Everything Works

### 7.1 Checklist

- [ ] Resend account created
- [ ] Domain `movelinker.com` added to Resend
- [ ] All DNS records (SPF, DKIM) added to domain registrar
- [ ] Domain verified in Resend (all green checkmarks ✅)
- [ ] API key created and copied
- [ ] `server/.env` updated with API key
- [ ] Production environment variables updated (Render)
- [ ] Test email sent successfully
- [ ] Test email received in inbox (check spam folder)
- [ ] Password reset email tested
- [ ] Email verification tested

### 7.2 Test All Email Types

1. **Registration Email:**
   - Sign up with a new account
   - Check for verification email
   - Verify sender: `movelinker <noreply@movelinker.com>`

2. **Password Reset:**
   - Go to forgot password page
   - Enter your email
   - Check for reset email
   - Click link and reset password

3. **Booking Notifications:**
   - Create a test booking
   - Check for booking confirmation email

---

## Common Issues & Solutions

### Issue 1: "Domain not found" Error

**Cause:** Domain not verified yet

**Solution:**
1. Check DNS records are added correctly
2. Wait 15-30 minutes for DNS propagation
3. Verify domain in Resend dashboard
4. Try `nslookup -type=TXT movelinker.com` to check DNS

### Issue 2: Emails Go to Spam

**Cause:** Missing or incorrect SPF/DKIM records

**Solution:**
1. Verify all DNS records are correct
2. Add DMARC policy:
   ```dns
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@movelinker.com
   ```
3. Warm up your domain by sending gradually more emails

### Issue 3: "Invalid API Key" Error

**Cause:** API key not set or incorrect

**Solution:**
1. Check `RESEND_API_KEY` in `.env` file
2. Ensure no extra spaces or quotes
3. Regenerate API key if needed
4. Restart your server after updating `.env`

### Issue 4: Can't Verify Domain

**Cause:** DNS propagation delay or incorrect records

**Solution:**
1. Use DNS checker: https://dnschecker.org
2. Search for: `movelinker.com TXT`
3. Wait up to 72 hours (usually 15-30 min)
4. Double-check all records match exactly what Resend shows

---

## Production Deployment Checklist

### Before Going Live:

- [ ] Domain verified in Resend ✅
- [ ] All DNS records added (SPF, DKIM, DMARC)
- [ ] API key added to production environment
- [ ] Test all email flows in production
- [ ] Monitor email logs in Resend dashboard
- [ ] Set up email forwarding for support@movelinker.com
- [ ] Test both noreply@ and support@ addresses
- [ ] Check email deliverability to Gmail, Outlook, etc.

### After Going Live:

- [ ] Monitor Resend dashboard for bounces/complaints
- [ ] Check email open rates
- [ ] Watch for spam reports
- [ ] Keep API key secure (never commit to git)
- [ ] Set up alerts for API rate limits

---

## Resend Dashboard URLs

- **Main Dashboard:** https://resend.com/home
- **Domains:** https://resend.com/domains
- **API Keys:** https://resend.com/api-keys
- **Emails Log:** https://resend.com/emails
- **Settings:** https://resend.com/settings
- **Documentation:** https://resend.com/docs

---

## Cost & Limits (Free Plan)

| Feature | Limit |
|---------|-------|
| Emails/Month | 3,000 |
| Emails/Day | 100 |
| Custom Domains | 1 |
| API Requests | Unlimited |
| Email Size | 40 MB |
| Attachments | ✅ Supported |
| Email Logs | 30 days |

**Need More?**
- Pro Plan: $20/month for 50,000 emails
- Pay as you go available

---

## Support

**Resend Support:**
- Email: support@resend.com
- Docs: https://resend.com/docs
- Discord: https://resend.com/discord
- Status: https://status.resend.com

**Your Application:**
- Issues? Check `server/src/services/emailService.js`
- Logs: Check your server logs for email errors
- Test script: Use `test-resend-setup.js` for diagnostics

---

## Summary

✅ **Resend is the best choice for movelinker because:**
- Simple setup
- Reliable delivery
- Great free tier (3,000 emails/month)
- Easy domain verification
- Excellent documentation
- Modern API
- Built for developers

**Your two email addresses:**
1. `noreply@movelinker.com` - Automated emails (verification, password reset, notifications)
2. `support@movelinker.com` - User support (can forward to your personal email)

---

Good luck with your email setup! 🚀


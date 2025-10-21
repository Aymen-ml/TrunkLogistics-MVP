# Using Testmail.app Instead of SendGrid

## What is Testmail.app?

Testmail.app is a testing email service that provides:
- ✅ Free SMTP server for testing
- ✅ Temporary email addresses
- ✅ Web interface to view sent emails
- ✅ API access to emails
- ✅ No sender verification needed!
- ✅ Perfect for testing password reset functionality

## Setup Instructions

### Step 1: Get Testmail.app Credentials

1. **Go to**: https://testmail.app/
2. **Sign up** for a free account (or use without signup for basic testing)
3. **Get your credentials**:
   - Namespace: You'll get a unique namespace (e.g., `yournamespace`)
   - API Key: Found in your dashboard
   - SMTP Details: Available on the dashboard

### Step 2: Configure Environment Variables

Update your Render environment variables:

#### Option A: Use Testmail.app SMTP (Recommended)

```env
# Remove SendGrid config
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=...

# Add Testmail.app SMTP config
EMAIL_HOST=smtp.testmail.app
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-namespace@testmail.app
EMAIL_PASSWORD=your-api-key

# From address (can be anything with testmail.app)
EMAIL_FROM=noreply@testmail.app
EMAIL_FROM_NAME=TrunkLogistics

# Client URL
CLIENT_URL=https://truck-logistics-mvp.vercel.app
```

#### Option B: Use Gmail with Testmail.app for Receiving

You can also keep your Gmail for sending and use Testmail.app just for testing:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=korichiaymen27@gmail.com
EMAIL_PASSWORD=your-app-password

EMAIL_FROM=korichiaymen27@gmail.com
EMAIL_FROM_NAME=TrunkLogistics
CLIENT_URL=https://truck-logistics-mvp.vercel.app
```

Then use testmail.app email addresses when testing password reset.

### Step 3: Test Password Reset

1. **Generate a test email address**:
   ```
   Format: anyname.yournamespace@inbox.testmail.app
   Example: user1.mycompany@inbox.testmail.app
   ```

2. **Create a test user** in your app with this email, or use it for password reset

3. **Request password reset** from:
   ```
   https://truck-logistics-mvp.vercel.app/forgot-password
   ```

4. **View the email** at:
   ```
   https://testmail.app/inbox/yournamespace
   ```

### Step 4: Verify It Works

Go to testmail.app inbox and you should see the password reset email immediately!

## Advantages Over SendGrid

| Feature | SendGrid | Testmail.app |
|---------|----------|--------------|
| Free Tier | Limited | Generous |
| Setup Time | 10-15 min | 2-3 min |
| Sender Verification | Required | Not needed |
| Testing | Limited | Excellent |
| Production Ready | Yes | No (testing only) |
| Email Viewing | Activity feed | Full inbox UI |
| API Access | Yes | Yes |
| Cost | $15+/month after free | Free for testing |

## Configuration in Your Code

The good news is **no code changes needed**! Your existing email service code already supports SMTP configuration:

```javascript
// server/src/services/emailService.js
// This already works with any SMTP provider including Testmail.app

if (process.env.EMAIL_SERVICE === 'gmail') {
  // Gmail config
} else if (process.env.EMAIL_SERVICE === 'sendgrid') {
  // SendGrid config
} else {
  // Generic SMTP config - THIS WORKS WITH TESTMAIL.APP!
  this.transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}
```

## Complete Setup Example

### On Render (Production/Testing)

```env
# Testmail.app Configuration
EMAIL_HOST=smtp.testmail.app
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=mycompany@testmail.app
EMAIL_PASSWORD=your-testmail-api-key

# Email details
EMAIL_FROM=noreply@testmail.app
EMAIL_FROM_NAME=TrunkLogistics

# App URLs
CLIENT_URL=https://truck-logistics-mvp.vercel.app
NODE_ENV=production
```

### Local Development (.env)

```env
# Testmail.app Configuration
EMAIL_HOST=smtp.testmail.app
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=mycompany@testmail.app
EMAIL_PASSWORD=your-testmail-api-key

# Email details
EMAIL_FROM=noreply@testmail.app
EMAIL_FROM_NAME=TrunkLogistics

# App URLs
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Testing Workflow

1. **Set up Testmail.app** credentials in Render
2. **Restart your server** on Render
3. **Create test users** with testmail.app email addresses:
   ```
   user1.mycompany@inbox.testmail.app
   user2.mycompany@inbox.testmail.app
   admin.mycompany@inbox.testmail.app
   ```
4. **Test password reset**:
   - Go to forgot password page
   - Enter testmail.app email
   - Go to https://testmail.app/inbox/mycompany
   - See the email immediately!
5. **Click reset link** and test full flow

## Using Testmail.app API (Optional)

You can also check emails programmatically:

```bash
# Get inbox messages
curl https://api.testmail.app/api/json?apikey=YOUR_API_KEY&namespace=mycompany&tag=user1

# Check specific email
curl https://api.testmail.app/api/json?apikey=YOUR_API_KEY&namespace=mycompany&tag=user1&livequery=true
```

## Testmail.app Features

### 1. Multiple Namespaces
Create different namespaces for different environments:
- `mycompany-dev` - Development
- `mycompany-staging` - Staging
- `mycompany-test` - Testing

### 2. Tags (Email Prefixes)
Use different tags for different users:
- `admin.mycompany@inbox.testmail.app`
- `customer.mycompany@inbox.testmail.app`
- `provider.mycompany@inbox.testmail.app`

### 3. Auto-Cleanup
Emails are automatically cleaned up after a period (configurable)

### 4. Webhooks
Get notified when emails arrive (for automated testing)

## Comparison: Which to Use?

### Use Testmail.app When:
- ✅ Testing and development
- ✅ You need to see emails quickly
- ✅ You want to avoid sender verification
- ✅ You're building/debugging email features
- ✅ You need temporary email addresses

### Use SendGrid When:
- ✅ Production with real users
- ✅ You need high deliverability
- ✅ You want professional email domain
- ✅ You need email analytics
- ✅ You're ready for production launch

### Use Gmail When:
- ✅ Quick personal projects
- ✅ Low volume sending
- ✅ You already have Gmail
- ✅ Testing with real email addresses

## Hybrid Approach (Recommended)

Use different email services for different environments:

```javascript
// Example configuration strategy

// .env.development
EMAIL_HOST=smtp.testmail.app
EMAIL_USER=dev@testmail.app

// .env.staging  
EMAIL_HOST=smtp.testmail.app
EMAIL_USER=staging@testmail.app

// .env.production (Render)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=...
```

## Quick Start Commands

```bash
# 1. Update Render environment variables (use testmail.app SMTP)
# 2. Restart Render service
# 3. Test with this command:

cd server
node test-password-reset.js user1.yournamespace@inbox.testmail.app

# 4. Check email at:
#    https://testmail.app/inbox/yournamespace
```

## Troubleshooting

### Issue: "Authentication failed"

**Solution**: 
- Check EMAIL_USER is correct: `yournamespace@testmail.app`
- Check EMAIL_PASSWORD is your API key from testmail.app
- Verify credentials at https://testmail.app/

### Issue: "Connection timeout"

**Solution**:
- Verify EMAIL_HOST is `smtp.testmail.app`
- Verify EMAIL_PORT is `587`
- Check Render allows outbound SMTP connections

### Issue: "Email not showing up"

**Solution**:
- Go to correct inbox: `https://testmail.app/inbox/yournamespace`
- Check the tag matches email prefix
- Wait a few seconds and refresh
- Check Render logs for send confirmation

## Environment Variables Checklist

```env
# For Testmail.app (remove SendGrid vars)
EMAIL_HOST=smtp.testmail.app
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=yournamespace@testmail.app
EMAIL_PASSWORD=your-api-key-from-testmail-dashboard

EMAIL_FROM=noreply@testmail.app
EMAIL_FROM_NAME=TrunkLogistics

CLIENT_URL=https://truck-logistics-mvp.vercel.app
NODE_ENV=production

# Remove these if using Testmail.app:
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=...
```

## Testing Checklist

After setup:

- [ ] Environment variables updated in Render
- [ ] Server restarted
- [ ] Test user created with testmail.app email
- [ ] Password reset requested
- [ ] Email visible in testmail.app inbox
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password

## Conclusion

**Testmail.app is perfect for testing and development!**

Advantages:
- ✅ No sender verification needed
- ✅ Instant email viewing
- ✅ Free for testing
- ✅ Easy setup (2 minutes)
- ✅ Great for debugging

**For production with real users**, consider moving to SendGrid or another production email service later.

## Support Links

- Testmail.app: https://testmail.app/
- Testmail.app Docs: https://testmail.app/docs/
- Testmail.app API: https://testmail.app/docs/api/
- Dashboard: https://testmail.app/dashboard/

---

**Ready to switch? Just update your Render environment variables and restart!** 🚀

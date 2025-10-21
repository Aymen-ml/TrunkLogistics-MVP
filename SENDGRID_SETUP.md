# SendGrid Setup for TruckLogistics

## Environment Variables to Add in Render

Once you have your SendGrid API key, add these environment variables in your Render dashboard:

### Go to: https://dashboard.render.com
1. Select your `trucklogistics-api` service
2. Go to **Environment** tab
3. Add these variables:

```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@trucklogistics.com
EMAIL_FROM_NAME=TruckLogistics
```

## Replace the API Key
Replace `SG.your_api_key_here` with your actual SendGrid API key.

## After Adding Variables
1. Click **Save Changes**
2. Render will automatically redeploy your service
3. Wait for deployment to complete (about 2-3 minutes)

## Test the Setup
After deployment, test with:
```bash
curl -X POST https://trucklogistics-api.onrender.com/api/email/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## Verify Configuration
Check configuration with:
```bash
curl https://trucklogistics-api.onrender.com/api/email/test-email-config
```

You should see:
- `emailService: "sendgrid"`
- `hasTransporter: true`
- `emailServiceTest.success: true`

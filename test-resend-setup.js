const fetch = require('node-fetch');
require('dotenv').config({ path: './server/.env' });

async function testResendEmail() {
  console.log('🧪 Testing Resend Email Setup for movelinker\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'noreply@movelinker.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'movelinker';
  
  console.log('📋 Configuration Check:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in server/.env file');
    console.log('\n📝 Please add to server/.env:');
    console.log('   RESEND_API_KEY=re_your_api_key_here');
    return;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 15) + '...');
  console.log('✅ From Email:', fromEmail);
  console.log('✅ From Name:', fromName);
  console.log('');
  
  // Get test email from command line or use default
  const testEmail = process.argv[2] || 'YOUR_EMAIL@example.com';
  
  if (testEmail === 'YOUR_EMAIL@example.com') {
    console.log('⚠️  Using default email. Run with your email:');
    console.log('   node test-resend-setup.js your-email@example.com\n');
  }
  
  console.log('📧 Sending test email to:', testEmail);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: testEmail,
        subject: '✅ Test Email - movelinker Setup Complete',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1E3A8A; padding-bottom: 20px; background: linear-gradient(135deg, #EFF6FF 0%, #FFF7ED 100%); padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #1E3A8A; margin: 0; font-size: 28px; font-weight: 700;">movelinker</h1>
              <p style="color: #6B7280; margin: 8px 0 0 0; font-size: 13px; font-weight: 500;">Connecting Providers & Businesses</p>
            </div>
            
            <div style="padding: 20px;">
              <h2 style="color: #1E3A8A; margin-top: 0; font-size: 22px; font-weight: 600;">✅ Email Service Test Successful!</h2>
              
              <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">Hello!</p>
              
              <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">
                This is a test email from your <strong>movelinker</strong> application. If you're receiving this, your email configuration is working correctly! 🎉
              </p>
              
              <div style="background-color: #F0FDF4; border-left: 4px solid #059669; padding: 20px; border-radius: 4px; margin: 25px 0;">
                <h3 style="color: #059669; margin-top: 0; font-size: 16px;">Email Configuration Details</h3>
                <table style="width: 100%; color: #374151; font-size: 14px;">
                  <tr>
                    <td style="padding: 5px 0;"><strong>From:</strong></td>
                    <td style="padding: 5px 0;">${fromName} &lt;${fromEmail}&gt;</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;"><strong>Service:</strong></td>
                    <td style="padding: 5px 0;">Resend</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;"><strong>Domain:</strong></td>
                    <td style="padding: 5px 0;">movelinker.com</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;"><strong>Status:</strong></td>
                    <td style="padding: 5px 0;"><span style="color: #059669; font-weight: 600;">✅ Active & Working</span></td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #FFF7ED; border: 2px solid #F97316; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <h3 style="color: #9A3412; margin-top: 0; font-size: 16px;">📋 Next Steps:</h3>
                <ol style="margin: 10px 0; padding-left: 20px; color: #374151;">
                  <li style="margin: 8px 0;">Verify this email shows as from <strong>noreply@movelinker.com</strong></li>
                  <li style="margin: 8px 0;">Check it didn't land in spam folder</li>
                  <li style="margin: 8px 0;">Test password reset functionality</li>
                  <li style="margin: 8px 0;">Test email verification flow</li>
                  <li style="margin: 8px 0;">Test booking notification emails</li>
                </ol>
              </div>
              
              <p style="margin: 20px 0; color: #374151; line-height: 1.6;">
                Your application is now ready to send automated emails for:
              </p>
              
              <ul style="color: #374151; line-height: 1.8;">
                <li>✅ User registration & email verification</li>
                <li>✅ Password reset requests</li>
                <li>✅ Booking confirmations & updates</li>
                <li>✅ Provider verification notifications</li>
                <li>✅ System notifications</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            
            <div style="text-align: center; color: #6B7280; font-size: 12px; padding: 20px;">
              <p style="margin: 0 0 5px 0;">This is an automated test email from movelinker</p>
              <p style="margin: 0 0 5px 0; font-weight: 600;">© 2025 movelinker. All rights reserved.</p>
              <p style="margin: 5px 0 0 0; color: #1E3A8A;">Need help? Contact us at support@movelinker.com</p>
            </div>
          </div>
        `,
        text: `
movelinker - Email Service Test

This is a test email from your movelinker application.

Email Configuration:
- From: ${fromName} <${fromEmail}>
- Service: Resend
- Domain: movelinker.com
- Status: Active & Working

If you're receiving this, your email configuration is working correctly!

Next Steps:
1. Verify this email shows as from noreply@movelinker.com
2. Check it didn't land in spam folder
3. Test password reset functionality
4. Test email verification flow
5. Test booking notification emails

Need help? Contact us at support@movelinker.com

© 2025 movelinker. All rights reserved.
        `
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!\n');
      console.log('📧 Email Details:');
      console.log('   Email ID:', data.id);
      console.log('   From:', `${fromName} <${fromEmail}>`);
      console.log('   To:', testEmail);
      console.log('   Subject: ✅ Test Email - movelinker Setup Complete');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 SUCCESS! Your Resend setup is complete and working!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📋 Next Steps:');
      console.log('   1. Check your inbox for the test email');
      console.log('   2. Verify sender shows as: movelinker <noreply@movelinker.com>');
      console.log('   3. Check spam folder if you don\'t see it');
      console.log('   4. Test password reset: node server/test-password-reset.js ' + testEmail);
      console.log('   5. Test registration with email verification');
      console.log('');
      console.log('📊 View email in Resend dashboard:');
      console.log('   https://resend.com/emails/' + data.id);
      console.log('');
    } else {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ Failed to send email');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.error('Status Code:', response.status);
      console.error('Error Response:', JSON.stringify(data, null, 2));
      console.log('');
      
      if (data.message) {
        if (data.message.includes('Domain not found') || data.message.includes('not verified')) {
          console.log('⚠️  DOMAIN NOT VERIFIED\n');
          console.log('Your domain "movelinker.com" is not verified in Resend yet.\n');
          console.log('To fix this:');
          console.log('1. Go to https://resend.com/domains');
          console.log('2. Click on "movelinker.com"');
          console.log('3. Copy all DNS records (SPF, DKIM)');
          console.log('4. Add them to your domain registrar\'s DNS settings');
          console.log('5. Wait 15-30 minutes for DNS propagation');
          console.log('6. Click "Verify Domain" in Resend');
          console.log('7. Wait for all checkmarks to turn green ✅\n');
        } else if (data.message.includes('API key') || data.message.includes('Unauthorized')) {
          console.log('⚠️  API KEY ISSUE\n');
          console.log('Your API key might be invalid or expired.\n');
          console.log('To fix this:');
          console.log('1. Go to https://resend.com/api-keys');
          console.log('2. Create a new API key');
          console.log('3. Copy the key (starts with "re_")');
          console.log('4. Update server/.env:');
          console.log('   RESEND_API_KEY=re_your_new_api_key_here');
          console.log('5. Restart your server\n');
        }
      }
    }
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error sending email');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('Error:', error.message);
    console.log('');
    console.log('Common fixes:');
    console.log('1. Check your internet connection');
    console.log('2. Verify RESEND_API_KEY in server/.env');
    console.log('3. Run: npm install node-fetch');
    console.log('4. Try again in a few minutes\n');
  }
}

// Run the test
testResendEmail();

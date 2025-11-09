#!/bin/bash

# Quick Email Update Script
# Updates server/.env to use noreply@movelinker.com

echo "📧 Updating email configuration to noreply@movelinker.com"
echo ""

# Backup current .env
cp server/.env server/.env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up current .env file"

# Display current configuration
echo ""
echo "Current configuration:"
grep -E "^EMAIL_FROM=" server/.env || echo "EMAIL_FROM not set"
echo ""

# Prompt for email service choice
echo "Choose your email service:"
echo "1) Resend (recommended - you're currently using this)"
echo "2) SendGrid"
echo "3) Custom SMTP"
echo ""
read -p "Enter choice (1-3): " choice

echo ""

case $choice in
  1)
    echo "📧 Configuring Resend with noreply@movelinker.com"
    echo ""
    echo "Steps to complete:"
    echo "1. Go to https://resend.com/domains"
    echo "2. Add domain: movelinker.com"
    echo "3. Add DNS records shown by Resend"
    echo "4. Verify domain"
    echo "5. Your API key should already be set in .env"
    echo ""
    
    # Update EMAIL_FROM in .env
    if grep -q "^EMAIL_FROM=" server/.env; then
      sed -i 's|^EMAIL_FROM=.*|EMAIL_FROM=noreply@movelinker.com|g' server/.env
      echo "✅ Updated EMAIL_FROM to noreply@movelinker.com"
    else
      echo "EMAIL_FROM=noreply@movelinker.com" >> server/.env
      echo "✅ Added EMAIL_FROM=noreply@movelinker.com"
    fi
    
    # Make sure EMAIL_SERVICE is set to resend
    if grep -q "^EMAIL_SERVICE=" server/.env; then
      sed -i 's|^EMAIL_SERVICE=.*|EMAIL_SERVICE=resend|g' server/.env
    else
      echo "EMAIL_SERVICE=resend" >> server/.env
    fi
    
    echo "✅ Configuration updated for Resend"
    ;;
    
  2)
    echo "📧 Configuring SendGrid with noreply@movelinker.com"
    echo ""
    read -p "Enter your SendGrid API key: " api_key
    
    if [ -z "$api_key" ]; then
      echo "❌ API key cannot be empty"
      exit 1
    fi
    
    # Update configuration
    if grep -q "^EMAIL_SERVICE=" server/.env; then
      sed -i 's|^EMAIL_SERVICE=.*|EMAIL_SERVICE=sendgrid|g' server/.env
    else
      echo "EMAIL_SERVICE=sendgrid" >> server/.env
    fi
    
    if grep -q "^SENDGRID_API_KEY=" server/.env; then
      sed -i "s|^SENDGRID_API_KEY=.*|SENDGRID_API_KEY=$api_key|g" server/.env
    else
      echo "SENDGRID_API_KEY=$api_key" >> server/.env
    fi
    
    if grep -q "^EMAIL_FROM=" server/.env; then
      sed -i 's|^EMAIL_FROM=.*|EMAIL_FROM=noreply@movelinker.com|g' server/.env
    else
      echo "EMAIL_FROM=noreply@movelinker.com" >> server/.env
    fi
    
    echo "✅ Configuration updated for SendGrid"
    echo ""
    echo "⚠️  IMPORTANT: Verify sender in SendGrid:"
    echo "   1. Go to https://app.sendgrid.com/settings/sender_auth"
    echo "   2. Verify noreply@movelinker.com"
    ;;
    
  3)
    echo "📧 Configuring Custom SMTP with noreply@movelinker.com"
    echo ""
    read -p "SMTP Host (e.g., mail.movelinker.com): " smtp_host
    read -p "SMTP Port (587 or 465): " smtp_port
    read -p "Use TLS? (y/n): " use_tls
    read -p "SMTP Username: " smtp_user
    read -s -p "SMTP Password: " smtp_pass
    echo ""
    
    if [ -z "$smtp_host" ] || [ -z "$smtp_port" ] || [ -z "$smtp_user" ] || [ -z "$smtp_pass" ]; then
      echo "❌ All fields are required"
      exit 1
    fi
    
    secure="false"
    if [ "$use_tls" = "y" ] || [ "$use_tls" = "Y" ]; then
      secure="true"
    fi
    
    # Update configuration
    if grep -q "^EMAIL_SERVICE=" server/.env; then
      sed -i 's|^EMAIL_SERVICE=.*|EMAIL_SERVICE=smtp|g' server/.env
    else
      echo "EMAIL_SERVICE=smtp" >> server/.env
    fi
    
    if grep -q "^EMAIL_HOST=" server/.env; then
      sed -i "s|^EMAIL_HOST=.*|EMAIL_HOST=$smtp_host|g" server/.env
    else
      echo "EMAIL_HOST=$smtp_host" >> server/.env
    fi
    
    if grep -q "^EMAIL_PORT=" server/.env; then
      sed -i "s|^EMAIL_PORT=.*|EMAIL_PORT=$smtp_port|g" server/.env
    else
      echo "EMAIL_PORT=$smtp_port" >> server/.env
    fi
    
    if grep -q "^EMAIL_SECURE=" server/.env; then
      sed -i "s|^EMAIL_SECURE=.*|EMAIL_SECURE=$secure|g" server/.env
    else
      echo "EMAIL_SECURE=$secure" >> server/.env
    fi
    
    if grep -q "^EMAIL_USER=" server/.env; then
      sed -i "s|^EMAIL_USER=.*|EMAIL_USER=$smtp_user|g" server/.env
    else
      echo "EMAIL_USER=$smtp_user" >> server/.env
    fi
    
    if grep -q "^EMAIL_PASSWORD=" server/.env; then
      sed -i "s|^EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$smtp_pass|g" server/.env
    else
      echo "EMAIL_PASSWORD=$smtp_pass" >> server/.env
    fi
    
    if grep -q "^EMAIL_FROM=" server/.env; then
      sed -i 's|^EMAIL_FROM=.*|EMAIL_FROM=noreply@movelinker.com|g' server/.env
    else
      echo "EMAIL_FROM=noreply@movelinker.com" >> server/.env
    fi
    
    echo "✅ Configuration updated for Custom SMTP"
    ;;
    
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "========================================="
echo "✅ Email configuration updated!"
echo "========================================="
echo ""
echo "Updated configuration:"
grep -E "^EMAIL_FROM=|^EMAIL_SERVICE=" server/.env
echo ""
echo "Next steps:"
echo "1. Run: node test-custom-email.js [your-email]"
echo "2. Check your inbox for test emails"
echo "3. If using Resend/SendGrid, verify domain in dashboard"
echo ""
echo "Backup saved at: server/.env.backup.*"
echo ""

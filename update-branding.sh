#!/bin/bash

echo "🔄 Updating branding from trucklogistics to movelinker..."
echo ""

# Update URLs
echo "📍 Step 1: Updating URLs..."
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|trucklogistics\.me|movelinker.com|g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|trucklogistics\.netlify\.app|movelinker.com|g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|trucklogistics-mvp\.netlify\.app|movelinker.com|g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|trucklogistics-api\.onrender\.com|api.movelinker.com|g' {} \;

echo "✅ URLs updated"
echo ""

# Update emails
echo "📧 Step 2: Updating email addresses..."

# Update noreply emails
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|noreply@trucklogistics\.com|noreply@movelinker.com|g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|noreply@trucklogistics\.me|noreply@movelinker.com|g' {} \;

# Update support emails
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|support@trucklogistics\.com|support@movelinker.com|g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|support@trucklogistics\.me|support@movelinker.com|g' {} \;

# Update admin emails
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|admin@trucklogistics\.com|admin@movelinker.com|g' {} \;

# Update postmaster emails
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|postmaster@trucklogistics\.me|postmaster@movelinker.com|g' {} \;

# Update contact emails
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  -exec sed -i 's|contact@movelinker|contact@movelinker|g' {} \;

echo "✅ Email addresses updated"
echo ""

# Update app name (case-sensitive replacements)
echo "🏷️  Step 3: Updating app name references..."

# Update "TruckLogistics" to "movelinker" (keep lowercase)
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/TruckLogistics Team/movelinker Team/g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/"TruckLogistics"/"movelinker"/g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "*/package-lock.json" \
  ! -path "./update-branding.sh" \
  -exec sed -i "s/'TruckLogistics'/'movelinker'/g" {} \;

# Update specific branded text in email templates
find . -type f \( -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/<h1 style="color: #1E3A8A; margin: 0; font-size: 28px; font-weight: 700;">TruckLogistics<\/h1>/<h1 style="color: #1E3A8A; margin: 0; font-size: 28px; font-weight: 700;">movelinker<\/h1>/g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/<h2 style="color: #2563eb;">Welcome to TruckLogistics!<\/h2>/<h2 style="color: #2563eb;">Welcome to movelinker!<\/h2>/g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/using TruckLogistics!/using movelinker!/g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/Welcome to TruckLogistics!/Welcome to movelinker!/g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/© 2025 TruckLogistics\./© 2025 movelinker./g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/TruckLogistics account/movelinker account/g' {} \;

find . -type f \( -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/build/*" \
  ! -path "*/dist/*" \
  ! -path "./update-branding.sh" \
  -exec sed -i 's/automated security email from TruckLogistics/automated security email from movelinker/g' {} \;

echo "✅ App name references updated"
echo ""

# Update .env files specifically
echo "🔧 Step 4: Updating environment files..."
if [ -f "server/.env" ]; then
  sed -i 's|EMAIL_FROM=.*|EMAIL_FROM=noreply@movelinker.com|g' server/.env
  sed -i 's|EMAIL_FROM_NAME=.*|EMAIL_FROM_NAME=movelinker|g' server/.env
  sed -i 's|CLIENT_URL=.*|CLIENT_URL=https://movelinker.com|g' server/.env
  sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://movelinker.com|g' server/.env
  echo "✅ server/.env updated"
fi

if [ -f "server/.env.example" ]; then
  sed -i 's|EMAIL_FROM=.*|EMAIL_FROM=noreply@movelinker.com|g' server/.env.example
  sed -i 's|FROM_EMAIL=.*|FROM_EMAIL=noreply@movelinker.com|g' server/.env.example
  sed -i 's|FROM_NAME=.*|FROM_NAME=movelinker|g' server/.env.example
  sed -i 's|CLIENT_URL=.*|CLIENT_URL=https://movelinker.com|g' server/.env.example
  sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://movelinker.com|g' server/.env.example
  echo "✅ server/.env.example updated"
fi

if [ -f ".env.example" ]; then
  sed -i 's|EMAIL_FROM=.*|EMAIL_FROM=noreply@movelinker.com|g' .env.example
  sed -i 's|EMAIL_FROM_NAME=.*|EMAIL_FROM_NAME=movelinker|g' .env.example
  sed -i 's|CLIENT_URL=.*|CLIENT_URL=https://movelinker.com|g' .env.example
  echo "✅ .env.example updated"
fi

echo ""
echo "✅ Branding update complete!"
echo ""
echo "📋 Summary of changes:"
echo "   • URLs: trucklogistics.* → movelinker.com"
echo "   • API: api.movelinker.com → api.movelinker.com"
echo "   • noreply: noreply@trucklogistics.* → noreply@movelinker.com"
echo "   • support: support@trucklogistics.* → support@movelinker.com"
echo "   • App name: TruckLogistics → movelinker"
echo ""
echo "⚠️  Note: You'll need to update:"
echo "   1. Deployment URLs (Netlify/Vercel)"
echo "   2. Backend API URL (Render)"
echo "   3. Email service sender verification (SendGrid/Resend)"
echo "   4. Domain DNS settings for movelinker.com"
echo ""

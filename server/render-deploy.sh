#!/bin/bash

echo "🚀 Starting Render deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run deployment fixes
echo "🔧 Running deployment fixes..."
node fix-deployment-issues.js

# Start the server
echo "🌟 Starting server..."
npm start
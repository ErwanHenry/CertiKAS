#!/bin/bash

# CertiKAS Deployment Script

set -e

echo "🚀 CertiKAS Deployment Script"
echo "=============================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check environment
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  VERCEL_TOKEN not set. You'll need to authenticate manually."
fi

# Build check
echo "📦 Running build check..."
npm run build || {
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
}

# Run tests
echo "🧪 Running tests..."
npm test || {
    echo "⚠️  Tests failed. Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
}

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

if [ "$1" == "--production" ] || [ "$1" == "-p" ]; then
    echo "📍 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "📍 Deploying to PREVIEW..."
    vercel
fi

echo "✅ Deployment complete!"
echo ""
echo "🌐 Visit your deployment:"
echo "   Production: https://certikas.vercel.app"
echo "   Preview: Check terminal output above"
echo ""
echo "📊 Monitor status: https://vercel.com/dashboard"

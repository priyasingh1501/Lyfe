#!/bin/bash

echo "⚡ Vercel Deployment Script for Untangle App"
echo "========================================"

echo ""
echo "🎯 This script will help you deploy your Untangle app to Vercel"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
else
    echo "✅ Vercel CLI found!"
fi

echo ""
echo "📦 Building application..."
npm run build:all

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your backend on Railway or another service"
echo "2. Update REACT_APP_API_URL in Vercel dashboard"
echo "3. Test your deployed application"
echo ""
echo "📚 For detailed instructions, see VERCEL_DEPLOYMENT.md"


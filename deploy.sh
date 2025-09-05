#!/bin/bash

echo "🚀 Untangle Application Deployment Script"
echo "====================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your production environment variables"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build:all

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🎯 Choose your deployment platform:"
echo "1. Render (Recommended - Easiest)"
echo "2. Railway"
echo "3. Heroku"
echo "4. Vercel (Frontend only)"
echo "5. Manual deployment"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Render..."
        echo "1. Go to https://render.com"
        echo "2. Connect your GitHub repository"
        echo "3. Import using render.yaml"
        echo "4. Set environment variables"
        echo "5. Deploy!"
        ;;
    2)
        echo "🚂 Deploying to Railway..."
        echo "1. Go to https://railway.app"
        echo "2. Connect your GitHub repository"
        echo "3. Deploy automatically"
        echo "4. Set environment variables"
        ;;
    3)
        echo "🦸 Deploying to Heroku..."
        if command -v heroku &> /dev/null; then
            echo "Heroku CLI found. Starting deployment..."
            npm run deploy:heroku
        else
            echo "Heroku CLI not found. Please install it first:"
            echo "npm install -g heroku"
            echo "Then run: heroku login && heroku create your-app-name"
        fi
        ;;
    4)
        echo "⚡ Deploying to Vercel..."
        echo "1. Go to https://vercel.com"
        echo "2. Import your repository"
        echo "3. Configure build settings to point to client folder"
        echo "4. Deploy!"
        ;;
    5)
        echo "📋 Manual deployment steps:"
        echo "1. Upload your code to your hosting provider"
        echo "2. Set environment variables"
        echo "3. Install dependencies: npm install"
        echo "4. Build frontend: cd client && npm run build"
        echo "5. Start server: npm start"
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment instructions completed!"
echo "Check the DEPLOYMENT.md file for detailed steps."
echo ""
echo "📝 Don't forget to:"
echo "- Set up MongoDB Atlas for production database"
echo "- Configure environment variables"
echo "- Test your deployed application"
echo "- Set up monitoring and logging"

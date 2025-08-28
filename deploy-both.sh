#!/bin/bash

echo "🚀 Deploying Alfred Lifestyle Manager to Railway (Backend) and Vercel (Frontend)"

# Step 1: Deploy Backend to Railway
echo "📦 Step 1: Deploying Backend to Railway..."
echo "   - Make sure you have Railway CLI installed: npm install -g @railway/cli"
echo "   - Run: railway login"
echo "   - Run: railway up"

# Step 2: Deploy Frontend to Vercel
echo "🌐 Step 2: Deploying Frontend to Vercel..."
echo "   - Make sure you have Vercel CLI installed: npm install -g vercel"
echo "   - Run: cd client && vercel --prod"

# Step 3: Update Environment Variables
echo "⚙️  Step 3: Update Environment Variables..."
echo "   - In Vercel dashboard, set REACT_APP_API_URL to your Railway backend URL"
echo "   - In Railway dashboard, set your MongoDB and OpenAI API keys"

echo ""
echo "✅ Deployment complete! Your app should be available at:"
echo "   - Backend: https://your-app.railway.app"
echo "   - Frontend: https://your-app.vercel.app"

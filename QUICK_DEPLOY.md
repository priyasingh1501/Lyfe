# 🚀 Quick Deploy - Untangle App

## ⚡ Fastest Way: Render (5 minutes)

1. **Go to [render.com](https://render.com)** and sign up
2. **Click "New +"** → "Blueprint"
3. **Connect your GitHub** repository
4. **Select your Untangle repository**
5. **Render will auto-detect** the `render.yaml` configuration
6. **Set these environment variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/untangle
   JWT_SECRET=your_random_secret_here
   OPENAI_API_KEY=sk-your_openai_key
   NODE_ENV=production
   ```
7. **Click "Apply"** - Render will deploy both frontend and backend!

## 🗄️ MongoDB Atlas Setup (2 minutes)

1. **Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)**
2. **Create free account** and cluster
3. **Create database user** (remember username/password)
4. **Get connection string** and replace `MONGODB_URI`
5. **Whitelist IP** (0.0.0.0/0 for all IPs)

## 🔑 Generate JWT Secret

Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📱 Test Your Deployed App

- **Backend API**: `https://untangle-backend.onrender.com`
- **Frontend**: `https://untangle-frontend.onrender.com`

## 🆘 Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Run `./deploy.sh` for interactive deployment
- Check Render logs for any errors

## 💰 Cost

- **Render**: $7/month starter plan
- **MongoDB Atlas**: Free tier (512MB)
- **Total**: $7/month for basic usage

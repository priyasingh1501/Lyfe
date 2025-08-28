# Railway Deployment Guide

## Current Issue
The Railway deployment is failing with the error: `"npm run build" did not complete successfully: exit code: 127` and `sh: 1: react-scripts: not found`.

## Root Cause
Railway is trying to run `npm run build` which attempts to build the React client, but `react-scripts` is not available in the Railway environment since we only want to deploy the backend.

## Solution Applied

### 1. Fixed Root package.json
- Changed `build` script to: `echo 'Backend build complete - no build step needed'`
- Changed `deploy:railway` script to: `npm install`

### 2. Created .railwayignore
- Excludes entire `client/` directory
- Excludes all client-related files
- Excludes deployment files for other platforms

### 3. Updated railway.json
- Added `watchPatterns` to only watch server files
- Specified `buildCommand` as `npm install`

## Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "Fix Railway deployment - exclude client build and configure for backend only"
git push
```

### 2. Railway Environment Variables
Set these in your Railway dashboard:
- `PORT`: (Railway will set this automatically)
- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. Redeploy
- Push your changes to trigger a new deployment
- Railway should now only install backend dependencies and start the server

## Verification

### Check Build Logs
- Railway should show: `"Backend build complete - no build step needed"`
- No attempts to run `react-scripts build`
- Only backend dependencies should be installed

### Health Check
- After deployment, the server should respond to `/api/health`
- Check Railway logs for successful server startup

## Troubleshooting

### If Build Still Fails
1. **Clear Railway cache**: Delete and recreate the Railway project
2. **Check .railwayignore**: Ensure client files are properly excluded
3. **Verify railway.json**: Ensure buildCommand is set to `npm install`
4. **Check package.json**: Ensure build script doesn't reference client

### Common Issues
1. **Client files included**: Check .railwayignore is working
2. **Wrong build command**: Verify railway.json configuration
3. **Environment variables**: Ensure all required vars are set in Railway

## Expected Behavior
- Railway should only install backend dependencies
- No React build process should be attempted
- Server should start successfully on Railway's assigned port
- Health check endpoint should respond

## Next Steps
After successful Railway deployment:
1. Deploy frontend to Vercel separately
2. Update frontend config with Railway backend URL
3. Test full application functionality

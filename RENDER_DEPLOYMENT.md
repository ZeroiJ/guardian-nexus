# 🚀 Guardian Nexus Backend - Render Deployment Guide

## 📋 Prerequisites
- ✅ GitHub repository: https://github.com/ZeroiJ/guardian-nexus.git
- ✅ Backend code ready in `/server` folder
- ✅ Frontend deployed on Vercel: https://guardian-nexus.vercel.app/

## 🎯 Step-by-Step Render Deployment

### Step 1: Create Render Account
1. Go to **https://render.com/**
2. Click **"Get Started for Free"**
3. **Sign up with GitHub** (recommended for easy repo connection)
4. Verify your email address

### Step 2: Connect Your Repository
1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Click **"Connect account"** and authorize Render to access your GitHub
5. Find and select: **`guardian-nexus`** repository
6. Click **"Connect"**

### Step 3: Configure Your Service
Fill in these settings:

**Basic Settings:**
- **Name**: `guardian-nexus-backend`
- **Region**: `Oregon (US West)` (free tier region)
- **Branch**: `main`
- **Root Directory**: `server` ⚠️ **IMPORTANT**
- **Runtime**: `Node`

**Build & Deploy Settings:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys automatically on git push)

### Step 4: Add Environment Variables
In the **Environment Variables** section, add these **EXACT** variables:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://guardian-nexus.vercel.app
BUNGIE_API_KEY=5f12ede2df2f4e3ea16eba74c4d3de80
BUNGIE_CLIENT_ID=50672
BUNGIE_CLIENT_SECRET=cbKEcmx9ElgcrVpkyEo--kk46oMRAYFxAU8VwL6f71s
SUPABASE_URL=https://soppyhjcqxvffmkbpceu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvcHB5aGpjcXh2ZmZta2JwY2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTcyMDIsImV4cCI6MjA3MTk3MzIwMn0.NvvQkTDcAi5raQ3mOThkWBSliyC5FlcfPCVk2fQGdZw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvcHB5aGpjcXh2ZmZta2JwY2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM5NzIwMiwiZXhwIjoyMDcxOTczMjAyfQ.CKgbCEy53IIoPI7fb9fRpke4RKcPKl9HJIyTbrjKZjA
SESSION_SECRET=guardian_nexus_render_secret_2025
```

### Step 5: Deploy!
1. Click **"Create Web Service"**
2. Render will start building and deploying your backend
3. ⏱️ **Wait 5-10 minutes** for first deployment
4. 🎉 You'll get a URL like: `https://guardian-nexus-backend.onrender.com`

## 🧪 Testing Your Deployment

Once deployed, test these endpoints:

1. **Health Check**: 
   ```
   https://your-app-name.onrender.com/health
   ```

2. **API Info**:
   ```
   https://your-app-name.onrender.com/api
   ```

3. **Database Connection**:
   ```
   https://your-app-name.onrender.com/api/test/connection
   ```

## 🔧 Post-Deployment Configuration

### Update Bungie OAuth Settings
1. Go to **https://www.bungie.net/en/Application**
2. Edit your Guardian Nexus application
3. **Add to Redirect URIs**:
   ```
   https://your-app-name.onrender.com/api/auth/bungie/callback
   ```

### Update Frontend (if needed)
If your frontend needs to connect to the backend:
1. Go to **Vercel Dashboard** → Your frontend project
2. **Environment Variables** → Add:
   ```
   VITE_API_BASE_URL=https://your-app-name.onrender.com
   ```
3. **Redeploy** your frontend

## 📊 Render Free Tier Benefits

- ✅ **750 hours/month** free compute time
- ✅ **512 MB RAM** per service
- ✅ **Auto-scaling** with traffic
- ✅ **SSL certificates** included
- ✅ **Global CDN** for faster response
- ✅ **Automatic deploys** on git push
- ✅ **Sleep after 15 min** of inactivity (saves resources)

## 🚨 Important Notes

1. **Cold Starts**: Free tier apps "sleep" after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds to wake up
   - Subsequent requests are fast

2. **Monthly Limits**: 750 hours = ~25 days of uptime
   - Perfect for development and small projects
   - Automatically resets each month

3. **Automatic Deployments**: 
   - Every `git push` to main branch triggers new deployment
   - Great for continuous deployment

## 🎯 Expected Results

After successful deployment:

```
✅ Frontend: https://guardian-nexus.vercel.app/
✅ Backend:  https://your-app-name.onrender.com
✅ Database: Supabase (connected)
✅ API:      Bungie.net (connected)
```

## 🔍 Troubleshooting

**Build Fails?**
- Check that Root Directory is set to `server`
- Verify Build Command is `npm install`
- Check logs in Render dashboard

**App Won't Start?**
- Verify Start Command is `npm start`
- Check environment variables are set correctly
- Review logs for error messages

**Can't Connect to Database?**
- Verify Supabase environment variables
- Run database migration in Supabase dashboard
- Check Supabase project is active

Your Guardian Nexus backend will be live and ready to serve your Vercel frontend! 🌟
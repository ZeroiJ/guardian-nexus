# 🚀 Guardian Nexus Deployment Guide

## 📋 Current Status

✅ **Frontend**: Deployed on Vercel (Free Tier)
- **URL**: https://guardian-nexus.vercel.app/
- **Status**: Live and accessible

⏳ **Backend**: Ready for deployment (currently running locally)
- **Status**: Configured for production deployment
- **Ready for**: Railway, Render, or Heroku (free tiers available)

## 🎯 Next Steps: Backend Deployment

### Option 1: Railway (Recommended - Free Tier)

1. **Sign up at Railway.app** using your GitHub account
2. **Connect your repository**: https://github.com/ZeroiJ/guardian-nexus.git
3. **Deploy backend**:
   - Select the `server` folder as your app root
   - Railway will auto-detect Node.js and run `npm start`
4. **Set environment variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://guardian-nexus.vercel.app
   BUNGIE_API_KEY=5f12ede2df2f4e3ea16eba74c4d3de80
   BUNGIE_CLIENT_ID=50672
   BUNGIE_CLIENT_SECRET=cbKEcmx9ElgcrVpkyEo--kk46oMRAYFxAU8VwL6f71s
   SUPABASE_URL=https://soppyhjcqxvffmkbpceu.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvcHB5aGpjcXh2ZmZta2JwY2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTcyMDIsImV4cCI6MjA3MTk3MzIwMn0.NvvQkTDcAi5raQ3mOThkWBSliyC5FlcfPCVk2fQGdZw
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvcHB5aGpjcXh2ZmZta2JwY2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM5NzIwMiwiZXhwIjoyMDcxOTczMjAyfQ.CKgbCEy53IIoPI7fb9fRpke4RKcPKl9HJIyTbrjKZjA
   SESSION_SECRET=your_random_session_secret_here
   ```

### Option 2: Render (Alternative - Free Tier)

1. **Sign up at Render.com** using your GitHub account
2. **Create a new Web Service**
3. **Connect your repository**: https://github.com/ZeroiJ/guardian-nexus.git
4. **Configuration**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Add the same environment variables as above**

## 🔧 After Backend Deployment

1. **Get your backend URL** (e.g., `https://your-app.railway.app`)
2. **Update Bungie OAuth settings**:
   - Go to https://www.bungie.net/en/Application
   - Add your backend URL to redirect URIs: `https://your-backend-url.railway.app/auth/bungie/callback`
3. **Update frontend environment** (if needed):
   - In Vercel dashboard, add environment variable:
   - `VITE_API_BASE_URL=https://your-backend-url.railway.app`

## 📊 Database Setup

**Important**: Run the database migration in Supabase dashboard:

1. Go to your Supabase dashboard → SQL Editor
2. Run the migration file: `supabase/migrations/20250829000001_destiny_game_data.sql`
3. This creates all necessary tables for the application

## 🧪 Testing Your Deployment

Once backend is deployed, test these endpoints:

1. **Health Check**: `https://your-backend-url/health`
2. **API Info**: `https://your-backend-url/api`
3. **Database Test**: `https://your-backend-url/api/test/connection`

## 🔒 Security Notes

- All sensitive credentials are already configured
- CORS is set up to allow your Vercel frontend
- Rate limiting is enabled on all API endpoints
- Authentication is required for protected endpoints

## 💰 Cost Breakdown (Free Tiers)

- **Frontend (Vercel)**: ✅ Free - Already deployed
- **Backend (Railway/Render)**: ✅ Free - 500 hours/month
- **Database (Supabase)**: ✅ Free - 50,000 monthly active users
- **Bungie API**: ✅ Free - 25,000 requests/day

**Total Monthly Cost**: $0.00 🎉

## 🚀 Ready for Production

Your Guardian Nexus application includes:

- ✅ Complete backend API with Bungie integration
- ✅ Database layer with Supabase
- ✅ User authentication and profiles
- ✅ Community features (posts, comments, favorites)
- ✅ Comprehensive error handling and logging
- ✅ Rate limiting and security measures
- ✅ Frontend deployed and accessible

The architecture is production-ready and scalable! 🌟
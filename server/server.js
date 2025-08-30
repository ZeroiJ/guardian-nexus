import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import route modules
import bungieRoutes from './routes/bungie.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import communityRoutes from './routes/community.js';
import testRoutes from './routes/test.js';

// Import configuration and services
import { testSupabaseConnection, runMigrations } from './config/supabase.js';
import { testBungieConnection } from './config/bungie.js';
import { handleBungieErrors, rateLimiter } from './middleware/index.js';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000 by default

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // We'll configure this later based on frontend needs
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://guardian-nexus.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173', 'https://guardian-nexus.vercel.app'], // Support both local dev and deployed frontend
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Guardian Nexus Backend',
    version: '1.0.0'
  });
});

// Root endpoint for basic info
app.get('/', (req, res) => {
  res.json({
    message: '🌟 Guardian Nexus Backend API',
    status: 'Online',
    version: '1.0.0',
    description: 'Destiny 2 Companion Website Backend',
    endpoints: {
      health: '/health',
      api_info: '/api',
      bungie_api: '/api/bungie/*',
      authentication: '/api/auth/*',
      user_management: '/api/user/*',
      community: '/api/community/*',
      testing: '/api/test/*'
    },
    documentation: 'Visit /api for detailed endpoint information',
    deployed_on: 'Render (Singapore Region - Optimized for India)',
    frontend: 'https://guardian-nexus.vercel.app/'
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Guardian Nexus API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      bungie: '/api/bungie/*',
      auth: '/api/auth/*',
      user: '/api/user/*',
      community: '/api/community/*',
      test: '/api/test/*'
    }
  });
});

// Route mounting with rate limiting
app.use('/api/bungie', rateLimiter(60000, 50), bungieRoutes); // 50 requests per minute for Bungie API
app.use('/api/auth', rateLimiter(60000, 20), authRoutes); // 20 requests per minute for auth
app.use('/api/user', rateLimiter(60000, 30), userRoutes); // 30 requests per minute for user endpoints
app.use('/api/community', rateLimiter(60000, 40), communityRoutes); // 40 requests per minute for community endpoints
app.use('/api/test', rateLimiter(60000, 10), testRoutes); // 10 requests per minute for test endpoints

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Bungie API error handler (before global error handler)
app.use(handleBungieErrors);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Guardian Nexus Backend running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
  console.log(`🌐 Vercel Deployment: https://guardian-nexus.vercel.app/`);
  
  // Test external connections
  console.log('\n🔍 Testing external connections...');
  const supabaseOk = await testSupabaseConnection();
  const bungieOk = await testBungieConnection();
  
  // Check database migrations if Supabase is connected
  if (supabaseOk) {
    await runMigrations();
  }
  
  console.log('\n✨ Server initialization complete!');
  
  // Summary
  console.log('\n📊 Connection Status:');
  console.log(`   Supabase: ${supabaseOk ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   Bungie API: ${bungieOk ? '✅ Connected' : '❌ Failed'}`);
});

export default app;
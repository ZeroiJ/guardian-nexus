// Test endpoint to verify environment variables
export default async function handler(req, res) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
      .setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
      .end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      BUNGIE_API_KEY: process.env.BUNGIE_API_KEY ? 'set (length: ' + process.env.BUNGIE_API_KEY.length + ')' : 'not set',
      BUNGIE_CLIENT_ID: process.env.BUNGIE_CLIENT_ID ? 'set' : 'not set',
      BUNGIE_CLIENT_SECRET: process.env.BUNGIE_CLIENT_SECRET ? 'set' : 'not set',
      VERCEL_AUTOMATION_BYPASS_SECRET: process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? 'set' : 'not set'
    };

    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        success: true,
        environment: envCheck,
        timestamp: new Date().toISOString()
      });

  } catch (error) {
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Internal server error',
        message: error.message
      });
  }
}
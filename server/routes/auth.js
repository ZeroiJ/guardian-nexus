import express from 'express';
import { BUNGIE_CONFIG, bungieAPI } from '../config/bungie.js';
import { supabase } from '../config/supabase.js';
import axios from 'axios';

const router = express.Router();

// GET /api/auth/bungie/login - Initiate Bungie OAuth
router.get('/bungie/login', async (req, res) => {
  try {
    const { redirect_uri } = req.query;
    
    // Default redirect URI if not provided
    const redirectUri = redirect_uri || `${process.env.FRONTEND_URL}/auth/callback`;
    
    // Build OAuth authorization URL
    const authUrl = new URL(BUNGIE_CONFIG.authURL);
    authUrl.searchParams.append('client_id', BUNGIE_CONFIG.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', generateSecureState()); // CSRF protection
    
    res.json({
      success: true,
      authUrl: authUrl.toString(),
      message: 'Redirect user to this URL for Bungie authentication'
    });
  } catch (error) {
    console.error('Bungie OAuth initiation error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate Bungie OAuth',
      details: error.message
    });
  }
});

// POST /api/auth/bungie/callback - Handle OAuth callback
router.post('/bungie/callback', async (req, res) => {
  try {
    const { code, state, redirect_uri } = req.body;
    
    if (!code) {
      return res.status(400).json({
        error: 'Authorization code required',
        message: 'Missing authorization code from Bungie OAuth callback'
      });
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForTokens(code, redirect_uri);
    
    if (!tokenResponse.access_token) {
      throw new Error('Failed to obtain access token from Bungie');
    }
    
    // Get user profile information using the access token
    const userProfile = await fetchBungieUserProfile(tokenResponse.access_token);
    
    // Store or update user in Supabase
    const supabaseUser = await createOrUpdateUser(userProfile, tokenResponse);
    
    res.json({
      success: true,
      user: {
        id: supabaseUser.id,
        bungie_id: userProfile.bungie_id,
        display_name: userProfile.display_name,
        membership_type: userProfile.membership_type,
        membership_id: userProfile.membership_id
      },
      tokens: {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in
      },
      message: 'Successfully authenticated with Bungie'
    });
  } catch (error) {
    console.error('Bungie OAuth callback error:', error);
    res.status(500).json({ 
      error: 'OAuth callback failed',
      details: error.message
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Missing refresh token for token renewal'
      });
    }
    
    const newTokens = await refreshAccessToken(refresh_token);
    
    res.json({
      success: true,
      tokens: newTokens,
      message: 'Access token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(error.status || 500).json({ 
      error: 'Failed to refresh token',
      details: error.message
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // Clear user tokens from database
    if (user_id) {
      await clearUserTokens(user_id);
    }
    
    res.json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      details: error.message
    });
  }
});

// Helper function to generate secure state parameter
function generateSecureState() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper function to exchange authorization code for tokens
async function exchangeCodeForTokens(code, redirectUri) {
  const tokenUrl = BUNGIE_CONFIG.tokenURL;
  const redirectUriToUse = redirectUri || `${process.env.FRONTEND_URL}/auth/callback`;
  
  const tokenData = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUriToUse,
    client_id: BUNGIE_CONFIG.clientId,
    client_secret: BUNGIE_CONFIG.clientSecret
  };
  
  const response = await axios.post(tokenUrl, tokenData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  return response.data;
}

// Helper function to fetch user profile from Bungie
async function fetchBungieUserProfile(accessToken) {
  const userResponse = await axios.get(`${BUNGIE_CONFIG.baseURL}/User/GetCurrentBungieNetUser/`, {
    headers: {
      'X-API-Key': BUNGIE_CONFIG.apiKey,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const userData = userResponse.data.Response;
  
  // Get Destiny memberships
  const membershipResponse = await axios.get(
    `${BUNGIE_CONFIG.baseURL}/Destiny2/GetMembershipsForCurrentUser/`, 
    {
      headers: {
        'X-API-Key': BUNGIE_CONFIG.apiKey,
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  const memberships = membershipResponse.data.Response;
  const primaryMembership = memberships.destinyMemberships[0]; // Get first membership
  
  return {
    bungie_id: userData.membershipId,
    display_name: userData.displayName,
    unique_name: userData.uniqueName,
    membership_type: primaryMembership?.membershipType,
    membership_id: primaryMembership?.membershipId,
    cross_save_override: primaryMembership?.crossSaveOverride
  };
}

// Helper function to create or update user in Supabase
async function createOrUpdateUser(profile, tokens) {
  const userData = {
    bungie_id: profile.bungie_id,
    display_name: profile.display_name,
    unique_name: profile.unique_name,
    membership_type: profile.membership_type,
    membership_id: profile.membership_id,
    cross_save_override: profile.cross_save_override,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
    last_login: new Date().toISOString()
  };
  
  // Try to find existing user
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('bungie_id', profile.bungie_id)
    .single();
  
  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('bungie_id', profile.bungie_id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new user
    const { data, error } = await supabase
      .from('profiles')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Helper function to refresh access token
async function refreshAccessToken(refreshToken) {
  const tokenUrl = BUNGIE_CONFIG.tokenURL;
  
  const tokenData = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: BUNGIE_CONFIG.clientId,
    client_secret: BUNGIE_CONFIG.clientSecret
  };
  
  const response = await axios.post(tokenUrl, tokenData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  return response.data;
}

// Helper function to clear user tokens
async function clearUserTokens(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({
      access_token: null,
      refresh_token: null,
      token_expires_at: null
    })
    .eq('id', userId);
  
  if (error) throw error;
}

export default router;
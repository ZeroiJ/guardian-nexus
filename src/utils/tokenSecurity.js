/**
 * Token Security Utilities
 * Provides basic token handling for OAuth tokens in browser environment
 * Note: For production, implement proper server-side encryption
 */

// Browser-compatible crypto implementation
const crypto = window.crypto || window.msCrypto;

// Simple base64 encoding for development (not secure encryption)
const TOKEN_PREFIX = 'gt_'; // Guardian Token prefix

/**
 * Encodes a token string (basic base64 for development)
 * @param {string} token - The token to encode
 * @returns {string} Encoded token with prefix
 */
function encryptToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }

  try {
    // Simple base64 encoding with prefix for development
    const encoded = btoa(token);
    return `${TOKEN_PREFIX}${encoded}`;
  } catch (error) {
    throw new Error(`Token encoding failed: ${error.message}`);
  }
}

/**
 * Decodes an encoded token string (basic base64 for development)
 * @param {string} encodedToken - The encoded token to decode
 * @returns {string} Decoded token
 */
function decryptToken(encodedToken) {
  if (!encodedToken || typeof encodedToken !== 'string') {
    throw new Error('Encoded token must be a non-empty string');
  }

  try {
    // Remove prefix and decode base64
    if (!encodedToken.startsWith(TOKEN_PREFIX)) {
      throw new Error('Invalid token format');
    }
    
    const encoded = encodedToken.substring(TOKEN_PREFIX.length);
    return atob(encoded);
  } catch (error) {
    throw new Error(`Token decoding failed: ${error.message}`);
  }
}

/**
 * Checks if a token is encoded
 * @param {string} token - Token to check
 * @returns {boolean} True if token appears to be encoded
 */
function isTokenEncrypted(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if token has our prefix
  return token.startsWith(TOKEN_PREFIX);
}

/**
 * Securely compares two tokens in constant time to prevent timing attacks
 * @param {string} token1 - First token
 * @param {string} token2 - Second token
 * @returns {boolean} True if tokens match
 */
function secureTokenCompare(token1, token2) {
  if (!token1 || !token2 || typeof token1 !== 'string' || typeof token2 !== 'string') {
    return false;
  }
  
  if (token1.length !== token2.length) {
    return false;
  }
  
  // Simple constant-time comparison for browser compatibility
  let result = 0;
  for (let i = 0; i < token1.length; i++) {
    result |= token1.charCodeAt(i) ^ token2.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generates a secure random token for CSRF protection
 * @param {number} length - Length of token in bytes (default: 32)
 * @returns {string} Random token in hex format
 */
function generateSecureToken(length = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a token for storage (simple hash for development)
 * @param {string} token - Token to hash
 * @returns {string} Simple hash of the token
 */
function hashToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }
  
  // Simple hash for development (not cryptographically secure)
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

export {
  encryptToken,
  decryptToken,
  isTokenEncrypted,
  secureTokenCompare,
  generateSecureToken,
  hashToken
};
/**
 * Simple API Test Script
 * Tests the serverless backend endpoints to ensure they're working correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

const ENDPOINTS = [
  { path: '/api/health', method: 'GET', description: 'Health Check' },
  { path: '/api/health?testBungieApi=true', method: 'GET', description: 'Health Check with Bungie API Test' },
  { path: '/api/destiny2/manifest?action=info', method: 'GET', description: 'Manifest Info' },
  { path: '/api/destiny2/manifest?action=types', method: 'GET', description: 'Available Entity Types' }
];

/**
 * Make HTTP request
 * @param {string} url - Full URL to request
 * @param {string} method - HTTP method
 * @returns {Promise<Object>} Response data
 */
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Guardian-Nexus-Test/1.0'
      }
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Test a single endpoint
 * @param {Object} endpoint - Endpoint configuration
 * @returns {Promise<Object>} Test result
 */
async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  
  console.log(`\n🧪 Testing: ${endpoint.description}`);
  console.log(`   ${endpoint.method} ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(url, endpoint.method);
    const duration = Date.now() - startTime;
    
    const success = response.status >= 200 && response.status < 300;
    const statusIcon = success ? '✅' : '❌';
    
    console.log(`   ${statusIcon} Status: ${response.status} (${duration}ms)`);
    
    if (response.data && typeof response.data === 'object') {
      if (response.data.success !== undefined) {
        console.log(`   📊 Success: ${response.data.success}`);
      }
      if (response.data.message) {
        console.log(`   💬 Message: ${response.data.message}`);
      }
      if (response.data.error) {
        console.log(`   ⚠️  Error: ${response.data.error}`);
      }
    }
    
    return {
      endpoint: endpoint.path,
      success,
      status: response.status,
      duration,
      response: response.data
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      endpoint: endpoint.path,
      success: false,
      error: error.message
    };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Guardian Nexus API Test Suite');
  console.log('================================');
  console.log(`Base URL: ${BASE_URL}`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Summary
  console.log('\n📋 Test Summary');
  console.log('===============');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 All tests passed! The serverless backend is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API endpoints.');
    
    // Show failed tests
    const failed = results.filter(r => !r.success);
    failed.forEach(result => {
      console.log(`   - ${result.endpoint}: ${result.error || `Status ${result.status}`}`);
    });
    
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, makeRequest };
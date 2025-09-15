/**
 * OAuth State Debugging Utility
 * Provides comprehensive debugging tools for OAuth state validation issues
 */

import { validateOAuthState, cleanupOAuthState, cleanupExpiredOAuthStates } from './errorHandler';
import logger from './logger';

/**
 * OAuth State Debugger Class
 * Provides methods to debug OAuth state storage and validation issues
 */
export class OAuthStateDebugger {
  
  /**
   * Comprehensive state validation test
   * Tests the complete OAuth state lifecycle
   */
  static runFullStateTest() {
    console.log('🔍 === OAuth State Full Test ===');
    
    // Clear any existing states first
    this.clearAllStates();
    
    // Generate test state
    const testState = this.generateTestState();
    console.log('Generated test state:', testState.slice(0, 8) + '...');
    
    // Test state storage in all formats
    const results = {
      testState: testState.slice(0, 8) + '...',
      storage: this.testStateStorage(testState),
      retrieval: this.testStateRetrieval(testState),
      validation: this.testStateValidation(testState),
      cleanup: this.testStateCleanup()
    };
    
    console.log('📊 Full Test Results:', results);
    return results;
  }
  
  /**
   * Generate a test OAuth state
   */
  static generateTestState() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Test state storage in all mechanisms
   */
  static testStateStorage(testState) {
    console.log('🔧 Testing state storage...');
    
    const stateData = {
      state: testState,
      timestamp: Date.now(),
      expires: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    
    const stateString = JSON.stringify(stateData);
    
    try {
      // Test localStorage
      localStorage.setItem('bungie_oauth_state', stateString);
      const localStored = localStorage.getItem('bungie_oauth_state');
      
      // Test sessionStorage  
      sessionStorage.setItem('bungie_oauth_state', stateString);
      const sessionStored = sessionStorage.getItem('bungie_oauth_state');
      
      // Test cookie
      const cookieValue = encodeURIComponent(stateString);
      document.cookie = `bungie_oauth_state=${cookieValue}; max-age=900; path=/; SameSite=Lax`;
      const cookieStored = this.getCookieValue('bungie_oauth_state');
      
      const results = {
        localStorage: {
          stored: !!localStored,
          matches: localStored === stateString,
          length: localStored?.length || 0,
          preview: localStored?.slice(0, 50) + '...'
        },
        sessionStorage: {
          stored: !!sessionStored,
          matches: sessionStored === stateString,
          length: sessionStored?.length || 0,
          preview: sessionStored?.slice(0, 50) + '...'
        },
        cookie: {
          stored: !!cookieStored,
          matches: cookieStored === stateString,
          length: cookieStored?.length || 0,
          preview: cookieStored?.slice(0, 50) + '...',
          rawCookieValue: cookieValue?.slice(0, 50) + '...'
        },
        stateData,
        stateString: stateString?.slice(0, 50) + '...'
      };
      
      console.log('📁 Storage test results:', results);
      return results;
    } catch (error) {
      console.error('❌ Storage test failed:', error);
      return { error: error.message };
    }
  }
  
  /**
   * Test state retrieval and parsing
   */
  static testStateRetrieval(expectedState) {
    console.log('🔍 Testing state retrieval...');
    
    try {
      const localStored = localStorage.getItem('bungie_oauth_state');
      const sessionStored = sessionStorage.getItem('bungie_oauth_state');
      const cookieStored = this.getCookieValue('bungie_oauth_state');
      
      // Parse each stored value
      const parseResults = {
        localStorage: this.parseStoredState(localStored),
        sessionStorage: this.parseStoredState(sessionStored),
        cookie: this.parseStoredState(cookieStored)
      };
      
      // Check if parsed states match expected state
      const matchResults = {
        localStorage: parseResults.localStorage?.state === expectedState,
        sessionStorage: parseResults.sessionStorage?.state === expectedState,
        cookie: parseResults.cookie?.state === expectedState
      };
      
      const results = {
        rawValues: {
          localStorage: localStored?.slice(0, 50) + '...',
          sessionStorage: sessionStored?.slice(0, 50) + '...',
          cookie: cookieStored?.slice(0, 50) + '...'
        },
        parsedStates: {
          localStorage: parseResults.localStorage?.state?.slice(0, 8) + '...',
          sessionStorage: parseResults.sessionStorage?.state?.slice(0, 8) + '...',
          cookie: parseResults.cookie?.state?.slice(0, 8) + '...'
        },
        matches: matchResults,
        allMatch: Object.values(matchResults).every(match => match === true)
      };
      
      console.log('🔄 Retrieval test results:', results);
      return results;
    } catch (error) {
      console.error('❌ Retrieval test failed:', error);
      return { error: error.message };
    }
  }
  
  /**
   * Test OAuth state validation function
   */
  static testStateValidation(expectedState) {
    console.log('✅ Testing state validation...');
    
    try {
      const validationResult = validateOAuthState(expectedState, {
        enableFallbacks: true,
        strictMode: false
      });
      
      const results = {
        isValid: validationResult.isValid,
        matchedSource: validationResult.matchedSource,
        validationSources: validationResult.validationSources,
        stateAge: validationResult.stateAge,
        success: validationResult.isValid && validationResult.matchedSource !== 'none'
      };
      
      console.log('✔️ Validation test results:', results);
      return results;
    } catch (error) {
      console.error('❌ Validation test failed:', error);
      return { 
        error: error.message,
        code: error.code || 'UNKNOWN',
        context: error.context || {}
      };
    }
  }
  
  /**
   * Test state cleanup
   */
  static testStateCleanup() {
    console.log('🧹 Testing state cleanup...');
    
    try {
      // Check states before cleanup
      const beforeCleanup = {
        localStorage: !!localStorage.getItem('bungie_oauth_state'),
        sessionStorage: !!sessionStorage.getItem('bungie_oauth_state'),
        cookie: !!this.getCookieValue('bungie_oauth_state')
      };
      
      // Run cleanup
      cleanupOAuthState();
      cleanupExpiredOAuthStates();
      
      // Check states after cleanup  
      const afterCleanup = {
        localStorage: !!localStorage.getItem('bungie_oauth_state'),
        sessionStorage: !!sessionStorage.getItem('bungie_oauth_state'),
        cookie: !!this.getCookieValue('bungie_oauth_state')
      };
      
      const results = {
        beforeCleanup,
        afterCleanup,
        cleanupWorked: {
          localStorage: beforeCleanup.localStorage && !afterCleanup.localStorage,
          sessionStorage: beforeCleanup.sessionStorage && !afterCleanup.sessionStorage,
          cookie: beforeCleanup.cookie && !afterCleanup.cookie
        }
      };
      
      console.log('🗑️ Cleanup test results:', results);
      return results;
    } catch (error) {
      console.error('❌ Cleanup test failed:', error);
      return { error: error.message };
    }
  }
  
  /**
   * Parse stored state data (same logic as errorHandler)
   */
  static parseStoredState(storedValue) {
    if (!storedValue) return null;
    
    try {
      // First try to parse as JSON directly
      const parsed = JSON.parse(storedValue);
      if (parsed.state && parsed.timestamp && parsed.expires) {
        return parsed;
      }
    } catch {
      // If that fails, try with URL decoding
      try {
        const decoded = decodeURIComponent(storedValue);
        const parsed = JSON.parse(decoded);
        if (parsed.state && parsed.timestamp && parsed.expires) {
          return parsed;
        }
      } catch {
        // If both fail, treat as old format
        return {
          state: storedValue,
          timestamp: Date.now() - (5 * 60 * 1000),
          expires: Date.now() + (10 * 60 * 1000)
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get cookie value (same logic as errorHandler)
   */
  static getCookieValue(name) {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        return decodeURIComponent(cookieValue);
      }
      return null;
    } catch (error) {
      console.warn('Failed to read cookie:', name, error);
      return null;
    }
  }
  
  /**
   * Clear all OAuth states
   */
  static clearAllStates() {
    try {
      localStorage.removeItem('bungie_oauth_state');
      sessionStorage.removeItem('bungie_oauth_state');
      document.cookie = 'bungie_oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log('🗑️ All OAuth states cleared');
    } catch (error) {
      console.warn('Failed to clear states:', error);
    }
  }
  
  /**
   * Inspect current OAuth state status
   */
  static inspectCurrentState() {
    console.log('🔍 === Current OAuth State Inspection ===');
    
    const localStored = localStorage.getItem('bungie_oauth_state');
    const sessionStored = sessionStorage.getItem('bungie_oauth_state');
    const cookieStored = this.getCookieValue('bungie_oauth_state');
    
    const currentState = {
      hasStoredStates: {
        localStorage: !!localStored,
        sessionStorage: !!sessionStored,
        cookie: !!cookieStored
      },
      storedValues: {
        localStorage: localStored?.slice(0, 100) + '...',
        sessionStorage: sessionStored?.slice(0, 100) + '...',
        cookie: cookieStored?.slice(0, 100) + '...'
      },
      parsedStates: {
        localStorage: this.parseStoredState(localStored),
        sessionStorage: this.parseStoredState(sessionStored),
        cookie: this.parseStoredState(cookieStored)
      },
      allCookies: document.cookie
    };
    
    console.log('📊 Current state inspection:', currentState);
    return currentState;
  }
  
  /**
   * Simulate OAuth callback with current stored states
   */
  static simulateCallback(receivedState) {
    console.log('🎭 === Simulating OAuth Callback ===');
    console.log('Received state:', receivedState?.slice(0, 8) + '...');
    
    try {
      const validationResult = validateOAuthState(receivedState, {
        enableFallbacks: true,
        strictMode: false
      });
      
      console.log('✅ Callback simulation successful:', validationResult);
      return { success: true, result: validationResult };
    } catch (error) {
      console.error('❌ Callback simulation failed:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code,
        context: error.context
      };
    }
  }
}

// Expose debugger globally for console access
if (typeof window !== 'undefined') {
  window.__OAUTH_DEBUGGER__ = OAuthStateDebugger;
}

export default OAuthStateDebugger;
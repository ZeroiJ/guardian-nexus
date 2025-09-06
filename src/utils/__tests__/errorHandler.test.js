/**
 * Test suite for error handling utilities
 * Run with: npm test -- errorHandler.test.js
 */

import { validateOAuthState, formatUserError, GuardianError, ERROR_CODES } from '../errorHandler';

// Mock localStorage and sessionStorage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(window, 'localStorage', { value: mockStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage });

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
});

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockReturnValue(null);
    document.cookie = '';
  });

  describe('validateOAuthState', () => {
    test('should validate state successfully with localStorage match', () => {
      const testState = 'test-state-123';
      mockStorage.getItem.mockImplementation((key) => {
        if (key === 'oauth_state') return testState;
        return null;
      });

      const result = validateOAuthState(testState);
      expect(result.isValid).toBe(true);
      expect(result.matchedSource).toBe('localStorage');
    });

    test('should validate state successfully with sessionStorage match', () => {
      const testState = 'test-state-456';
      mockStorage.getItem.mockImplementation((key) => {
        if (key === 'oauth_state') {
          return key === 'oauth_state' && mockStorage === window.sessionStorage ? testState : null;
        }
        return null;
      });
      
      // Mock sessionStorage specifically
      Object.defineProperty(window, 'sessionStorage', { 
        value: { 
          ...mockStorage,
          getItem: jest.fn().mockReturnValue(testState)
        } 
      });

      const result = validateOAuthState(testState);
      expect(result.isValid).toBe(true);
    });

    test('should throw error when no state is received', () => {
      expect(() => {
        validateOAuthState(null);
      }).toThrow(GuardianError);
    });

    test('should throw error when no stored state is found', () => {
      expect(() => {
        validateOAuthState('some-state');
      }).toThrow(GuardianError);
    });
  });

  describe('formatUserError', () => {
    test('should format GuardianError with specific codes', () => {
      const error = new GuardianError(
        'Test error',
        ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED
      );
      
      const formatted = formatUserError(error);
      expect(formatted).toBe('Security validation failed. Please try connecting again.');
    });

    test('should format network errors', () => {
      const error = new GuardianError(
        'Network failed',
        ERROR_CODES.API_NETWORK_ERROR
      );
      
      const formatted = formatUserError(error);
      expect(formatted).toBe('Network connection issue. Please check your internet connection and try again.');
    });

    test('should handle regular errors', () => {
      const error = new Error('Regular error message');
      const formatted = formatUserError(error);
      expect(formatted).toBe('Regular error message');
    });

    test('should handle null/undefined errors', () => {
      expect(formatUserError(null)).toBe('An unexpected error occurred.');
      expect(formatUserError(undefined)).toBe('An unexpected error occurred.');
    });
  });

  describe('GuardianError', () => {
    test('should create error with code and context', () => {
      const context = { test: 'data' };
      const error = new GuardianError('Test message', ERROR_CODES.API_TIMEOUT_ERROR, context);
      
      expect(error.message).toBe('Test message');
      expect(error.code).toBe(ERROR_CODES.API_TIMEOUT_ERROR);
      expect(error.context).toEqual(context);
      expect(error.name).toBe('GuardianError');
      expect(error.timestamp).toBeDefined();
    });
  });
});
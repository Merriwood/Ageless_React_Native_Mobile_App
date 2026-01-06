/**
 * Test Setup & Utilities
 *
 * Shared test configuration and helper functions
 */

import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

// Mock Expo SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock Sentry
jest.mock('../lib/sentry', () => ({
  initSentry: jest.fn(),
  setSentryUser: jest.fn(),
  captureSentryError: jest.fn(),
}));

// Setup global test utilities
global.__DEV__ = true;

/**
 * Wait for promise to settle
 */
export const waitFor = (callback: () => void, options?: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        callback();
        resolve(true);
      } catch {
        resolve(false);
      }
    }, 50);
  });
};

/**
 * Mock API response
 */
export const mockApiResponse = (status: number = 200, data: any = {}) => {
  return {
    status,
    data,
    config: {},
    headers: {},
    statusText: 'OK',
  };
};

/**
 * Mock API error
 */
export const mockApiError = (status: number = 500, message: string = 'Error') => {
  const error = new Error(message);
  (error as any).response = {
    status,
    data: { error: { message } },
    config: {},
    headers: {},
    statusText: 'Error',
  };
  (error as any).config = {};
  return error;
};

/**
 * Mock AsyncStorage methods
 */
export const mockAsyncStorage = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
  clear: () => Promise.resolve(),
};

/**
 * Mock NetInfo state
 */
export const mockNetInfo = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
};

/**
 * Sleep for milliseconds
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

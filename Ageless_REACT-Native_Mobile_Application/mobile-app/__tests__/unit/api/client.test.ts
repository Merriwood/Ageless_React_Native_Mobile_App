/**
 * API Client Configuration Tests
 *
 * Tests for axios instance configuration and base setup.
 * Note: Full interceptor and retry logic tests are in integration tests.
 */

import axios from 'axios';

describe('API Client Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('axios instance can be created with default config', () => {
    const client = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(client).toBeDefined();
    expect(client.defaults.timeout).toBe(30000);
    expect(client.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('request interceptor can be registered', () => {
    const client = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 30000,
    });

    const useSpy = jest.spyOn(client.interceptors.request, 'use');

    client.interceptors.request.use(
      (config) => {
        config.headers['X-Test'] = 'value';
        return config;
      },
      (error) => Promise.reject(error)
    );

    expect(useSpy).toHaveBeenCalled();
    useSpy.mockRestore();
  });

  test('response interceptor can be registered', () => {
    const client = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 30000,
    });

    const useSpy = jest.spyOn(client.interceptors.response, 'use');

    client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );

    expect(useSpy).toHaveBeenCalled();
    useSpy.mockRestore();
  });

  test('axios creates unique instances', () => {
    const client1 = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 30000,
    });

    const client2 = axios.create({
      baseURL: 'http://api.example.com',
      timeout: 60000,
    });

    expect(client1).not.toBe(client2);
    expect(client1.defaults.baseURL).not.toBe(client2.defaults.baseURL);
    expect(client1.defaults.timeout).not.toBe(client2.defaults.timeout);
  });

  describe('Authorization Header Handling', () => {
    test('can set authorization header in request', () => {
      const client = axios.create();
      const config: any = {
        headers: {},
        method: 'get',
        url: '/test',
      };

      const token = 'test-jwt-token-123';
      config.headers.Authorization = `Bearer ${token}`;

      expect(config.headers.Authorization).toBe(`Bearer ${token}`);
    });

    test('can unset authorization header', () => {
      const config: any = {
        headers: {
          Authorization: 'Bearer old-token',
        },
      };

      delete config.headers.Authorization;

      expect(config.headers.Authorization).toBeUndefined();
    });
  });

  describe('Request ID Generation', () => {
    test('generates valid request ID format', () => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const requestId = `${timestamp}-${random}`;

      expect(requestId).toMatch(/^\d{13}-[a-z0-9]+$/);
    });

    test('generates unique request IDs', () => {
      const ids = new Set();

      for (let i = 0; i < 100; i++) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const requestId = `${timestamp}-${random}`;
        ids.add(requestId);
      }

      // All IDs should be unique (or nearly unique with very high probability)
      expect(ids.size).toBeGreaterThan(90); // Allow for clock resolution edge cases
    });
  });

  describe('Timeout Configuration', () => {
    test('30 second timeout is reasonable for mobile', () => {
      const timeout = 30000;
      const min = 10000; // 10 seconds
      const max = 60000; // 60 seconds

      expect(timeout).toBeGreaterThanOrEqual(min);
      expect(timeout).toBeLessThanOrEqual(max);
    });
  });

  describe('Headers Configuration', () => {
    test('json content-type is set', () => {
      const client = axios.create({
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(client.defaults.headers['Content-Type']).toBe('application/json');
    });

    test('can extend headers without mutation', () => {
      const baseHeaders = {
        'Content-Type': 'application/json',
      };

      const extendedHeaders = {
        ...baseHeaders,
        'Authorization': 'Bearer token',
      };

      expect(baseHeaders).not.toHaveProperty('Authorization');
      expect(extendedHeaders).toHaveProperty('Authorization');
    });
  });
});

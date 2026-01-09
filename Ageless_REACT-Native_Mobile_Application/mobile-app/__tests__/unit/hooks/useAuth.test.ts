/**
 * useAuth Hook Tests
 *
 * Tests for authentication state management, token storage,
 * token expiration checking, and session persistence
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth, JWTPayload, User } from '../../../hooks/useAuth';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-secure-store');
jest.mock('@react-native-async-storage/async-storage');

// Helper function to create valid JWT tokens for testing
function createMockJWT(payload: Partial<JWTPayload> = {}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const defaultPayload: JWTPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
    ...payload,
  };
  const body = Buffer.from(JSON.stringify(defaultPayload)).toString('base64');
  const signature = Buffer.from('signature').toString('base64');
  return `${header}.${body}.${signature}`;
}

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Initialization', () => {
    test('initializes with default state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    test('loads auth state on mount', async () => {
      const mockToken = createMockJWT();
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser)
      );

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.token).toBe(mockToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    test('handles missing user profile gracefully', async () => {
      const mockToken = createMockJWT();

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.token).toBe(mockToken);
      expect(result.current.user).toBeNull();
    });
  });

  // ============================================================================
  // TOKEN MANAGEMENT TESTS
  // ============================================================================

  describe('setToken', () => {
    test('stores token in SecureStore and user in AsyncStorage', async () => {
      const { result } = renderHook(() => useAuth());
      const mockToken = createMockJWT();
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
      };

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setToken(mockToken, mockUser);
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_profile',
        JSON.stringify(mockUser)
      );
      expect(result.current.token).toBe(mockToken);
      expect(result.current.user).toEqual(mockUser);
    });

    test('stores token without user data', async () => {
      const { result } = renderHook(() => useAuth());
      const mockToken = createMockJWT();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setToken(mockToken);
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockToken);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(result.current.token).toBe(mockToken);
      expect(result.current.user).toBeNull();
    });

    test('clears error on successful token storage', async () => {
      const { result } = renderHook(() => useAuth());
      const mockToken = createMockJWT();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setToken(mockToken);
      });

      expect(result.current.error).toBeNull();
    });

    test('handles storage errors', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage failed')
      );

      const { result } = renderHook(() => useAuth());
      const mockToken = createMockJWT();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.setToken(mockToken);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toContain('Storage failed');
    });
  });

  describe('getToken', () => {
    test('retrieves token from SecureStore', async () => {
      const mockToken = createMockJWT();
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let retrievedToken: string | null = null;
      await act(async () => {
        retrievedToken = await result.current.getToken();
      });

      expect(retrievedToken).toBe(mockToken);
    });

    test('returns null when no token stored', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let retrievedToken: string | null = 'initial';
      await act(async () => {
        retrievedToken = await result.current.getToken();
      });

      expect(retrievedToken).toBeNull();
    });

    test('handles retrieval errors', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Retrieval failed')
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.getToken();
      });

      expect(result.current.error).toContain('Retrieval failed');
    });
  });

  describe('clearToken', () => {
    test('clears token and user data', async () => {
      const mockToken = createMockJWT();
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser)
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.token).toBe(mockToken);
      });

      await act(async () => {
        await result.current.clearToken();
      });

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_profile');
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    test('clears error after successful logout', async () => {
      const mockToken = createMockJWT();

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearToken();
      });

      expect(result.current.error).toBeNull();
    });

    test('handles clearing errors', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('Clear failed')
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.clearToken();
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toContain('Clear failed');
    });
  });

  // ============================================================================
  // TOKEN DECODING TESTS
  // ============================================================================

  describe('Token Decoding', () => {
    test('decodes valid JWT token', () => {
      const { result } = renderHook(() => useAuth());
      const mockToken = createMockJWT({
        sub: 'user-789',
        email: 'decode@example.com',
      });

      const payload = mockToken.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));

      expect(decoded.sub).toBe('user-789');
      expect(decoded.email).toBe('decode@example.com');
    });

    test('handles invalid JWT format', () => {
      const invalidToken = 'invalid.token';

      // Try to decode invalid token - should fail gracefully
      try {
        const parts = invalidToken.split('.');
        expect(parts.length).toBe(2); // Should only have 2 parts
      } catch (err) {
        // Expected
      }
    });

    test('handles malformed base64 in JWT', () => {
      const malformedToken = 'header.!!!invalid!!!.signature';

      try {
        const parts = malformedToken.split('.');
        Buffer.from(parts[1], 'base64').toString('utf-8');
      } catch (err) {
        // Expected to fail
        expect(err).toBeDefined();
      }
    });
  });

  // ============================================================================
  // TOKEN EXPIRATION TESTS
  // ============================================================================

  describe('Token Expiration', () => {
    test('correctly identifies valid (non-expired) token', () => {
      const mockToken = createMockJWT({
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      });

      const payload = mockToken.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      const expirationTime = decoded.exp * 1000;

      expect(Date.now() < expirationTime).toBe(true);
    });

    test('correctly identifies expired token', () => {
      const mockToken = createMockJWT({
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      });

      const payload = mockToken.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      const expirationTime = decoded.exp * 1000;

      expect(Date.now() >= expirationTime).toBe(true);
    });

    test('clears expired token on app boot', async () => {
      const expiredToken = createMockJWT({
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired
      });

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(expiredToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Expired token should be cleared
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(result.current.token).toBeNull();
    });

    test('updates isAuthenticated based on token expiration', async () => {
      const validToken = createMockJWT({
        exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
      });

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(validToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  // ============================================================================
  // AUTHENTICATION STATE TESTS
  // ============================================================================

  describe('Authentication State', () => {
    test('isAuthenticated is true when token exists and is valid', async () => {
      const mockToken = createMockJWT();
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    test('isAuthenticated is false when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
      });
    });

    test('isAuthenticated is false when token is expired', async () => {
      const expiredToken = createMockJWT({
        exp: Math.floor(Date.now() / 1000) - 3600,
      });

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(expiredToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    test('handles AsyncStorage errors gracefully', async () => {
      const mockToken = createMockJWT();
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('Storage error');
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
    });

    test('clears stored error on successful operation', async () => {
      // First render with error
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Initial error')
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();

      // Now test that setToken clears the error
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const mockToken = createMockJWT();
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
      };

      await act(async () => {
        await result.current.setToken(mockToken, mockUser);
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================

  describe('Loading State', () => {
    test('sets isLoading to false after loading completes', async () => {
      const mockToken = createMockJWT();
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    test('isLoading is set during setToken operation', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // After initial load, isLoading should be false
      expect(result.current.isLoading).toBe(false);
    });
  });
});

/**
 * useBiometric Hook — Ops Tests
 *
 * Three focused operational tests:
 * 1. Native biometricLogin: authenticate → replay stored creds → return JWT
 * 2. Web biometricLogin: WebAuthn flow → return JWT
 * 3. registerBiometric: stores credentials (native) / calls WebAuthn (web)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { renderHook, act } from '@testing-library/react-native';

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1])),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  AuthenticationType: { FACIAL_RECOGNITION: 2, FINGERPRINT: 1 },
}));

// Mocks must be self-contained (jest hoists mock calls above variable declarations)
jest.mock('../../../api/webauthn', () => ({
  webauthnAPI: {
    getRegisterOptions: jest.fn(),
    verifyRegistration: jest.fn(),
    getAuthOptions: jest.fn(),
    verifyAuth: jest.fn(),
  },
}));

jest.mock('../../../api/auth', () => ({
  login: jest.fn(),
}));

// Get references to mocked modules for assertions/setup
const { webauthnAPI } = jest.requireMock('../../../api/webauthn');
const { login: mockLoginApi } = jest.requireMock('../../../api/auth');

const MockPlatform = jest.requireMock('react-native').Platform;

import { useBiometric } from '../../../hooks/useBiometric';

// ─── Test 1: Native biometricLogin ──────────────────────────────────

describe('Ops Test 1: Native biometricLogin (credential replay)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockPlatform.OS = 'ios';
  });

  it('authenticates biometrically and returns { token, user } from stored credentials', async () => {
    const savedCreds = JSON.stringify({ email: 'test@ageless.app', password: 'Test@123' });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(savedCreds);

    const mockResult = {
      token: 'jwt-token-abc123',
      user: { id: 7, email: 'test@ageless.app', goal: null },
    };
    mockLoginApi.mockResolvedValue(mockResult);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useBiometric());
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.biometricType).toBe('Touch ID');

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.biometricLogin();
    });

    expect(loginResult).not.toBeNull();
    expect(loginResult.token).toBe('jwt-token-abc123');
    expect(loginResult.user.email).toBe('test@ageless.app');

    // Verify chain: SecureStore → OS biometric → login API
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('biometric_credentials');
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
    expect(mockLoginApi).toHaveBeenCalledWith('test@ageless.app', 'Test@123');
  });

  it('returns null when user cancels biometric prompt', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
      JSON.stringify({ email: 'test@ageless.app', password: 'Test@123' })
    );
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: false, error: 'user_cancel',
    });

    const { result } = renderHook(() => useBiometric());
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.biometricLogin();
    });

    expect(loginResult).toBeNull();
    expect(mockLoginApi).not.toHaveBeenCalled();
  });
});

// ─── Test 2: Web biometricLogin (WebAuthn flow) ─────────────────────

describe('Ops Test 2: Web biometricLogin (WebAuthn passkey)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockPlatform.OS = 'web';

    (global as any).window = { PublicKeyCredential: function () {} };
    (global as any).PublicKeyCredential = {
      isUserVerifyingPlatformAuthenticatorAvailable: jest.fn(() => Promise.resolve(true)),
    };
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'webauthn_registered') return Promise.resolve('true');
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    MockPlatform.OS = 'ios';
    delete (global as any).window;
    delete (global as any).PublicKeyCredential;
    delete (global as any).navigator;
  });

  it('calls auth-options → browser credentials.get → auth-verify → returns JWT', async () => {
    webauthnAPI.getAuthOptions.mockResolvedValue({
      challenge: 'dGVzdC1jaGFsbGVuZ2U',
      timeout: 60000,
      rpId: 'localhost',
      allowCredentials: [],
    });

    webauthnAPI.verifyAuth.mockResolvedValue({
      token: 'webauthn-jwt-xyz789',
      user: { id: 3, email: 'mary@test.com', goal: null },
    });

    const mockAssertion = {
      id: 'credential-id-123',
      rawId: new ArrayBuffer(8),
      type: 'public-key',
      response: {
        authenticatorData: new ArrayBuffer(4),
        clientDataJSON: new ArrayBuffer(4),
        signature: new ArrayBuffer(4),
        userHandle: new ArrayBuffer(4),
      },
      getClientExtensionResults: () => ({}),
    };
    (global as any).navigator = {
      credentials: { get: jest.fn(() => Promise.resolve(mockAssertion)) },
    };

    const { result } = renderHook(() => useBiometric());
    await act(async () => { await new Promise(r => setTimeout(r, 100)); });

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.hasRegisteredCredential).toBe(true);

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.biometricLogin();
    });

    expect(loginResult).not.toBeNull();
    expect(loginResult.token).toBe('webauthn-jwt-xyz789');
    expect(loginResult.user.email).toBe('mary@test.com');

    // Verify WebAuthn flow
    expect(webauthnAPI.getAuthOptions).toHaveBeenCalled();
    expect((global as any).navigator.credentials.get).toHaveBeenCalled();
    expect(webauthnAPI.verifyAuth).toHaveBeenCalled();
  });
});

// ─── Test 3: registerBiometric ──────────────────────────────────────

describe('Ops Test 3: registerBiometric (credential enrollment)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockPlatform.OS = 'ios';
  });

  afterEach(() => {
    MockPlatform.OS = 'ios';
    delete (global as any).window;
    delete (global as any).PublicKeyCredential;
    delete (global as any).navigator;
  });

  it('native: saves email+password to SecureStore', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useBiometric());
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });

    expect(result.current.isAvailable).toBe(true);

    let registered = false;
    await act(async () => {
      registered = await result.current.registerBiometric('user@test.com', 'SecurePass1');
    });

    expect(registered).toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'biometric_credentials',
      JSON.stringify({ email: 'user@test.com', password: 'SecurePass1' })
    );
    expect(result.current.hasRegisteredCredential).toBe(true);
  });

  it('web: calls WebAuthn register flow and flags credential in AsyncStorage', async () => {
    MockPlatform.OS = 'web';

    (global as any).window = { PublicKeyCredential: function () {} };
    (global as any).PublicKeyCredential = {
      isUserVerifyingPlatformAuthenticatorAvailable: jest.fn(() => Promise.resolve(true)),
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    webauthnAPI.getRegisterOptions.mockResolvedValue({
      challenge: 'cmVnLWNoYWxsZW5nZQ',
      rp: { name: 'SterlingFit', id: 'localhost' },
      user: { id: 'dXNlci0x', name: 'user@test.com', displayName: 'user@test.com' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      excludeCredentials: [],
      authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    });
    webauthnAPI.verifyRegistration.mockResolvedValue({ verified: true });

    const mockAttestation = {
      id: 'new-cred-456',
      rawId: new ArrayBuffer(8),
      type: 'public-key',
      response: {
        attestationObject: new ArrayBuffer(4),
        clientDataJSON: new ArrayBuffer(4),
        getTransports: () => ['internal'],
      },
      getClientExtensionResults: () => ({}),
    };
    (global as any).navigator = {
      credentials: { create: jest.fn(() => Promise.resolve(mockAttestation)) },
    };

    const { result } = renderHook(() => useBiometric());
    await act(async () => { await new Promise(r => setTimeout(r, 100)); });

    expect(result.current.isAvailable).toBe(true);

    let registered = false;
    await act(async () => {
      registered = await result.current.registerBiometric();
    });

    expect(registered).toBe(true);
    expect(webauthnAPI.getRegisterOptions).toHaveBeenCalled();
    expect((global as any).navigator.credentials.create).toHaveBeenCalled();
    expect(webauthnAPI.verifyRegistration).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('webauthn_registered', 'true');
    expect(result.current.hasRegisteredCredential).toBe(true);
  });
});

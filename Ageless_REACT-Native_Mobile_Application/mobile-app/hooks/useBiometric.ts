import { useState, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { webauthnAPI } from "../api/webauthn";

/**
 * useBiometric Hook
 *
 * Platform-aware biometric authentication:
 * - **Web/PWA**: WebAuthn passkeys (Face ID / Touch ID via browser)
 * - **Native**: expo-local-authentication (Face ID / Touch ID via OS)
 *
 * Key method: `biometricLogin()` — handles the full flow on both platforms
 * and returns { token, user } ready for session storage.
 */

// ── Base64URL helpers for WebAuthn browser API ──────────────────────

function base64urlToBuffer(b64url: string): ArrayBuffer {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const WEBAUTHN_REGISTERED_KEY = "webauthn_registered";

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRegisteredCredential, setHasRegisteredCredential] = useState(false);

  // ── Availability check ────────────────────────────────────────────

  const checkBiometricAvailable = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === "web") {
        const available =
          typeof window !== "undefined" &&
          !!window.PublicKeyCredential &&
          typeof window.PublicKeyCredential === "function";

        if (!available) {
          console.log("[useBiometric] WebAuthn not supported in this browser");
          setIsAvailable(false);
          return false;
        }

        // Check for platform authenticator (Face ID / Touch ID / Windows Hello)
        const platform =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log("[useBiometric] Platform authenticator available:", platform);
        setIsAvailable(platform);

        if (platform) {
          setBiometricType("Biometric");
          const registered = await AsyncStorage.getItem(WEBAUTHN_REGISTERED_KEY);
          setHasRegisteredCredential(!!registered);
        }
        return platform;
      }

      // ── Native path ────────────────────────────────────────────────
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setIsAvailable(false);
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setIsAvailable(false);
        setError("Please set up Face ID or Touch ID in your device settings");
        return false;
      }

      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("Face ID");
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("Touch ID");
      }

      // Check for saved credentials on native
      try {
        const creds = await SecureStore.getItemAsync("biometric_credentials");
        setHasRegisteredCredential(!!creds);
      } catch {
        setHasRegisteredCredential(false);
      }

      setIsAvailable(true);
      setError(null);
      return true;
    } catch (err) {
      console.error("[useBiometric] Availability check error:", err);
      setIsAvailable(false);
      return false;
    }
  }, []);

  // ── Native-only: trigger OS biometric prompt ──────────────────────

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web" || !isAvailable) return false;
    setIsLoading(true);
    setError(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access your fitness data",
        fallbackLabel: "Use passcode instead",
        disableDeviceFallback: false,
        requireConfirmation: true,
      });
      if (result.success) return true;
      if (result.error === "user_cancel") setError("Authentication cancelled");
      else if (result.error === "user_fallback") setError("Please use password");
      else setError("Authentication failed");
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Biometric failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable]);

  // ── Full biometric login (both platforms) ─────────────────────────
  //
  // Returns { token, user } on success, null on failure/cancel.
  // Web:    WebAuthn passkey flow → server returns JWT
  // Native: OS biometric → replay stored credentials → server returns JWT

  const biometricLogin = useCallback(
    async (): Promise<{ token: string; user: any } | null> => {
      if (!isAvailable) return null;
      setIsLoading(true);
      setError(null);

      try {
        if (Platform.OS === "web") {
          // ── WebAuthn authentication ──
          // Step 1 — get challenge from server
          const options = await webauthnAPI.getAuthOptions();

          // Step 2 — convert for browser API
          const publicKey: PublicKeyCredentialRequestOptions = {
            ...options,
            challenge: base64urlToBuffer(options.challenge),
            allowCredentials: (options.allowCredentials || []).map(
              (c: any) => ({
                ...c,
                id: base64urlToBuffer(c.id),
              })
            ),
          };

          // Step 3 — browser biometric prompt
          const cred = (await navigator.credentials.get({
            publicKey,
          })) as PublicKeyCredential;
          const resp = cred.response as AuthenticatorAssertionResponse;

          // Step 4 — send signed assertion to server
          const authResp = {
            id: cred.id,
            rawId: bufferToBase64url(cred.rawId),
            type: cred.type,
            response: {
              authenticatorData: bufferToBase64url(resp.authenticatorData),
              clientDataJSON: bufferToBase64url(resp.clientDataJSON),
              signature: bufferToBase64url(resp.signature),
              userHandle: resp.userHandle
                ? bufferToBase64url(resp.userHandle)
                : null,
            },
            clientExtensionResults: cred.getClientExtensionResults(),
          };

          const result = await webauthnAPI.verifyAuth(authResp);
          return result; // { token, user }
        }

        // ── Native: credential replay ──
        const json = await SecureStore.getItemAsync("biometric_credentials");
        if (!json) {
          setError("Sign in with password first to enable.");
          return null;
        }
        const credentials = JSON.parse(json);

        const ok = await authenticate();
        if (!ok) return null;

        // Call login API with stored credentials
        const { login: loginApi } = await import("../api/auth");
        return await loginApi(credentials.email, credentials.password);
      } catch (err: any) {
        const msg = err?.message || "Biometric login failed";
        // Handle user cancellation gracefully
        if (msg.includes("NotAllowedError") || msg.includes("cancelled") || msg.includes("cancel")) {
          setError("Cancelled");
        } else {
          setError(msg);
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAvailable, authenticate]
  );

  // ── Register biometric credential ─────────────────────────────────
  //
  // Web:    registers a WebAuthn passkey (requires auth token set first)
  // Native: stores email+password in SecureStore

  const registerBiometric = useCallback(
    async (email?: string, password?: string): Promise<boolean> => {
      if (!isAvailable) return false;

      try {
        if (Platform.OS === "web") {
          // Skip if already registered
          const existing = await AsyncStorage.getItem(WEBAUTHN_REGISTERED_KEY);
          if (existing) return true;

          // Step 1 — get registration options
          const options = await webauthnAPI.getRegisterOptions();

          // Step 2 — convert for browser API
          const publicKey: PublicKeyCredentialCreationOptions = {
            ...options,
            challenge: base64urlToBuffer(options.challenge),
            user: {
              ...options.user,
              id: base64urlToBuffer(options.user.id),
            },
            excludeCredentials: (options.excludeCredentials || []).map(
              (c: any) => ({
                ...c,
                id: base64urlToBuffer(c.id),
              })
            ),
          };

          // Step 3 — browser creates credential (biometric prompt)
          const cred = (await navigator.credentials.create({
            publicKey,
          })) as PublicKeyCredential;
          const resp = cred.response as AuthenticatorAttestationResponse;

          // Step 4 — send to server for storage
          const regResp = {
            id: cred.id,
            rawId: bufferToBase64url(cred.rawId),
            type: cred.type,
            response: {
              attestationObject: bufferToBase64url(resp.attestationObject),
              clientDataJSON: bufferToBase64url(resp.clientDataJSON),
              transports:
                typeof resp.getTransports === "function"
                  ? resp.getTransports()
                  : [],
            },
            clientExtensionResults: cred.getClientExtensionResults(),
          };

          await webauthnAPI.verifyRegistration(regResp);
          await AsyncStorage.setItem(WEBAUTHN_REGISTERED_KEY, "true");
          setHasRegisteredCredential(true);
          console.log("[useBiometric] WebAuthn credential registered");
          return true;
        }

        // ── Native ──
        if (!email || !password) return false;
        await SecureStore.setItemAsync(
          "biometric_credentials",
          JSON.stringify({ email, password })
        );
        setHasRegisteredCredential(true);
        return true;
      } catch (err) {
        console.log("[useBiometric] Registration skipped/failed:", err);
        return false;
      }
    },
    [isAvailable]
  );

  // ── Clear credentials (logout) ────────────────────────────────────

  const clearBiometricCredentials = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(WEBAUTHN_REGISTERED_KEY);
      } else {
        await SecureStore.deleteItemAsync("biometric_credentials");
      }
      setHasRegisteredCredential(false);
      setError(null);
    } catch (err) {
      console.error("[useBiometric] Clear failed:", err);
    }
  }, []);

  // ── Legacy compat wrappers ────────────────────────────────────────

  const saveCredentials = useCallback(
    async (email: string, password: string) => {
      return registerBiometric(email, password);
    },
    [registerBiometric]
  );

  const getBiometricCredentials = useCallback(async () => {
    if (Platform.OS === "web") {
      const reg = await AsyncStorage.getItem(WEBAUTHN_REGISTERED_KEY);
      return reg ? { email: "", password: "" } : null;
    }
    try {
      const json = await SecureStore.getItemAsync("biometric_credentials");
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }, []);

  // ── Init ──────────────────────────────────────────────────────────

  useEffect(() => {
    checkBiometricAvailable();
  }, [checkBiometricAvailable]);

  return {
    // State
    isAvailable,
    biometricType,
    isLoading,
    error,
    hasRegisteredCredential,

    // Primary methods
    biometricLogin,
    registerBiometric,
    clearBiometricCredentials,
    checkBiometricAvailable,

    // Legacy compat (used by existing components)
    authenticate,
    saveCredentials,
    getBiometricCredentials,

    // Legacy compat (unused but kept for API surface)
    retryCount: 0,
    attemptsRemaining: 3,
  };
};

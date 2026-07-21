import { apiClient } from "./client";

/**
 * WebAuthn API — passkey registration & authentication for PWA biometric login.
 *
 * Registration endpoints require a valid JWT (called after password login).
 * Authentication endpoints are public (that's the whole point — no password needed).
 */

export interface WebAuthnAuthResult {
  token: string;
  user: { id: number | string; email: string; goal?: any };
}

export const webauthnAPI = {
  /** Get registration options (requires auth). */
  getRegisterOptions: () =>
    apiClient.post<any>("/api/webauthn/register-options"),

  /** Verify registration and store credential (requires auth). */
  verifyRegistration: (response: any) =>
    apiClient.post<{ verified: boolean }>("/api/webauthn/register-verify", { response }),

  /** Get authentication options (public — no auth needed). */
  getAuthOptions: () =>
    apiClient.post<any>("/api/webauthn/auth-options"),

  /** Verify authentication and get JWT (public). */
  verifyAuth: (response: any) =>
    apiClient.post<WebAuthnAuthResult>("/api/webauthn/auth-verify", { response }),
};

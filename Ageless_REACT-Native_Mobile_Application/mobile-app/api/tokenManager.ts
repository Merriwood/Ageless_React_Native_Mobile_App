/**
 * Token Manager
 * Simple singleton to manage auth token outside of React context
 * This allows the ApiClient (class-based) to access the current token
 */

type TokenChangeCallback = (token: string | null) => void;

class TokenManager {
  private currentToken: string | null = null;
  private listeners: Set<TokenChangeCallback> = new Set();

  /**
   * Set the current authentication token
   * Called by useAuth hook when token changes
   */
  setToken(token: string | null): void {
    this.currentToken = token;
    this.notifyListeners();
  }

  /**
   * Get the current authentication token
   * Used by ApiClient to add Authorization header
   */
  getToken(): string | null {
    return this.currentToken;
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.currentToken !== null;
  }

  /**
   * Clear the current token (logout)
   */
  clearToken(): void {
    this.currentToken = null;
    this.notifyListeners();
  }

  /**
   * Subscribe to token changes
   * Returns unsubscribe function
   */
  subscribe(callback: TokenChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of token change
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentToken);
      } catch (error) {
        // Silently handle listener errors
      }
    });
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();

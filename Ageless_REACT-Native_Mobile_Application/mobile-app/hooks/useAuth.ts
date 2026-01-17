/**
 * useAuth Hook
 *
 * Re-exports from AuthContext for backwards compatibility.
 * All auth state is now managed centrally in context/AuthContext.tsx
 */

export { useAuth, AuthProvider, type User } from "../context/AuthContext";

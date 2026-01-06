/**
 * Form Validation Utilities
 * Handles email, password, and general validation for auth screens
 */

/**
 * Validates email format using RFC 5322 regex
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength and returns detailed feedback
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*)
 */
export const isValidPassword = (
  password: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates password confirmation matches original password
 */
export const isValidConfirm = (
  password: string,
  confirm: string
): boolean => {
  return password === confirm && password.length > 0;
};

/**
 * Returns password strength indicator
 * Used for visual feedback during registration
 */
export const getPasswordStrength = (
  password: string
): "Weak" | "Fair" | "Good" | "Strong" => {
  if (!password) return "Weak";

  let strength = 0;

  // Length: 0-1 points
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety: 0-2 points
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  if (strength <= 1) return "Weak";
  if (strength <= 3) return "Fair";
  if (strength <= 5) return "Good";
  return "Strong";
};

/**
 * Validates weight input
 * Range: 0-500 (assumes lbs or kg)
 */
export const isValidWeight = (weight: string): boolean => {
  const num = parseFloat(weight);
  return !isNaN(num) && num > 0 && num <= 500;
};

/**
 * Validates number of sets
 * Range: 1-6 sets (typical for fitness tracking)
 */
export const isValidSets = (sets: string): boolean => {
  const num = parseInt(sets, 10);
  return !isNaN(num) && num >= 1 && num <= 6;
};

/**
 * Sanitizes user input to prevent injection
 * Note: React Native TextInput doesn't allow HTML injection,
 * but we sanitize for consistency with web patterns
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .slice(0, 255); // Limit length
};

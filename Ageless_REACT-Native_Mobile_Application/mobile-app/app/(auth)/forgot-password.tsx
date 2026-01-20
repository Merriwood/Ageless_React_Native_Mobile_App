import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { isValidEmail } from "../../lib/validation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { apiClient } from "../../api/client";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError("");
    setSuccess(false);

    // Validate inputs
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>("/api/auth/forgot-password", {
        email: email.toLowerCase(),
        newPassword,
        confirmPassword,
      });

      console.log("[ForgotPassword] Response:", response);

      if (response.success) {
        setSuccess(true);
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2000);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to reset password";
      console.error("[ForgotPassword] Error:", err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and create a new password
          </Text>
        </View>

        {/* Success Message */}
        {success && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.successText}>
              Password reset successful! Redirecting to login...
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && !success && (
          <Text style={styles.errorMessage}>{error}</Text>
        )}

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            testID="forgot-email-input"
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={theme.colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading && !success}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              testID="forgot-new-password-input"
              style={styles.passwordInput}
              placeholder="Enter new password"
              placeholderTextColor={theme.colors.text.secondary}
              secureTextEntry={!showNewPassword}
              editable={!isLoading && !success}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Pressable
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showNewPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.text.secondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              testID="forgot-confirm-password-input"
              style={styles.passwordInput}
              placeholder="Confirm new password"
              placeholderTextColor={theme.colors.text.secondary}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading && !success}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.text.secondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          testID="forgot-reset-button"
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading || success}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login Link */}
        <View style={styles.backToLogin}>
          <Text style={styles.backText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.backLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    marginLeft: 12,
    color: "#10B981",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  errorMessage: {
    backgroundColor: "#FEE",
    borderWidth: 1,
    borderColor: "#F99",
    color: "#C33",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backToLogin: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  backText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
});

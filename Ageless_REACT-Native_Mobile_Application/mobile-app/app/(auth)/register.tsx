import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { isValidEmail, isValidPassword, isValidConfirm, getPasswordStrength } from "../../lib/validation";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [goal, setGoal] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordValidation = isValidPassword(password);
  const passwordStrength = getPasswordStrength(password);

  const handleRegister = async () => {
    // Clear previous errors
    setError("");

    // Validate inputs
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0] || "Password does not meet requirements");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    if (!isValidConfirm(password, confirmPassword)) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Connect to actual API endpoint
      // const response = await api.auth.register(email, password, goal);
      // const { token, user } = response;
      // Store token and redirect to dashboard

      // Simulated successful registration (temporary until API connected)
      setTimeout(() => {
        Alert.alert("Success", "Account created successfully!");
        // router.replace("/(drawer)/(tabs)/dashboard");
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.lg,
        }}
      >
        <View
          style={{
            alignItems: "center",
            marginBottom: theme.spacing.xl,
          }}
        >
          <Text
            style={{
              ...theme.typography.h1,
              color: theme.colors.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Create Account
          </Text>
          <Text
            style={{
              ...theme.typography.body,
              color: theme.colors.textSecondary,
            }}
          >
            Join Ageless Fitness
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text
            style={{
              ...theme.typography.body,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              fontWeight: "600",
            }}
          >
            Email
          </Text>
          <TextInput
            testID="register-email-input"
            style={{
              borderWidth: 1,
              borderColor: error ? theme.colors.error : theme.colors.border,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.md,
              ...theme.typography.body,
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
            }}
            placeholder="your.email@example.com"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <Text
              style={{
                ...theme.typography.body,
                color: theme.colors.text,
                fontWeight: "600",
              }}
            >
              Password
            </Text>
            {password && (
              <Text
                style={{
                  ...theme.typography.body,
                  fontSize: 12,
                  color:
                    passwordStrength === "Strong"
                      ? theme.colors.success
                      : passwordStrength === "Good"
                      ? theme.colors.warning
                      : theme.colors.error,
                  fontWeight: "600",
                }}
              >
                {passwordStrength}
              </Text>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: error ? theme.colors.error : theme.colors.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: theme.spacing.md,
            }}
          >
            <TextInput
              testID="register-password-input"
              style={{
                flex: 1,
                paddingVertical: theme.spacing.md,
                ...theme.typography.body,
                color: theme.colors.text,
              }}
              placeholder="Enter a strong password"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: theme.spacing.sm }}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text
            style={{
              ...theme.typography.body,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              fontWeight: "600",
            }}
          >
            Confirm Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: error ? theme.colors.error : theme.colors.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: theme.spacing.md,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                paddingVertical: theme.spacing.md,
                ...theme.typography.body,
                color: theme.colors.text,
              }}
              placeholder="Confirm your password"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showConfirm}
              editable={!isLoading}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable
              onPress={() => setShowConfirm(!showConfirm)}
              style={{ padding: theme.spacing.sm }}
            >
              <Ionicons
                name={showConfirm ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Fitness Goal Input */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text
            style={{
              ...theme.typography.body,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              fontWeight: "600",
            }}
          >
            Fitness Goal (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.md,
              ...theme.typography.body,
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
            }}
            placeholder="e.g., Build strength, Lose weight"
            placeholderTextColor={theme.colors.textSecondary}
            editable={!isLoading}
            value={goal}
            onChangeText={setGoal}
          />
        </View>

        {/* Fitness Goal Selection */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text
            style={{
              ...theme.typography.body,
              color: theme.colors.text,
              marginBottom: theme.spacing.md,
              fontWeight: "600",
            }}
          >
            Fitness Goal (Optional)
          </Text>
          <View style={{ gap: theme.spacing.md }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: theme.spacing.sm,
              }}
              onPress={() => setGoal(goal === "mind" ? "" : "mind")}
            >
              <Ionicons
                name={goal === "mind" ? "checkbox" : "checkbox-outline"}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={{ marginLeft: theme.spacing.md, color: theme.colors.text }}>
                Mind
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: theme.spacing.sm,
              }}
              onPress={() => setGoal(goal === "body" ? "" : "body")}
            >
              <Ionicons
                name={goal === "body" ? "checkbox" : "checkbox-outline"}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={{ marginLeft: theme.spacing.md, color: theme.colors.text }}>
                Body
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: theme.spacing.sm,
              }}
              onPress={() => setGoal(goal === "heart" ? "" : "heart")}
            >
              <Ionicons
                name={goal === "heart" ? "checkbox" : "checkbox-outline"}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={{ marginLeft: theme.spacing.md, color: theme.colors.text }}>
                Heart
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: theme.spacing.sm,
              }}
              onPress={() => setGoal(goal === "nutrition" ? "" : "nutrition")}
            >
              <Ionicons
                name={goal === "nutrition" ? "checkbox" : "checkbox-outline"}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={{ marginLeft: theme.spacing.md, color: theme.colors.text }}>
                Nutrition
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: theme.spacing.sm,
              }}
              onPress={() => setGoal(goal === "other" ? "" : "other")}
            >
              <Ionicons
                name={goal === "other" ? "checkbox" : "checkbox-outline"}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={{ marginLeft: theme.spacing.md, color: theme.colors.text }}>
                Other
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View
            style={{
              backgroundColor: `${theme.colors.error}20`,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.error,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.lg,
              borderRadius: theme.radius.sm,
            }}
          >
            <Text
              style={{
                color: theme.colors.error,
                ...theme.typography.body,
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Register Button */}
        <TouchableOpacity
          testID="register-button"
          onPress={handleRegister}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? theme.colors.border : theme.colors.primary,
            paddingVertical: theme.spacing.base,
            borderRadius: theme.radius.button,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
            marginBottom: theme.spacing.md,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.surface} size="small" />
          ) : (
            <Text
              style={{
                color: theme.colors.surface,
                ...theme.typography.button,
                fontWeight: "600",
              }}
            >
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Back to Login Link */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: theme.colors.textSecondary,
              ...theme.typography.body,
            }}
          >
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text
              style={{
                color: theme.colors.primary,
                ...theme.typography.body,
                fontWeight: "600",
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

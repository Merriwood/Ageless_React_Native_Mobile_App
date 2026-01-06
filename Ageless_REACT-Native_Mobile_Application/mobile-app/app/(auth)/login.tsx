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
import { isValidEmail } from "../../lib/validation";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
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
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Connect to actual API endpoint
      // For now, simulate API call
      // const response = await api.auth.login(email, password);
      // const { token, user } = response;
      // Store token in SecureStore and redirect to dashboard

      // Simulated successful login
      setTimeout(() => {
        Alert.alert("Success", "Login successful!");
        // router.replace("/(drawer)/(tabs)/dashboard");
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
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
            Ageless Fitness
          </Text>
          <Text
            style={{
              ...theme.typography.body,
              color: theme.colors.textSecondary,
            }}
          >
            Track your fitness journey
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
            style={{
              borderWidth: 1,
              borderColor: error ? theme.colors.error : theme.colors.border,
              borderRadius: theme.borderRadius.md,
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
          <Text
            style={{
              ...theme.typography.body,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              fontWeight: "600",
            }}
          >
            Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: error ? theme.colors.error : theme.colors.border,
              borderRadius: theme.borderRadius.md,
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
              placeholder="Enter your password"
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

        {/* Error Message */}
        {error && (
          <View
            style={{
              backgroundColor: `${theme.colors.error}20`,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.error,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.lg,
              borderRadius: theme.borderRadius.sm,
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

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? theme.colors.border : theme.colors.primary,
            paddingVertical: 12, // Use pixel value for consistent button height
            borderRadius: theme.borderRadius.md,
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
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity style={{ marginBottom: theme.spacing.lg }}>
          <Text
            style={{
              color: theme.colors.primary,
              ...theme.typography.body,
              textAlign: "center",
            }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
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
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text
              style={{
                color: theme.colors.primary,
                ...theme.typography.body,
                fontWeight: "600",
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

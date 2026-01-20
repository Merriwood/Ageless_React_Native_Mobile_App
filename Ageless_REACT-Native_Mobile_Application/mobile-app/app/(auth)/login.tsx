import React, { useState, useEffect } from "react";
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
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { isValidEmail } from "../../lib/validation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { login as loginApi } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import { useBiometric } from "../../hooks/useBiometric";
import { BiometricIcon } from "../../components/auth/BiometricIcon";

export default function LoginScreen() {
  const router = useRouter();
  const { setToken } = useAuth();
  const {
    isAvailable: isBiometricAvailable,
    biometricType,
    isLoading: isBiometricLoading,
    authenticate,
    getBiometricCredentials,
    saveCredentials,
  } = useBiometric();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [signInCollapsed, setSignInCollapsed] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  // Check if user has saved biometric credentials
  useEffect(() => {
    const checkSavedCredentials = async () => {
      if (isBiometricAvailable) {
        const credentials = await getBiometricCredentials();
        setHasSavedCredentials(!!credentials);
      }
    };
    checkSavedCredentials();
  }, [isBiometricAvailable, getBiometricCredentials]);

  // Handle biometric login
  const handleBiometricLogin = async () => {
    if (!isBiometricAvailable) {
      Alert.alert(
        "Biometric Not Available",
        "Please sign in with your email and password."
      );
      return;
    }

    const credentials = await getBiometricCredentials();
    if (!credentials) {
      Alert.alert(
        "Setup Required",
        "Please sign in with your email and password first. You can then enable biometric login for future sessions."
      );
      setSignInCollapsed(false); // Expand the sign-in form
      return;
    }

    // Authenticate with biometrics
    const success = await authenticate();
    if (!success) {
      return; // Error is handled by useBiometric hook
    }

    // Use saved credentials to log in
    setIsLoading(true);
    setError("");

    try {
      const response = await loginApi(credentials.email, credentials.password);

      if (!response || !response.token) {
        throw new Error("Invalid response from server");
      }

      const { token, user } = response;
      const normalizedUser = user ? { ...user, id: String(user.id) } : undefined;
      await setToken(token, normalizedUser);
      router.replace("/dashboard");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMsg);
      // If biometric login fails, prompt for password
      Alert.alert(
        "Login Failed",
        "Your saved credentials may be outdated. Please sign in with your password.",
        [{ text: "OK", onPress: () => setSignInCollapsed(false) }]
      );
    } finally {
      setIsLoading(false);
    }
  };

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
    setError(""); // Clear any previous errors

    try {
      // Call actual API endpoint
      const response = await loginApi(email, password);

      if (!response || !response.token) {
        throw new Error("Invalid response from server");
      }

      const { token, user } = response;

      // Store token in SecureStore and user in AsyncStorage
      // Ensure user.id is a string
      const normalizedUser = user ? {
        ...user,
        id: String(user.id)
      } : undefined;

      await setToken(token, normalizedUser);

      // Save credentials for biometric login (if available)
      if (isBiometricAvailable) {
        await saveCredentials(email, password);
      }

      // Redirect to dashboard
      router.replace("/dashboard");
    } catch (err) {
      console.error('[LoginScreen] Error:', err);
      const errorMsg = err instanceof Error ? err.message : "Login failed. Please try again.";
      console.error('[LoginScreen] Displaying error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
    logo: {
      width: 60,
      height: 60,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    logoText: {
      fontSize: 32,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    biometricContainer: {
      alignItems: "center",
      marginVertical: 16,
    },
    biometricLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 8,
    },
    biometricTypeLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
      marginTop: 4,
    },
    welcomeText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 20,
    },
    collapsibleSection: {
      backgroundColor: "#FFF",
      borderRadius: 12,
      marginBottom: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "#F9F9F9",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text.primary,
    },
    formContent: {
      paddingHorizontal: 16,
      paddingVertical: 20,
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
    checkboxGroup: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    checkboxLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginLeft: 8,
    },
    buttonGroup: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
    },
    btn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    btnPrimary: {
      backgroundColor: theme.colors.primary,
    },
    btnSecondary: {
      backgroundColor: "#555",
    },
    btnText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
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
    forgotLinks: {
      alignItems: "center",
      marginTop: 24,
      paddingHorizontal: 16,
    },
    forgotLink: {
      color: theme.colors.primary,
      fontSize: 14,
      marginBottom: 8,
    },
    divider: {
      color: theme.colors.text.secondary,
      marginVertical: 10,
    },
    bottomButtonGroup: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 20,
      justifyContent: "center",
    },
    bottomBtn: {
      flex: 1,
      maxWidth: 100,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: 8,
      backgroundColor: "#FFF",
      justifyContent: "center",
      alignItems: "center",
    },
    bottomBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.text.primary,
      textAlign: "center",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>❤️</Text>
          </View>
          <Text style={styles.title}>Ageless.</Text>

          {/* Biometric Login Icon */}
          <View style={styles.biometricContainer}>
            <BiometricIcon
              testID="biometric-login-button"
              biometricType={biometricType as 'Face ID' | 'Touch ID' | null}
              isScanning={isBiometricLoading || isLoading}
              size={90}
              onPress={handleBiometricLogin}
              disabled={!isBiometricAvailable || isLoading}
            />
            {isBiometricAvailable ? (
              <>
                <Text style={styles.biometricLabel}>
                  {hasSavedCredentials ? "Tap to sign in with" : "Sign in to enable"}
                </Text>
                <Text style={styles.biometricTypeLabel}>
                  {biometricType || "Biometrics"}
                </Text>
              </>
            ) : (
              <Text style={styles.biometricLabel}>
                Biometric login unavailable
              </Text>
            )}
          </View>

          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.subtitle}>Track your daily workout progress</Text>
        </View>

        {/* Error Message */}
        {error && <Text style={styles.errorMessage}>{error}</Text>}

        {/* Sign In Form (Collapsible) */}
        <View style={styles.collapsibleSection}>
          <Pressable
            onPress={() => setSignInCollapsed(!signInCollapsed)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Sign in</Text>
            <Text style={{ fontSize: 18 }}>{signInCollapsed ? "▼" : "▲"}</Text>
          </Pressable>

          {!signInCollapsed && (
            <View style={styles.formContent}>
              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  testID="email-input"
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    testID="password-input"
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.text.secondary}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={theme.colors.text.secondary}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Save User ID */}
              <View style={styles.checkboxGroup}>
                <Ionicons
                  name="checkbox-outline"
                  size={18}
                  color={theme.colors.text.secondary}
                />
                <Text style={styles.checkboxLabel}>Save user ID</Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  testID="signin-button"
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.btnText}>Sign in</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => router.push("/(auth)/register")}
                  disabled={isLoading}
                >
                  <Text style={styles.btnText}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Forgot Links */}
        <View style={styles.forgotLinks}>
          <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>
          <Text style={styles.divider}>or</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.forgotLink}>Create new account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtonGroup}>
        <Pressable
          style={styles.bottomBtn}
          onPress={() => Alert.alert("Call us")}
        >
          <Text style={styles.bottomBtnText}>📞 Call us</Text>
        </Pressable>
        <Pressable
          style={styles.bottomBtn}
          onPress={() => Alert.alert("Find us")}
        >
          <Text style={styles.bottomBtnText}>📍 Find us</Text>
        </Pressable>
        <Pressable
          style={styles.bottomBtn}
          onPress={() => Alert.alert("More")}
        >
          <Text style={styles.bottomBtnText}>⋯ More</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

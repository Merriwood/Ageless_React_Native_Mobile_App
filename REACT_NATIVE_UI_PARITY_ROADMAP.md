# React Native Mobile App - UI Parity Implementation Roadmap

**Prepared**: January 5, 2026
**Status**: 38% Duplication → Target: 90%+ Parity
**Reference**: Old_Ageless_Web_PWA (fitness-app-next Next.js implementation)

---

## Executive Summary

Your React Native mobile app has the **correct data model and offline sync** but is visually and functionally **only 38% complete** compared to the Web PWA. The roadmap below prioritizes closing these gaps systematically, organized in 3 phases targeting 90%+ UI/UX parity while respecting native platform conventions.

### Gap Analysis
| Category | Status | Gap |
|----------|--------|-----|
| Design System | ❌ 0% | Missing all design tokens |
| Authentication | ❌ 0% | No login/register screens |
| Navigation | ❌ 0% | No menu/drawer system |
| Components | ⚠️ 30% | Primitives only, no complex components |
| Visual Design | ⚠️ 50% | Colors/spacing inconsistent |
| Animations | ❌ 0% | No micro-interactions |
| Information Architecture | ⚠️ 20% | Single dashboard, no category branching |

### Success Metrics (Target: 90%+ parity)
- ✅ Design tokens implemented and used throughout
- ✅ Authentication flow complete (login/register/logout)
- ✅ Navigation menu with 5+ screens
- ✅ All critical components styled to match web
- ✅ Progress visualization (bars, badges, indicators)
- ✅ Offline sync + online state handling
- ✅ Micro-interactions and transitions

---

## Phase 1: Foundation (Weeks 1-2)

### Goal: Establish design system, authentication, and navigation structure

---

### Task 1.1: Create Design Token System

**Objective**: Centralize all design values from Web PWA

**Reference Files**:
- Web: Old_Ageless_Web_PWA/fitness-app-next/tailwind.config.ts
- Web: Old_Ageless_Web_PWA/fitness-app-next/app/globals.css

**Implementation**:

Create `mobile-app/theme/tokens.ts`:
```typescript
// Color palette (from web design system)
export const colors = {
  primary: '#C5282F',        // Benjamin Moore Red
  primaryHover: '#b12228',   // Darker variant for press states
  primaryLight: '#f5d5d6',   // Light variant for backgrounds

  background: '#F7F7F9',     // Main background
  surface: '#FFFFFF',        // Card/modal background
  surfaceAlt: '#F2F2F7',     // Alternative surface

  text: {
    primary: '#111111',      // Main text
    secondary: '#666666',    // Muted text
    onPrimary: '#FFFFFF',    // Text on primary
  },

  border: {
    light: '#E2E3E6',
    strong: '#D0D1D4',
  },

  status: {
    success: '#10B981',      // Completed exercises
    warning: '#F59E0B',      // In progress
    error: '#EF4444',        // Missed
    info: '#3B82F6',         // Information
  },

  overlay: 'rgba(0,0,0,0.5)', // Modal overlay
};

// Spacing scale (4px base)
export const spacing = {
  xs: 4,
  sm: 6,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

// Border radius
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  '2xl': 24,
  full: 999,
};

// Shadows (React Native compatible)
export const shadows = {
  sm: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  lg: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
};

// Typography (font sizes)
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 26, fontWeight: '600' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
};

// Transitions (duration in ms)
export const transitions = {
  fast: 120,     // Quick interactions
  standard: 160, // Normal transitions
  slow: 280,     // Modals, drawers
};

// Responsive breakpoints (if needed for web view)
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};
```

Create `mobile-app/theme/index.ts`:
```typescript
import { colors, spacing, radius, shadows, typography, transitions } from './tokens';

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
  typography,
  transitions,
};

export type Theme = typeof theme;
export * from './tokens';
```

**Deliverables**:
- ✅ `theme/tokens.ts` with all design values
- ✅ `theme/index.ts` as centralized export
- ✅ TypeScript types for autocomplete
- ✅ Documented color values with web source references

**Acceptance Criteria**:
- All web design tokens ported to React Native
- No hardcoded color/spacing values remain
- Theme file exports used in 100% of new components

---

### Task 1.2: Implement Design System Components

**Objective**: Create reusable, styled components matching web design

**Reference**: Old_Ageless_Web_PWA/fitness-app-next/components/ui/

**Implementation**:

Update `mobile-app/components/ui/Button.tsx`:
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';

export interface ButtonProps {
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  testID?: string;
}

export function Button({
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  testID,
}: ButtonProps) {
  const styles = getStyles(variant, size, disabled);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={styles.button}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={styles.text.color} />
      ) : (
        <Text style={styles.text}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

function getStyles(variant: string, size: string, disabled: boolean) {
  const baseButton = {
    borderRadius: theme.radius.lg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...theme.shadows.md,
  };

  const sizeStyles = {
    small: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
    medium: { paddingVertical: theme.spacing.base, paddingHorizontal: theme.spacing.lg, height: 44 },
    large: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl, height: 48 },
  };

  const variantStyles = {
    primary: {
      button: { backgroundColor: theme.colors.primary, ...baseButton },
      text: { color: theme.colors.text.onPrimary, ...theme.typography.button },
    },
    secondary: {
      button: { backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border.light, ...baseButton },
      text: { color: theme.colors.text.primary, ...theme.typography.button },
    },
    ghost: {
      button: { backgroundColor: 'transparent', ...baseButton },
      text: { color: theme.colors.primary, ...theme.typography.button },
    },
    danger: {
      button: { backgroundColor: theme.colors.status.error, ...baseButton },
      text: { color: theme.colors.text.onPrimary, ...theme.typography.button },
    },
  };

  const selected = variantStyles[variant as keyof typeof variantStyles] || variantStyles.primary;
  return {
    button: {
      ...selected.button,
      ...sizeStyles[size as keyof typeof sizeStyles],
      opacity: disabled ? 0.5 : 1,
    },
    text: selected.text,
  };
}
```

Update `mobile-app/components/ui/Card.tsx`:
```typescript
import React from 'react';
import { View, ViewProps } from 'react-native';
import { theme } from '../../theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'completed' | 'elevated';
}

export function Card({ children, variant = 'default', style, ...props }: CardProps) {
  const styles = getStyles(variant);

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

function getStyles(variant: string) {
  const baseCard = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  };

  const variantStyles = {
    default: { ...baseCard, ...theme.shadows.sm, borderColor: theme.colors.border.light, borderWidth: 1 },
    completed: { ...baseCard, backgroundColor: theme.colors.primaryLight, ...theme.shadows.sm },
    elevated: { ...baseCard, ...theme.shadows.lg },
  };

  return {
    card: variantStyles[variant as keyof typeof variantStyles] || variantStyles.default,
  };
}
```

Update `mobile-app/components/ui/Input.tsx`:
```typescript
import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { theme } from '../../theme';

export interface StyledInputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'search';
}

export function Input({
  label,
  error,
  variant = 'default',
  style,
  ...props
}: StyledInputProps) {
  const styles = getStyles(variant, !!error);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={theme.colors.text.secondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function getStyles(variant: string, hasError: boolean) {
  return {
    container: { marginVertical: theme.spacing.base },
    label: { ...theme.typography.label, color: theme.colors.text.primary, marginBottom: theme.spacing.sm },
    input: {
      borderWidth: 1,
      borderColor: hasError ? theme.colors.status.error : theme.colors.border.light,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surface,
    },
    errorText: { color: theme.colors.status.error, ...theme.typography.bodySmall, marginTop: theme.spacing.xs },
  };
}
```

Add `mobile-app/components/ui/Badge.tsx` (NEW):
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const colorMap = {
    success: { bg: theme.colors.status.success, text: '#fff' },
    warning: { bg: theme.colors.status.warning, text: '#fff' },
    error: { bg: theme.colors.status.error, text: '#fff' },
    info: { bg: theme.colors.status.info, text: '#fff' },
  };

  const colors = colorMap[variant];

  return (
    <View style={{ backgroundColor: colors.bg, borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm }}>
      <Text style={{ color: colors.text, ...theme.typography.label }}>{children}</Text>
    </View>
  );
}
```

Add `mobile-app/components/ui/ProgressBar.tsx` (NEW):
```typescript
import React from 'react';
import { View } from 'react-native';
import { theme } from '../../theme';

export interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
}

export function ProgressBar({ progress, height = 8 }: ProgressBarProps) {
  return (
    <View style={{ height, backgroundColor: theme.colors.border.light, borderRadius: theme.radius.full, overflow: 'hidden' }}>
      <View
        style={{
          height: '100%',
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.full,
        }}
      />
    </View>
  );
}
```

**Deliverables**:
- ✅ Updated Button component with variants
- ✅ Updated Card component with variants
- ✅ Updated Input component with validation
- ✅ New Badge component for status display
- ✅ New ProgressBar component for progress visualization

**Acceptance Criteria**:
- All components use theme tokens (no hardcoded values)
- Components accept style props for flexibility
- Components match web design visually
- Components have TypeScript types exported

---

### Task 1.3: Implement Authentication Screens

**Objective**: Add login and registration flows matching web PWA UX

**Reference**: Old_Ageless_Web_PWA/fitness-app-next/app/(auth)/

**Implementation**:

Create `mobile-app/app/(auth)/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';
import { theme } from '../../theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
```

Create `mobile-app/app/(auth)/login.tsx` (NEW):
```typescript
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { theme } from '../../theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    setLoading(true);
    setErrors({});

    try {
      // TODO: Call authentication API endpoint
      // For now, mock successful login
      if (!email || !password) {
        setErrors({
          email: email ? undefined : 'Email is required',
          password: password ? undefined : 'Password is required',
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to dashboard
      router.replace('/(app)/dashboard');
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginTop: theme.spacing.xl }}>
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: 72, height: 72, marginBottom: theme.spacing.lg }}
              />
              <Text style={{ ...theme.typography.h1, color: theme.colors.primary }}>Ageless.</Text>
            </View>

            {/* Login Form */}
            <View style={{ width: '100%' }}>
              <Text style={{ ...theme.typography.h3, marginBottom: theme.spacing.xl }}>Welcome Back</Text>

              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <View style={{ marginVertical: theme.spacing.base }}>
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                />
              </View>

              <Link href="/(auth)/forgot-password" asChild>
                <Text style={{ color: theme.colors.primary, ...theme.typography.bodySmall, textDecorationLine: 'underline' }}>
                  Forgot password?
                </Text>
              </Link>

              <Button
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                size="large"
                style={{ marginTop: theme.spacing.xl }}
              >
                Sign In
              </Button>
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
              <Text style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.base }}>
                Don't have an account?
              </Text>
              <Link href="/(auth)/register" asChild>
                <Text style={{ color: theme.colors.primary, ...theme.typography.button }}>
                  Create Account
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
```

Create `mobile-app/app/(auth)/register.tsx` (NEW):
```typescript
// Similar structure to login, with additional fields:
// - Name
// - Confirm Password
// - Terms acceptance checkbox
// - Different button label "Create Account"
// - Different navigation on success (auto-login or back to login)
```

**Deliverables**:
- ✅ Auth layout with stack navigation
- ✅ Login screen with email/password/forgot password
- ✅ Register screen with account creation
- ✅ Forgot password flow stub
- ✅ Integration hooks for authentication API

**Acceptance Criteria**:
- ✅ Screens render correctly on iOS and Android
- ✅ Form validation working
- ✅ Navigation flows completed
- ✅ Styling matches web PWA colors/spacing

---

### Task 1.4: Implement Navigation Structure

**Objective**: Add navigation menu/drawer matching web PWA structure (5-tab bottom nav)

**Reference**: Old_Ageless_Web_PWA/fitness-app-next/app/dashboard/ + components/layout/PWANav.tsx

**Implementation**:

Create `mobile-app/app/(app)/_layout.tsx`:
```typescript
import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, BarChart3, Zap, Music, Award } from 'lucide-react-native';
import { theme } from '../../theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          borderTopColor: theme.colors.border.light,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border.light, borderBottomWidth: 1 },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { ...theme.typography.h3 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="myabs"
        options={{
          title: 'My ABS',
          tabBarLabel: 'My ABS',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="listen"
        options={{
          title: 'Listen',
          tabBarLabel: 'Listen',
          tabBarIcon: ({ color, size }) => <Music size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarLabel: 'Rewards',
          tabBarIcon: ({ color, size }) => <Award size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

Reorganize screens:
- Move existing dashboard to `mobile-app/app/(app)/dashboard/index.tsx`
- Create `mobile-app/app/(app)/myabs/index.tsx` (Weight tracking view)
- Create `mobile-app/app/(app)/scan/index.tsx` (Placeholder for QR scan)
- Create `mobile-app/app/(app)/listen/index.tsx` (Placeholder for audio)
- Create `mobile-app/app/(app)/rewards/index.tsx` (Rewards/achievements view)

**Deliverables**:
- ✅ 5-tab bottom navigation matching web
- ✅ Tab icons using lucide-react-native
- ✅ Screen reorganization
- ✅ Navigation state persistence

**Acceptance Criteria**:
- ✅ All 5 tabs render and navigate correctly
- ✅ Active tab styling visible
- ✅ Tab bar matches web PWA design
- ✅ Icons match web PWA intent

---

## Phase 2: Visual Polish (Weeks 3-4)

### Goal: Implement progress visualization, animations, and interactive components

---

### Task 2.1: Add Progress Visualization

**Objective**: Implement progress bars, status badges, and summary views

**Implementation**:

Update `mobile-app/app/(app)/dashboard/index.tsx`:
- Add progress bars for each exercise showing sets completed
- Add status badges (✓ Completed, ○ Pending, ✗ Missed)
- Add weekly summary cards at top
- Add exercise completion metrics

Create `mobile-app/components/dashboard/SummaryCard.tsx` (NEW):
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { theme } from '../../theme';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  progress?: number;
  status?: 'success' | 'warning' | 'error';
}

export function SummaryCard({ title, value, progress, status = 'info' }: SummaryCardProps) {
  return (
    <Card variant="elevated">
      <View style={{ marginBottom: theme.spacing.base }}>
        <Text style={{ ...theme.typography.label, color: theme.colors.text.secondary }}>{title}</Text>
        <Text style={{ ...theme.typography.h2, color: theme.colors.text.primary }}>{value}</Text>
      </View>
      {progress !== undefined && <ProgressBar progress={progress} />}
    </Card>
  );
}
```

**Deliverables**:
- ✅ Progress visualization in dashboard
- ✅ Status badges on exercises
- ✅ Weekly summary cards
- ✅ Progress percentage calculations

---

### Task 2.2: Implement Animations & Micro-interactions

**Objective**: Add smooth transitions and feedback animations

**Implementation**:

Create `mobile-app/hooks/useAnimation.ts`:
```typescript
import { useRef } from 'react';
import { Animated } from 'react-native';

export function useAnimation(initialValue = 0, duration = theme.transitions.standard) {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animate = (toValue: number) => {
    Animated.timing(animatedValue, {
      toValue,
      duration,
      useNativeDriver: false,
    }).start();
  };

  return { animatedValue, animate };
}
```

Add animations to:
- Button press (slight scale down 0.95)
- Card appearance (fade in + slide up)
- Modal overlay (fade in)
- Badge appearance (scale from 0.8 to 1)

Create `mobile-app/components/ui/FadeInView.tsx` (NEW):
```typescript
import React, { useEffect } from 'react';
import { Animated } from 'react-native';

export function FadeInView({ children, delay = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.transitions.standard,
        useNativeDriver: true,
      }).start();
    }, delay);
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
}
```

**Deliverables**:
- ✅ Smooth button press feedback
- ✅ Card entrance animations
- ✅ Modal transitions
- ✅ Loading state animations
- ✅ Transition timing aligned with web PWA (120ms/160ms)

---

### Task 2.3: Build Modal Components

**Objective**: Implement History and Summary modals matching web

**Reference**: Old_Ageless_Web_PWA/fitness-app-next/components/modals/

**Implementation**:

Create `mobile-app/components/modals/Modal.tsx`:
```typescript
import React from 'react';
import { Modal, View, Pressable, Animated } from 'react-native';
import { theme } from '../../theme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AppModal({ visible, onClose, title, children }: ModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay }} onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.lg }}>
          <Pressable style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.lg }}>
            <Text style={{ ...theme.typography.h2, marginBottom: theme.spacing.lg }}>{title}</Text>
            {children}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
```

Create `mobile-app/components/modals/HistoryModal.tsx`:
```typescript
// Displays editable workout history
// - Date selector
// - Exercise history table
// - Edit/delete controls
// - Scrollable list of past workouts
```

Create `mobile-app/components/modals/SummaryModal.tsx`:
```typescript
// Displays weekly summary statistics
// - Week date range
// - Total sets per exercise
// - Progress vs previous week
// - Download/share options
```

**Deliverables**:
- ✅ Base Modal component with overlay
- ✅ History modal with edit capabilities
- ✅ Summary modal with statistics
- ✅ Modal animation and styling

---

## Phase 3: Feature Parity (Weeks 5+)

### Goal: Complete feature implementation and category-based navigation

---

### Task 3.1: Multi-Category Support

**Objective**: Implement Food, Fitness, Beauty, Mind category navigation

**Reference**: Old_Ageless_Web_PWA/fitness-app-next/lib/constants/exercises.ts

**Current Status**: Only Fitness/exercise tracking implemented

**Implementation**:

Create `mobile-app/lib/categories.ts`:
```typescript
export const categories = [
  { id: 'fitness', name: 'Fitness', icon: 'Activity', color: '#FF6B6B' },
  { id: 'food', name: 'Food', icon: 'Apple', color: '#4ECDC4' },
  { id: 'beauty', name: 'Beauty', icon: 'Sparkles', color: '#FFB6E1' },
  { id: 'mind', name: 'Mind', icon: 'Brain', color: '#95E1D3' },
];
```

Extend dashboard to support category selection/filtering
- Add category selector at top of dashboard
- Filter exercises by category
- Store selected category in persistent storage

**Deliverables**:
- ✅ Category definitions and structure
- ✅ Category-specific screens
- ✅ Category filtering in dashboard
- ✅ Persistence of category selection

---

### Task 3.2: Advanced Components

**Objective**: Implement remaining complex components from web

**Components to Add**:
1. **Dropdown Menu** - Multi-level menu for navigation
2. **Collapsible Sections** - Expandable/collapsible groups
3. **Form Validation UI** - Error messages, success states
4. **Status Indicators** - Visual feedback for form states
5. **Skeleton Loaders** - Loading placeholders
6. **Toast Notifications** - Success/error messages

**Deliverables**:
- ✅ All advanced components implemented
- ✅ Components match web PWA styling
- ✅ Full type safety with TypeScript

---

### Task 3.3: Offline Sync & Online State

**Objective**: Complete offline functionality and sync handling

**Reference**: mobile-app/hooks/useOfflineQueue.ts (already exists)

**Enhancement**:
- Add visual indicator for online/offline state
- Add sync status display
- Handle network reconnection gracefully
- Queue retry mechanism with exponential backoff
- Conflict resolution UI

**Deliverables**:
- ✅ Online/offline status indicator in header
- ✅ Sync queue visualization
- ✅ Retry UI for failed requests
- ✅ Toast notifications for sync events

---

### Task 3.4: Settings & Profile

**Objective**: Add settings, profile, and logout screens

**Screens**:
- Settings page (notification preferences, app info)
- Profile page (user info, change password)
- Logout confirmation

Create `mobile-app/app/(app)/profile/index.tsx`:
```typescript
// User profile display
// - Avatar/initials
// - User name and email
// - Edit profile button
// - Change password link
// - Logout button
```

Create `mobile-app/app/(app)/settings/index.tsx`:
```typescript
// Settings page
// - Notifications toggle
// - Data export option
// - Privacy policy link
// - Terms of service link
// - App version
```

**Deliverables**:
- ✅ Profile management screens
- ✅ Settings UI
- ✅ Logout functionality
- ✅ User preferences persistence

---

## Implementation Priority Matrix

### Critical Path (Do First - Blocks Other Work)
1. ✅ Design tokens (Task 1.1) - All other work depends on this
2. ✅ Design components (Task 1.2) - Foundation for all screens
3. ✅ Authentication screens (Task 1.3) - User entry point
4. ✅ Navigation structure (Task 1.4) - Information architecture

### High Value (Do Next - Core UX)
5. Progress visualization (Task 2.1)
6. Animations (Task 2.2)
7. Modal components (Task 2.3)

### Nice to Have (Polish)
8. Multi-category support (Task 3.1)
9. Advanced components (Task 3.2)
10. Offline sync enhancements (Task 3.3)
11. Settings/profile (Task 3.4)

---

## File Structure After Implementation

```
mobile-app/
├── theme/
│   ├── tokens.ts           ✅ NEW
│   └── index.ts            ✅ NEW
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx     ✅ NEW
│   │   ├── login.tsx       ✅ NEW
│   │   ├── register.tsx    ✅ NEW
│   │   └── forgot-password.tsx ✅ NEW
│   ├── (app)/
│   │   ├── _layout.tsx     ✅ NEW (tabs)
│   │   ├── dashboard/
│   │   │   └── index.tsx   ✅ UPDATED
│   │   ├── myabs/
│   │   │   └── index.tsx   ✅ NEW
│   │   ├── scan/
│   │   │   └── index.tsx   ✅ NEW
│   │   ├── listen/
│   │   │   └── index.tsx   ✅ NEW
│   │   ├── rewards/
│   │   │   └── index.tsx   ✅ NEW
│   │   ├── profile/
│   │   │   └── index.tsx   ✅ NEW
│   │   └── settings/
│   │       └── index.tsx   ✅ NEW
│   ├── _layout.tsx         (Root layout)
│   └── index.tsx           (Splash/welcome)
├── components/
│   ├── ui/
│   │   ├── Button.tsx      ✅ UPDATED
│   │   ├── Card.tsx        ✅ UPDATED
│   │   ├── Input.tsx       ✅ UPDATED
│   │   ├── Badge.tsx       ✅ NEW
│   │   ├── ProgressBar.tsx ✅ NEW
│   │   ├── Modal.tsx       ✅ NEW
│   │   └── FadeInView.tsx  ✅ NEW
│   ├── dashboard/
│   │   ├── WorkoutCard.tsx (Existing)
│   │   └── SummaryCard.tsx ✅ NEW
│   └── modals/
│       ├── HistoryModal.tsx ✅ NEW
│       └── SummaryModal.tsx ✅ NEW
├── hooks/
│   ├── useOfflineQueue.ts  (Existing)
│   └── useAnimation.ts     ✅ NEW
├── lib/
│   ├── constants/
│   │   └── exercises.ts    (Existing)
│   ├── categories.ts       ✅ NEW
│   └── types.ts            (Existing)
└── tailwind.config.js      (Existing)
```

---

## Testing Checklist

### Design System
- [ ] All colors render correctly on iOS and Android
- [ ] Spacing values consistent across all components
- [ ] Border radius values applied properly
- [ ] Shadows display correctly on both platforms
- [ ] Typography sizes and weights render correctly

### Authentication
- [ ] Login screen loads and renders
- [ ] Register screen loads and renders
- [ ] Form validation displays errors
- [ ] Password visibility toggle works
- [ ] Navigation to dashboard after successful login
- [ ] Navigation to login from unauthenticated state

### Navigation
- [ ] All 5 tabs render and tap correctly
- [ ] Tab icons display properly
- [ ] Active tab styling visible
- [ ] Navigation state persists on app resume
- [ ] Bottom tab bar doesn't obscure content

### Components
- [ ] Button variants render correctly
- [ ] Card variants display properly
- [ ] Input fields accept text and show errors
- [ ] Badges display with correct colors
- [ ] Progress bars animate smoothly
- [ ] Modals open/close with animations

### Visual Design
- [ ] Colors match web PWA design
- [ ] Spacing matches web PWA layout
- [ ] Animations feel smooth and responsive
- [ ] Dark mode (if applicable) works correctly
- [ ] Safe area insets respected on notched devices

### Offline Functionality
- [ ] Offline queue captures user actions
- [ ] Queue syncs when online
- [ ] Sync status visible in UI
- [ ] Failed syncs show retry option

---

## Success Metrics (Target: 90%+ Parity)

| Metric | Current | Target | Owner |
|--------|---------|--------|-------|
| Design System Implementation | 0% | 100% | Dev |
| Component Parity | 30% | 90% | Dev |
| Visual Consistency | 50% | 95% | Dev/Design |
| Navigation Completeness | 20% | 100% | Dev |
| Authentication Flows | 0% | 100% | Dev |
| Micro-interactions | 0% | 80% | Dev |
| Offline Functionality | 70% | 95% | Dev |
| Type Safety | 100% | 100% | Dev |
| **Overall UX Parity** | **38%** | **90%+** | **All** |

---

## Reference Documentation

### Web PWA Source Files
- Colors/Tokens: `Old_Ageless_Web_PWA/fitness-app-next/tailwind.config.ts`
- Component Examples: `Old_Ageless_Web_PWA/fitness-app-next/components/ui/`
- Global Styles: `Old_Ageless_Web_PWA/fitness-app-next/app/globals.css`
- Exercises Data: `Old_Ageless_Web_PWA/fitness-app-next/lib/constants/exercises.ts`
- Type Definitions: `Old_Ageless_Web_PWA/fitness-app-next/types/index.ts`

### Mobile App Source Files
- Current Components: `Ageless_REACT-Native_Mobile_Application/mobile-app/components/`
- Existing Screens: `Ageless_REACT-Native_Mobile_Application/mobile-app/app/`
- Assets: `Ageless_REACT-Native_Mobile_Application/mobile-app/assets/`

### Documentation
- UI Assessment: `Ageless_REACT-Native_Mobile_Application/UI_DUPLICATION_ASSESSMENT.md`
- This Roadmap: `REACT_NATIVE_UI_PARITY_ROADMAP.md`

---

## Next Steps

1. **Review this roadmap** - Confirm phases, priorities, and approach
2. **Set up design tokens** - Establish source of truth for styling
3. **Update base components** - Button, Card, Input with theme integration
4. **Implement auth screens** - Login/register with navigation
5. **Create navigation structure** - 5-tab bottom nav layout
6. **Iterate on visual design** - Compare against web PWA, refine styling
7. **Test on real devices** - iOS and Android physical testing
8. **Deploy and gather feedback** - Get user feedback on completeness

---

## Questions to Clarify

Before starting implementation, please confirm:

1. **Authentication Backend**: What API endpoints should authentication screens call? (Is there an existing backend?)
2. **Multi-category Scope**: Should Phases 2-3 focus on Food/Beauty/Mind, or is Fitness-only sufficient initially?
3. **Offline-first**: Is the app truly offline-first, or primarily online with offline fallback?
4. **Performance Targets**: Any specific performance metrics (app size, startup time, frame rate)?
5. **Accessibility**: Should we implement full a11y support (VoiceOver, TalkBack)?
6. **Localization**: Multi-language support needed?

---

## Timeline Estimate

- **Phase 1 (Foundation)**: 2 weeks (1 dev)
- **Phase 2 (Polish)**: 2 weeks (1 dev)
- **Phase 3 (Complete)**: 2-3 weeks (1 dev, depending on scope)
- **Testing & Refinement**: 1 week (QA + dev)
- **Total**: ~6-8 weeks for 90%+ parity with 1 developer

*Note: Timeline assumes dedicated developer and clear API specifications.*

---

**Document Status**: Draft - Ready for Review & Discussion

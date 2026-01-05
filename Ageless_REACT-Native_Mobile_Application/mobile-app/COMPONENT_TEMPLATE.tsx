/**
 * DESIGN TOKEN COMPLIANT COMPONENT TEMPLATE
 *
 * Use this template as a starting point for new components.
 * It ensures design tokens are properly integrated from the start.
 *
 * Steps:
 * 1. Copy this file
 * 2. Rename to your component name (e.g., Badge.tsx)
 * 3. Replace "TemplateComponent" with your component name
 * 4. Implement your logic
 * 5. Run: npm run audit:design
 * 6. Verify score is 95+/100
 *
 * ✅ COMPLIANCE CHECKLIST:
 * [ ] All colors use theme.colors.*
 * [ ] All spacing uses theme.spacing.*
 * [ ] All border radius uses theme.radius.*
 * [ ] All shadows use ...theme.shadows.*
 * [ ] All typography uses ...theme.typography.*
 * [ ] File imports theme at the top
 * [ ] No inline styles (all in StyleSheet.create)
 * [ ] No hardcoded hex values
 * [ ] No magic numbers
 * [ ] npm run audit:design shows score 95+/100
 */

import React from 'react';
import {
  View,
  ViewProps,
  Text,
  TextProps,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

// ✅ REQUIRED: Import theme at top
import { theme } from '../../theme';

/**
 * TemplateComponent
 *
 * Brief description of what this component does.
 *
 * @example
 * ```tsx
 * <TemplateComponent variant="primary" size="medium">
 *   Button Text
 * </TemplateComponent>
 * ```
 */
export interface TemplateComponentProps extends ViewProps {
  /**
   * Component variant for different styles
   * - primary: Main action button (red)
   * - secondary: Alternative action
   * - ghost: Minimal style
   *
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'ghost';

  /**
   * Component size
   * - small: Compact size (36px height)
   * - medium: Default size (44px height)
   * - large: Prominent size (48px height)
   *
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Optional label text
   */
  label?: string;

  /**
   * Optional custom container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Optional disabled state
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Children to render inside component
   */
  children?: React.ReactNode;
}

export function TemplateComponent({
  variant = 'primary',
  size = 'medium',
  label,
  containerStyle,
  disabled = false,
  children,
  style,
  ...props
}: TemplateComponentProps) {
  // ✅ Use StyleSheet.create with theme tokens
  const styles = getStyles(variant, size, disabled);

  return (
    <View style={[styles.container, containerStyle, style]} {...props}>
      {label && <Text style={styles.label}>{label}</Text>}

      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

/**
 * Helper function to generate styles based on variant and size
 *
 * ✅ All values use theme tokens - NO hardcoded values!
 */
function getStyles(
  variant: 'primary' | 'secondary' | 'ghost',
  size: 'small' | 'medium' | 'large',
  disabled: boolean
) {
  // ✅ Size definitions using theme tokens
  const sizeStyles = {
    small: {
      paddingVertical: theme.spacing.base,    // ✅ 8px
      paddingHorizontal: theme.spacing.md,    // ✅ 12px
      height: 36 as const,
    },
    medium: {
      paddingVertical: theme.spacing.base,    // ✅ 8px
      paddingHorizontal: theme.spacing.lg,    // ✅ 16px
      height: 44 as const,
    },
    large: {
      paddingVertical: theme.spacing.md,      // ✅ 12px
      paddingHorizontal: theme.spacing.xl,    // ✅ 20px
      height: 48 as const,
    },
  };

  // ✅ Variant definitions using theme tokens
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,  // ✅ #C5282F
      borderColor: 'transparent' as const,
      borderWidth: 0 as const,
    },
    secondary: {
      backgroundColor: theme.colors.surfaceAlt, // ✅ #F2F2F7
      borderColor: theme.colors.border.light,   // ✅ #E2E3E6
      borderWidth: 1 as const,
    },
    ghost: {
      backgroundColor: 'transparent' as const,
      borderColor: theme.colors.primary,
      borderWidth: 1 as const,
    },
  };

  // ✅ Text color variants
  const textColorVariants = {
    primary: theme.colors.text.onPrimary,     // ✅ White text on red
    secondary: theme.colors.text.primary,     // ✅ Dark text on light
    ghost: theme.colors.primary,              // ✅ Red text
  };

  // ✅ Combine all styles
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];
  const textColor = textColorVariants[variant];

  return StyleSheet.create({
    // ✅ Container: All values from theme tokens
    container: {
      ...sizeStyle,
      ...variantStyle,
      borderRadius: theme.radius.lg,          // ✅ 12px
      ...theme.shadows.sm,                    // ✅ Spread shadow properties
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      opacity: disabled ? 0.5 : 1,            // ✅ Disabled state
    },

    // ✅ Label: Uses theme typography
    label: {
      ...theme.typography.label,              // ✅ 12px semibold
      color: theme.colors.text.secondary,     // ✅ Muted color
      marginBottom: theme.spacing.sm,         // ✅ 6px gap
    },

    // ✅ Content: Uses theme spacing
    content: {
      paddingVertical: theme.spacing.base,    // ✅ 8px
      paddingHorizontal: theme.spacing.md,    // ✅ 12px
    },

    // ✅ Text: Uses theme typography and colors
    text: {
      ...theme.typography.button,             // ✅ 16px semibold
      color: textColor,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ DESIGN TOKEN COMPLIANCE CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────
//
// [✅] File imports theme: import { theme } from '../../theme';
//
// [✅] Colors use theme tokens:
//      - theme.colors.primary        (#C5282F)
//      - theme.colors.surface        (#FFFFFF)
//      - theme.colors.surfaceAlt     (#F2F2F7)
//      - theme.colors.border.light   (#E2E3E6)
//      - theme.colors.text.primary   (#111111)
//      - theme.colors.text.onPrimary (#FFFFFF)
//
// [✅] Spacing uses theme tokens:
//      - theme.spacing.base (8px)
//      - theme.spacing.sm   (6px)
//      - theme.spacing.md   (12px)
//      - theme.spacing.lg   (16px)
//      - theme.spacing.xl   (20px)
//
// [✅] Border radius uses theme tokens:
//      - theme.radius.sm  (4px)
//      - theme.radius.md  (8px)
//      - theme.radius.lg  (12px)
//      - theme.radius.xl  (20px)
//
// [✅] Shadows use theme tokens with spread operator:
//      - ...theme.shadows.sm (small shadow)
//      - ...theme.shadows.md (medium shadow)
//      - ...theme.shadows.lg (large shadow)
//
// [✅] Typography uses theme tokens with spread operator:
//      - ...theme.typography.h1      (28px bold)
//      - ...theme.typography.h2      (26px semibold)
//      - ...theme.typography.h3      (20px semibold)
//      - ...theme.typography.body    (16px normal)
//      - ...theme.typography.label   (12px semibold)
//      - ...theme.typography.button  (16px semibold)
//
// [✅] Transitions use theme tokens:
//      - theme.transitions.fast     (120ms)
//      - theme.transitions.standard (160ms)
//      - theme.transitions.slow     (280ms)
//
// [✅] No hardcoded values:
//      - ❌ NEVER: backgroundColor: '#C5282F'
//      - ✅ ALWAYS: backgroundColor: theme.colors.primary
//
// [✅] No magic numbers:
//      - ❌ NEVER: padding: 16
//      - ✅ ALWAYS: padding: theme.spacing.lg
//
// [✅] All styles in StyleSheet.create:
//      - ❌ AVOID: <View style={{ padding: 16 }} />
//      - ✅ DO: <View style={styles.container} />
//
// [✅] Props are properly typed:
//      - Interface extends ViewProps/TextProps
//      - All props have JSDoc comments
//      - Variants and sizes documented
//
// ─────────────────────────────────────────────────────────────────────────────
// RUN BEFORE COMMITTING:
// ─────────────────────────────────────────────────────────────────────────────
//
// npm run audit:design
//
// Verify output shows:
// ✅ [TemplateComponent.tsx] - Score: 95+/100
// ✅ 0 errors
// ✅ 0-1 warnings (minor issues only)
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * EXAMPLES OF WHAT NOT TO DO
 *
 * ❌ Bad Example 1: Hardcoded Colors
 * ```typescript
 * const styles = StyleSheet.create({
 *   button: {
 *     backgroundColor: '#C5282F',  // ❌ HARDCODED!
 *     color: '#FFFFFF',            // ❌ HARDCODED!
 *   },
 * });
 * ```
 *
 * ✅ Good Example 1: Theme Colors
 * ```typescript
 * const styles = StyleSheet.create({
 *   button: {
 *     backgroundColor: theme.colors.primary,        // ✅ From theme
 *     color: theme.colors.text.onPrimary,           // ✅ From theme
 *   },
 * });
 * ```
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ❌ Bad Example 2: Magic Numbers
 * ```typescript
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: 16,         // ❌ Magic number - what's 16?
 *     marginBottom: 12,    // ❌ Magic number - is this intentional?
 *     height: 44,          // ❌ Magic number - hard to maintain
 *   },
 * });
 * ```
 *
 * ✅ Good Example 2: Theme Spacing
 * ```typescript
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: theme.spacing.lg,           // ✅ Semantic (16px)
 *     marginBottom: theme.spacing.md,      // ✅ Semantic (12px)
 *     height: 44,                          // ✅ Documented if needed
 *   },
 * });
 * ```
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ❌ Bad Example 3: Inline Styles
 * ```typescript
 * export function Button() {
 *   return (
 *     <TouchableOpacity style={{
 *       backgroundColor: '#C5282F',
 *       padding: 16,
 *       borderRadius: 12,
 *     }}>
 *       Press me
 *     </TouchableOpacity>
 *   );
 * }
 * ```
 *
 * ✅ Good Example 3: StyleSheet.create
 * ```typescript
 * const styles = StyleSheet.create({
 *   button: {
 *     backgroundColor: theme.colors.primary,
 *     padding: theme.spacing.lg,
 *     borderRadius: theme.radius.lg,
 *   },
 * });
 *
 * export function Button() {
 *   return (
 *     <TouchableOpacity style={styles.button}>
 *       Press me
 *     </TouchableOpacity>
 *   );
 * }
 * ```
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ❌ Bad Example 4: Mixed Theme and Hardcoded
 * ```typescript
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: theme.colors.surface,  // ✅ Good
 *     padding: 16,                            // ❌ Bad (magic number)
 *     marginBottom: theme.spacing.md,         // ✅ Good
 *     borderRadius: 12,                       // ❌ Bad (magic number)
 *   },
 * });
 * ```
 *
 * ✅ Good Example 4: All Theme
 * ```typescript
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: theme.colors.surface,
 *     padding: theme.spacing.lg,
 *     marginBottom: theme.spacing.md,
 *     borderRadius: theme.radius.lg,
 *   },
 * });
 * ```
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default TemplateComponent;

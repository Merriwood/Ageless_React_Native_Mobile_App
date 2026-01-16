import { Text, TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg';
  textClassName?: string;
}

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.button,
  },
  defaultButton: {
    backgroundColor: theme.colors.primary,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: 'transparent',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.status.error,
  },
  defaultSize: {
    height: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.base,
  },
  smSize: {
    height: 40,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.button,
  },
  lgSize: {
    height: 48,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.button,
  },
  baseText: {
    ...theme.typography.button, // fontSize: 16, fontWeight: '600', lineHeight: 20
  },
  defaultText: {
    color: theme.colors.text.onPrimary,
  },
  outlineText: {
    color: theme.colors.text.primary,
  },
  ghostText: {
    color: theme.colors.text.primary,
  },
  dangerText: {
    color: theme.colors.status.error,
  },
});

export function Button({ 
  textClassName,
  variant = 'default', 
  size = 'default', 
  children, 
  style,
  ...props 
}: ButtonProps) {
  const variantStyles = {
    default: styles.defaultButton,
    outline: styles.outlineButton,
    ghost: styles.ghostButton,
    danger: styles.dangerButton,
  };

  const sizeStyles = {
    default: styles.defaultSize,
    sm: styles.smSize,
    lg: styles.lgSize,
  };

  const textVariants = {
    default: styles.defaultText,
    outline: styles.outlineText,
    ghost: styles.ghostText,
    danger: styles.dangerText,
  };

  return (
    <TouchableOpacity 
      style={[styles.baseButton, variantStyles[variant], sizeStyles[size], style]} 
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.baseText, textVariants[variant], textClassName]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

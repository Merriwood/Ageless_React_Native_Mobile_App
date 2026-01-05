import { Text, TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  textClassName?: string;
}

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  defaultButton: {
    backgroundColor: '#1f2937',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'transparent',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  defaultSize: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  smSize: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  lgSize: {
    height: 44,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  baseText: {
    fontWeight: '500',
  },
  defaultText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#1f2937',
  },
  ghostText: {
    color: '#1f2937',
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
  };

  return (
    <TouchableOpacity 
      style={[styles.baseButton, variantStyles[variant], sizeStyles[size], style]} 
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.baseText, textVariants[variant], textClassName && { fontSize: 14 }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.bodySmall, // fontSize: 14, fontWeight: '400', lineHeight: 20
    color: theme.colors.text.primary,
  },
});

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={theme.colors.text.secondary}
      {...props}
    />
  );
}

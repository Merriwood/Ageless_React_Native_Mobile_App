import { TextInput, TextInputProps, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
  },
});

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor="#a1aeb8"
      {...props}
    />
  );
}

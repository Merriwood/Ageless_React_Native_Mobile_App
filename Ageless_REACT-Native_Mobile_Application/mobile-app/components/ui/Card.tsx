import { View, Text, ViewProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  cardHeader: {
    padding: theme.spacing.xl,
  },
  cardTitle: {
    ...theme.typography.h1,
  },
  cardDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  cardContent: {
    padding: theme.spacing.xl,
    paddingTop: 0,
  },
});

export function Card({ style, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props} />
  );
}

export function CardHeader({ style, ...props }: ViewProps) {
  return (
    <View style={[styles.cardHeader, style]} {...props} />
  );
}

export function CardTitle({ style, ...props }: any) {
  return (
    <Text style={[styles.cardTitle, style]} {...props} />
  );
}

export function CardDescription({ style, ...props }: any) {
  return (
    <Text style={[styles.cardDescription, style]} {...props} />
  );
}

export function CardContent({ style, ...props }: ViewProps) {
  return (
    <View style={[styles.cardContent, style]} {...props} />
  );
}

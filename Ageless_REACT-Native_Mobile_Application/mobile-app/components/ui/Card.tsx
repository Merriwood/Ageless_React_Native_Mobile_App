import { View, Text, ViewProps, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardContent: {
    padding: 24,
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

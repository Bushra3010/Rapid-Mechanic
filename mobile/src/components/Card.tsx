import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  padded?: boolean;
}

export function Card({ children, onPress, style, selected, padded = true }: Props) {
  const content = [styles.card, padded && styles.padded, selected && styles.selected, style];
  if (!onPress) return <View style={content}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [...content, pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  padded: { padding: spacing.lg },
  selected: { borderColor: colors.accent, borderWidth: 2, backgroundColor: '#FFFBF8' },
});

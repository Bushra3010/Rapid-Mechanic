import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface Props {
  title?: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  showLogo?: boolean;
}

export function Header({ title, subtitle, back, onBack, right, showLogo }: Props) {
  return (
    <View style={styles.bar}>
      {back ? (
        <Pressable
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')))}
          style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
      ) : null}
      {showLogo ? <Image source={require('../../assets/logo.png')} style={styles.logo} /> : null}
      <View style={styles.titles}>
        {title ? (
          <Text style={typography.h3} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={typography.small} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function HeaderIconButton({
  icon,
  onPress,
  badge,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  label: string;
}) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} hitSlop={8} style={styles.iconBtn}>
      <Ionicons name={icon} size={23} color={colors.primary} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  titles: { flex: 1 },
  logo: { width: 34, height: 34, borderRadius: 8 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
});

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { SHOW_DEV_TOOLS } from '@/utils/env';

/**
 * Dev-only control to push a job/order to its next status so tracking can be demoed
 * before the admin / technician / seller panels are connected. Hidden in production builds.
 */
export function DevSimulateButton({ onPress, disabled }: { onPress: () => Promise<void>; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  if (!SHOW_DEV_TOOLS) return null;
  return (
    <Pressable
      disabled={disabled || busy}
      onPress={async () => {
        setBusy(true);
        try {
          await onPress();
        } finally {
          setBusy(false);
        }
      }}
      style={[styles.btn, (disabled || busy) && { opacity: 0.5 }]}>
      {busy ? <ActivityIndicator size="small" color={colors.textMuted} /> : <Ionicons name="flask-outline" size={16} color={colors.textMuted} />}
      <Text style={styles.text}>{disabled ? 'No further updates' : 'Simulate next update (dev)'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textFaint,
  },
  text: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
});

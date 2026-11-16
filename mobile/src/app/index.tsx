// Splash: shows the brand, waits for the persisted store, then routes.
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/store/useStore';
import { colors, spacing } from '@/theme';

export default function Splash() {
  const hydrated = useStore((s) => s.hydrated);
  const session = useStore((s) => s.session);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      if (!session.onboarded) router.replace('/onboarding');
      else if (!session.user_id) router.replace('/login');
      else router.replace('/(tabs)');
    }, 900);
    return () => clearTimeout(t);
  }, [hydrated, session.onboarded, session.user_id]);

  return (
    <View style={styles.root}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.name}>
        Rapid <Text style={{ color: colors.accent }}>Mechanic</Text>
      </Text>
      <Text style={styles.tag}>Vehicle care at your doorstep</Text>
      <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  logo: { width: 180, height: 180 },
  name: { fontSize: 30, fontWeight: '800', color: colors.primary, marginTop: spacing.sm },
  tag: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs },
});

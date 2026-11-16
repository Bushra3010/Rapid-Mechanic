import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components';
import { authService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

const SLIDES: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'construct', title: 'Doorstep service & repair', body: 'Book verified mechanics for your bike, scooter or car — at home, office or anywhere in your city.' },
  { icon: 'warning', title: '24×7 roadside assistance', body: 'Flat tyre, dead battery or out of fuel? Pin your location and help is on the way.' },
  { icon: 'cart', title: 'Genuine parts marketplace', body: 'Shop oils, tyres, batteries and accessories from trusted sellers with doorstep delivery.' },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  const finish = async () => {
    await authService.completeOnboarding();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Pressable onPress={finish} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
      <View style={styles.center}>
        <View style={styles.hero}>
          <Ionicons name={slide.icon} size={84} color={colors.accent} />
        </View>
        <Text style={[typography.h1, styles.text]}>{slide.title}</Text>
        <Text style={[typography.body, styles.text, { color: colors.textMuted }]}>{slide.body}</Text>
      </View>
      <View style={styles.dots}>
        {SLIDES.map((_, k) => (
          <View key={k} style={[styles.dot, k === i && styles.dotActive]} />
        ))}
      </View>
      <Button title={last ? 'Get started' : 'Next'} variant={last ? 'accent' : 'primary'} size="lg" onPress={() => (last ? finish() : setI(i + 1))} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, padding: spacing.xl },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 48, height: 48 },
  skip: { color: colors.textMuted, fontWeight: '600', fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  hero: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 10,
    borderColor: colors.primarySoft,
  },
  text: { textAlign: 'center', paddingHorizontal: spacing.md },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.border },
  dotActive: { width: 24, backgroundColor: colors.accent },
});

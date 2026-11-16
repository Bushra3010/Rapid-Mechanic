import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, TextField } from '@/components';
import { authService } from '@/services';
import { DEMO_LOGIN_PHONE } from '@/services/auth';
import { colors, radius, spacing, typography } from '@/theme';
import { formatPhone } from '@/utils/format';

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    setError('');
    setBusy(true);
    try {
      await authService.sendOtp(phone);
      setStep('otp');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError('');
    setBusy(true);
    try {
      const { isNew, profile } = await authService.verifyOtp(phone, otp);
      if (isNew || !profile.full_name) router.replace({ pathname: '/profile/edit', params: { setup: '1' } });
      else router.replace('/(tabs)');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.name}>
              Rapid <Text style={{ color: colors.accent }}>Mechanic</Text>
            </Text>
          </View>

          {step === 'phone' ? (
            <View style={styles.form}>
              <Text style={typography.h1}>Login or sign up</Text>
              <Text style={typography.small}>We&apos;ll send a one-time password to verify your mobile number.</Text>
              <TextField
                label="Mobile number"
                prefix="+91"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                error={error}
                autoFocus
              />
              <Button title="Send OTP" size="lg" onPress={sendOtp} loading={busy} disabled={phone.length !== 10} />
              <Pressable style={styles.demo} onPress={() => setPhone(DEMO_LOGIN_PHONE)}>
                <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                <Text style={styles.demoText}>Demo: tap to use {formatPhone(DEMO_LOGIN_PHONE)} (has sample bookings)</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={typography.h1}>Enter OTP</Text>
              <Text style={typography.small}>
                Sent to {formatPhone(phone)}.{' '}
                <Text style={styles.link} onPress={() => setStep('phone')}>
                  Change
                </Text>
              </Text>
              <TextField
                label="One-time password"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                style={{ letterSpacing: 8, fontSize: 22, fontWeight: '700' }}
                error={error}
                autoFocus
              />
              <Button title="Verify & continue" size="lg" variant="accent" onPress={verify} loading={busy} disabled={otp.length < 4} />
              <Text style={[typography.small, { textAlign: 'center' }]}>Test mode: any 4–6 digit code works.</Text>
              <Pressable onPress={sendOtp} disabled={busy}>
                <Text style={[styles.link, { textAlign: 'center' }]}>Resend OTP</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.terms}>By continuing you agree to our Terms of Service and Privacy Policy.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, padding: spacing.xl, gap: spacing.xxl },
  brand: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.sm },
  logo: { width: 120, height: 120 },
  name: { fontSize: 26, fontWeight: '800', color: colors.primary },
  form: { gap: spacing.lg },
  link: { color: colors.accent, fontWeight: '700' },
  demo: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  demoText: { color: colors.info, fontSize: 13, flex: 1 },
  terms: { marginTop: 'auto', textAlign: 'center', fontSize: 12, color: colors.textFaint },
});

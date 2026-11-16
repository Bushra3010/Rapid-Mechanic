import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Header, Screen, TextField } from '@/components';
import { profileService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import { formatPhone } from '@/utils/format';

export default function EditProfile() {
  const { setup } = useLocalSearchParams<{ setup?: string }>();
  const isSetup = setup === '1';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileService.getMyProfile().then((p) => {
      if (!p) return;
      setName(p.full_name);
      setEmail(p.email);
      setPhone(p.phone);
    });
  }, []);

  const save = async () => {
    if (name.trim().length < 2) return setError('Enter your full name');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email');
    setSaving(true);
    try {
      await profileService.updateMyProfile({ full_name: name.trim(), email: email.trim() });
      if (isSetup) router.replace('/(tabs)');
      else router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      header={<Header back={!isSetup} title={isSetup ? 'Complete your profile' : 'Edit profile'} />}
      footer={
        <View style={{ gap: spacing.sm }}>
          {error ? <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text> : null}
          <Button title={isSetup ? 'Continue' : 'Save changes'} onPress={save} loading={saving} />
        </View>
      }>
      {isSetup ? <Text style={typography.body}>Tell us a little about yourself so technicians know who to meet.</Text> : null}
      <TextField label="Full name" value={name} onChangeText={setName} placeholder="e.g. Priya Nair" autoCapitalize="words" />
      <TextField label="Email (optional)" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <TextField label="Mobile number" value={formatPhone(phone)} editable={false} style={{ color: colors.textMuted }} />
      <Text style={typography.small}>Mobile number is verified by OTP and can&apos;t be changed here.</Text>
    </Screen>
  );
}

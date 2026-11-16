import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Card, Header, ListRow, Screen } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { amcService, authService, catalogService, profileService, vehicleService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import { SHOW_DEV_TOOLS } from '@/utils/env';
import { formatPhone } from '@/utils/format';

function confirm(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', style: 'destructive', onPress: onYes },
  ]);
}

export default function ProfileTab() {
  const { data: profile } = useQuery(() => profileService.getMyProfile());
  const { data: vehicles } = useQuery(() => vehicleService.listMyVehicles());
  const { data: subs } = useQuery(() => amcService.listMySubscriptions());
  const { data: settings } = useQuery(() => catalogService.getPlatformSettings());
  const activePlans = subs?.filter((s) => s.status === 'active').length ?? 0;

  const initials = (profile?.full_name || 'RM')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const logout = () =>
    confirm('Log out?', 'You will need to verify your number again.', async () => {
      await authService.signOut();
      router.replace('/login');
    });

  return (
    <Screen header={<Header title="Profile" />}>
      <Card style={styles.profile} onPress={() => router.push('/profile/edit')}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={typography.h3}>{profile?.full_name || 'Add your name'}</Text>
          <Text style={typography.small}>{profile ? formatPhone(profile.phone) : ''}</Text>
          {profile?.email ? <Text style={typography.small}>{profile.email}</Text> : null}
        </View>
        <Ionicons name="create-outline" size={20} color={colors.accent} />
      </Card>

      <Card padded={false}>
        <ListRow icon="car-sport-outline" title="My vehicles" subtitle={`${vehicles?.length ?? 0} saved`} onPress={() => router.push('/vehicles')} />
        <ListRow icon="construct-outline" title="My service requests" subtitle="Service, repair & RSA" onPress={() => router.push('/(tabs)/services')} />
        <ListRow icon="bag-handle-outline" title="My orders" subtitle="Product orders & tracking" onPress={() => router.push('/(tabs)/orders')} />
        <ListRow
          icon="shield-checkmark-outline"
          title="My AMC plans"
          subtitle={activePlans ? `${activePlans} active` : 'No active plan'}
          onPress={() => router.push('/profile/amc')}
        />
      </Card>

      <Card padded={false}>
        <ListRow icon="call-outline" title="Help & support" subtitle={settings ? `${settings.support_phone} · ${settings.support_email}` : ''} />
        <ListRow icon="document-text-outline" title="Terms & privacy policy" chevron />
        {SHOW_DEV_TOOLS ? (
          <ListRow
            icon="refresh-outline"
            title="Reset demo data (dev)"
            subtitle="Restore seeded mock data"
            onPress={() => confirm('Reset demo data?', 'All local bookings and orders will be replaced with seed data.', () => authService.resetDemoData())}
          />
        ) : null}
        <ListRow icon="log-out-outline" title="Log out" danger onPress={logout} chevron={false} />
      </Card>
      <Text style={[typography.small, { textAlign: 'center' }]}>Rapid Mechanic · v1.0.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.white, fontSize: 22, fontWeight: '800' },
});

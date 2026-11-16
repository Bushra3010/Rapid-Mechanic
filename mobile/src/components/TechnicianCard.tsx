import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { TechnicianWithProfile } from '@/services/catalog';
import { colors, radius, spacing, typography } from '@/theme';
import { formatPhone } from '@/utils/format';
import { Card } from './Card';

export function TechnicianCard({ technician }: { technician: TechnicianWithProfile }) {
  const initials = technician.full_name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2);
  return (
    <Card>
      <Text style={[typography.caption, { marginBottom: spacing.sm }]}>YOUR TECHNICIAN</Text>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.nameRow}>
            <Text style={typography.bodyStrong}>{technician.full_name}</Text>
            {technician.verified ? <Ionicons name="shield-checkmark" size={15} color={colors.success} /> : null}
          </View>
          <Text style={typography.small}>{technician.business_name}</Text>
          <View style={styles.nameRow}>
            <Ionicons name="star" size={13} color={colors.accentLight} />
            <Text style={typography.small}>
              {technician.rating.toFixed(1)} · {technician.experience_years} yrs experience
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel={`Call ${technician.full_name}`}
          style={styles.call}
          onPress={() => Linking.openURL(`tel:+91${technician.phone}`)}>
          <Ionicons name="call" size={20} color={colors.white} />
        </Pressable>
      </View>
      <Text style={[typography.small, { marginTop: spacing.sm }]}>{formatPhone(technician.phone)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.white, fontWeight: '800', fontSize: 17 },
  call: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
});

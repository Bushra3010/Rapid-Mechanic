// Service & repair listings filtered by vehicle_type.
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip, EmptyState, Header, Loading, PriceText, Screen } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { catalogService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import type { Service, VehicleType } from '@/types';
import { vehicleTypeLabel } from '@/utils/format';

const TABS: { key: Service['category'] | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'service', label: 'Service' },
  { key: 'repair', label: 'Repair' },
];

export default function ServiceListing() {
  const params = useLocalSearchParams<{ type: string }>();
  const type: VehicleType = params.type === 'four_wheeler' ? 'four_wheeler' : 'two_wheeler';
  const [cat, setCat] = useState<Service['category'] | 'all'>('all');
  const { data, loading } = useQuery(() => catalogService.listServices(type, cat === 'all' ? undefined : cat), [type, cat]);

  return (
    <Screen
      header={<Header back title={`${vehicleTypeLabel[type]} service & repair`} subtitle="Doorstep · verified mechanics" />}>
      <View style={styles.switch}>
        <Chip icon="bicycle" label="Two-wheeler" selected={type === 'two_wheeler'} onPress={() => router.setParams({ type: 'two_wheeler' })} />
        <Chip icon="car-sport" label="Four-wheeler" selected={type === 'four_wheeler'} onPress={() => router.setParams({ type: 'four_wheeler' })} />
      </View>
      <View style={styles.switch}>
        {TABS.map((t) => (
          <Chip key={t.key} label={t.label} selected={cat === t.key} onPress={() => setCat(t.key)} />
        ))}
      </View>
      {loading && !data ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState icon="construct-outline" title="No services available" />
      ) : (
        data.map((s) => (
          <Card key={s.id} onPress={() => router.push({ pathname: '/book/details', params: { service_id: s.id } })}>
            <View style={styles.row}>
              <View style={[styles.icon, s.category === 'repair' && { backgroundColor: colors.accentSoft }]}>
                <Ionicons name={s.category === 'repair' ? 'build' : 'construct'} size={20} color={s.category === 'repair' ? colors.accent : colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={typography.bodyStrong}>{s.name}</Text>
                <Text style={typography.small} numberOfLines={2}>
                  {s.description}
                </Text>
                <View style={styles.meta}>
                  <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                  <Text style={typography.small}>
                    ~{s.duration_mins >= 60 ? `${Math.round((s.duration_mins / 60) * 10) / 10} hrs` : `${s.duration_mins} mins`}
                  </Text>
                  <Text style={[styles.tag, s.category === 'repair' && { color: colors.accent }]}>{s.category.toUpperCase()}</Text>
                </View>
              </View>
            </View>
            <View style={styles.foot}>
              <PriceText amount={s.base_price} suffix=" onwards" />
              <Button title="Book" size="sm" variant="accent" fullWidth={false} onPress={() => router.push({ pathname: '/book/details', params: { service_id: s.id } })} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  row: { flexDirection: 'row', gap: spacing.md },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tag: { marginLeft: spacing.sm, fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.6 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
});

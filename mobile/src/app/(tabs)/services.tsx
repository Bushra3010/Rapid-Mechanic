import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip, EmptyState, Header, Loading, Screen, StatusBadge } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { requestService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import { formatDateTime, formatINR, shortId } from '@/utils/format';

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled'] as const;

export default function ServicesTab() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const { data, loading } = useQuery(() => requestService.listMyRequests());

  const list = (data ?? []).filter((r) =>
    filter === 'All'
      ? true
      : filter === 'Active'
        ? r.status !== 'completed' && r.status !== 'cancelled'
        : filter === 'Completed'
          ? r.status === 'completed'
          : r.status === 'cancelled',
  );

  return (
    <Screen header={<Header title="My service requests" subtitle="Service, repair & roadside jobs" />}>
      <View style={styles.actions}>
        <Button title="Bike" icon="bicycle" size="sm" variant="outline" fullWidth={false} style={{ flex: 1 }} onPress={() => router.push('/book/two_wheeler')} />
        <Button title="Car" icon="car-sport" size="sm" variant="outline" fullWidth={false} style={{ flex: 1 }} onPress={() => router.push('/book/four_wheeler')} />
        <Button title="RSA" icon="warning" size="sm" variant="accent" fullWidth={false} style={{ flex: 1 }} onPress={() => router.push('/rsa')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>
      {loading && !data ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState
          icon="construct-outline"
          title="No requests yet"
          message="Book a doorstep service, repair or roadside help and track it here."
          actionLabel="Book a service"
          onAction={() => router.push('/book/two_wheeler')}
        />
      ) : (
        list.map((r) => (
          <Card key={r.id} onPress={() => router.push(`/track/request/${r.id}`)}>
            <View style={styles.row}>
              <View style={[styles.icon, r.kind === 'rsa' && { backgroundColor: colors.dangerSoft }]}>
                <Ionicons
                  name={r.kind === 'rsa' ? 'warning' : r.kind === 'repair' ? 'build' : 'construct'}
                  size={20}
                  color={r.kind === 'rsa' ? colors.danger : colors.primary}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={typography.bodyStrong} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text style={typography.small} numberOfLines={1}>
                  {r.vehicle ? `${r.vehicle.make} ${r.vehicle.model} · ${r.vehicle.reg_number}` : 'Vehicle removed'}
                </Text>
                <Text style={typography.small}>{formatDateTime(r.scheduled_at)}</Text>
              </View>
              <Text style={typography.bodyStrong}>{formatINR(r.amount)}</Text>
            </View>
            <View style={styles.foot}>
              <StatusBadge status={r.status} />
              <Text style={typography.small}>{shortId(r.id)}</Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
});

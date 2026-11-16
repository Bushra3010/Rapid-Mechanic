import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Header, Loading, Screen, StatusBadge } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { amcService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import { formatDate, formatINR } from '@/utils/format';

export default function MyAmcPlans() {
  const { data, loading } = useQuery(() => amcService.listMySubscriptions());
  const [now] = useState(() => Date.now());

  return (
    <Screen
      header={<Header back onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))} title="My AMC plans" />}
      footer={<Button title="Explore plans" variant="outline" icon="shield-checkmark-outline" onPress={() => router.push('/amc')} />}>
      {loading && !data ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState icon="shield-outline" title="No AMC plans yet" message="Save on yearly maintenance with scheduled services and roadside cover." />
      ) : (
        data.map((s) => {
          const daysLeft = Math.max(0, Math.ceil((new Date(s.end_date).getTime() - now) / 86400000));
          return (
            <Card key={s.id} style={{ gap: spacing.sm }}>
              <View style={styles.head}>
                <Ionicons name="shield-checkmark" size={26} color={s.status === 'active' ? colors.success : colors.textFaint} />
                <View style={{ flex: 1 }}>
                  <Text style={typography.h3}>{s.plan?.name}</Text>
                  <Text style={typography.small}>
                    {s.vehicle ? `${s.vehicle.make} ${s.vehicle.model} · ${s.vehicle.reg_number}` : 'Vehicle removed'}
                  </Text>
                </View>
                <StatusBadge status={s.status} />
              </View>
              <Text style={typography.small}>
                {formatDate(s.start_date)} – {formatDate(s.end_date)}
                {s.status === 'active' ? ` · ${daysLeft} days left` : ''}
              </Text>
              <View style={styles.tags}>
                {s.plan?.covered_services.map((c) => (
                  <View key={c} style={styles.tag}>
                    <Text style={styles.tagText}>{c}</Text>
                  </View>
                ))}
              </View>
              <Text style={typography.small}>
                {s.plan?.visits_per_year} visits / year · {s.plan ? formatINR(s.plan.price_per_year) : ''} paid
              </Text>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: colors.primarySoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
});

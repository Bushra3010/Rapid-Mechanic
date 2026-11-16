import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip, Header, Loading, PriceText, Screen } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { amcService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';
import type { VehicleType } from '@/types';

export default function AmcPlans() {
  const [type, setType] = useState<VehicleType>('two_wheeler');
  const { data, loading } = useQuery(() => amcService.listAmcPlans(type), [type]);

  return (
    <Screen header={<Header back title="Yearly AMC plans" subtitle="Annual maintenance, worry-free" />}>
      <View style={styles.hero}>
        <Ionicons name="shield-checkmark" size={30} color={colors.accentLight} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>One plan. Full year of care.</Text>
          <Text style={styles.heroSub}>Scheduled services, priority booking and discounts on parts.</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Chip icon="bicycle" label="Two-wheeler" selected={type === 'two_wheeler'} onPress={() => setType('two_wheeler')} />
        <Chip icon="car-sport" label="Four-wheeler" selected={type === 'four_wheeler'} onPress={() => setType('four_wheeler')} />
      </View>
      {loading && !data ? (
        <Loading />
      ) : (
        data?.map((plan, i) => {
          const popular = i === 1;
          return (
            <Card key={plan.id} selected={popular} onPress={() => router.push(`/amc/${plan.id}`)}>
              {popular ? (
                <View style={styles.popular}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              ) : null}
              <Text style={typography.h3}>{plan.name}</Text>
              <View style={{ marginVertical: spacing.sm }}>
                <PriceText amount={plan.price_per_year} suffix=" / year" size="lg" color={colors.primary} />
              </View>
              <View style={{ gap: 6 }}>
                {plan.covered_services.slice(0, 3).map((c) => (
                  <View key={c} style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={typography.small}>{c}</Text>
                  </View>
                ))}
                {plan.covered_services.length > 3 ? (
                  <Text style={[typography.small, { color: colors.accent, fontWeight: '600' }]}>
                    +{plan.covered_services.length - 3} more benefits
                  </Text>
                ) : null}
              </View>
              <Button
                title="View plan"
                variant={popular ? 'accent' : 'outline'}
                size="sm"
                style={{ marginTop: spacing.md }}
                onPress={() => router.push(`/amc/${plan.id}`)}
              />
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg },
  heroTitle: { color: colors.white, fontWeight: '800', fontSize: 16 },
  heroSub: { color: '#C9D6E3', fontSize: 13, marginTop: 2 },
  row: { flexDirection: 'row', gap: spacing.sm },
  popular: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3, marginBottom: spacing.sm },
  popularText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

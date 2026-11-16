import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Header, Loading, PaymentSheet, PriceText, Screen, Section, VehicleSelector } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { amcService, vehicleService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import type { GatewayResult } from '@/types';
import { formatINR, vehicleTypeLabel } from '@/utils/format';

export default function AmcPlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: plan } = useQuery(() => amcService.getAmcPlan(id), [id]);
  const { data: vehicles } = useQuery(async () => (plan ? vehicleService.listMyVehicles(plan.vehicle_type) : []), [plan?.vehicle_type]);
  const { data: subs } = useQuery(() => amcService.listMySubscriptions());
  const [pickedVehicleId, setVehicleId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [error, setError] = useState('');

  const vehicleId =
    pickedVehicleId && vehicles?.some((v) => v.id === pickedVehicleId) ? pickedVehicleId : (vehicles?.at(-1)?.id ?? null);

  if (!plan) return <Loading />;

  const alreadyCovered = subs?.find((s) => s.vehicle_id === vehicleId && s.status === 'active');

  const buy = () => {
    if (!vehicleId) return setError('Select or add a vehicle to cover');
    if (alreadyCovered) return setError(`This vehicle already has an active plan (${alreadyCovered.plan?.name}).`);
    setError('');
    setPayOpen(true);
  };

  const onPaid = async (gw: GatewayResult) => {
    const sub = await amcService.subscribeToPlan(plan.id, vehicleId!, gw);
    return sub.id;
  };

  return (
    <Screen
      header={<Header back title={plan.name} subtitle={`${vehicleTypeLabel[plan.vehicle_type]} · 12 months`} />}
      footer={
        <View style={{ gap: spacing.sm }}>
          {error ? <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text> : null}
          <Button title={`Buy plan · ${formatINR(plan.price_per_year)}`} variant="accent" size="lg" onPress={buy} />
        </View>
      }>
      <Card>
        <PriceText amount={plan.price_per_year} suffix=" / year" size="lg" color={colors.primary} />
        <Text style={[typography.small, { marginTop: 4 }]}>
          {plan.visits_per_year} scheduled visits · valid for 12 months from purchase
        </Text>
      </Card>
      <Section title="What's covered">
        <Card style={{ gap: spacing.md }}>
          {plan.covered_services.map((c) => (
            <View key={c} style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={typography.body}>{c}</Text>
            </View>
          ))}
        </Card>
      </Section>
      <Section title="Choose vehicle">
        <VehicleSelector vehicles={vehicles ?? []} selectedId={vehicleId} onSelect={setVehicleId} type={plan.vehicle_type} />
      </Section>
      <Text style={typography.small}>
        Book your covered visits anytime from the Services tab. Plans are non-transferable between vehicles.
      </Text>

      <PaymentSheet
        visible={payOpen}
        amount={plan.price_per_year}
        title={plan.name}
        onClose={() => setPayOpen(false)}
        onPaid={onPaid}
        successLabel="Plan activated!"
        onSuccess={() => {
          setPayOpen(false);
          if (router.canDismiss()) router.dismissAll();
          router.push('/profile/amc');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

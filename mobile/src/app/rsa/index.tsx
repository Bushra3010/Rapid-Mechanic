// Roadside assistance: vehicle → pin location → issue → notes → pay → RSA tracking.
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  Button,
  Card,
  DEFAULT_LOCATION,
  Header,
  MapPicker,
  PaymentSheet,
  Screen,
  Section,
  VehicleSelector,
  type MapValue,
} from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { catalogService, requestService, vehicleService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';
import type { GatewayResult } from '@/types';
import { formatINR } from '@/utils/format';
import { resetToTracking } from '@/utils/nav';

const ISSUE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  tyre: 'ellipse-outline',
  battery: 'battery-dead',
  tow: 'car',
  fuel: 'water',
  lock: 'key',
};

export default function Rsa() {
  const { data: vehicles } = useQuery(() => vehicleService.listMyVehicles());
  const [pickedVehicleId, setVehicleId] = useState<string | null>(null);
  const vehicle = vehicles?.find((v) => v.id === pickedVehicleId) ?? vehicles?.[0];
  const vehicleId = vehicle?.id ?? null;
  const { data: offerings } = useQuery(
    async () => (vehicle ? catalogService.listRsaOfferings(vehicle.type) : []),
    [vehicle?.type],
  );
  const [offeringId, setOfferingId] = useState<string | null>(null);
  const [loc, setLoc] = useState<MapValue>(DEFAULT_LOCATION);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const offering = offerings?.find((o) => o.id === offeringId);


  const request = () => {
    if (!vehicle) return setError('Select your vehicle');
    if (!offering) return setError('Choose what went wrong');
    if (loc.address.trim().length < 5) return setError('Pin your location or describe a landmark');
    setError('');
    setPayOpen(true);
  };

  const onPaid = async (gw: GatewayResult) => {
    const req = await requestService.createServiceRequest(
      {
        kind: 'rsa',
        vehicle_id: vehicle!.id,
        rsa_offering_id: offering!.id,
        address: loc.address.trim(),
        lat: loc.lat,
        lng: loc.lng,
        scheduled_at: new Date().toISOString(),
        notes,
        amount: offering!.price,
      },
      gw,
    );
    return req.id;
  };

  return (
    <Screen
      header={<Header back title="Roadside assistance" subtitle="24×7 · avg. arrival ~30 mins" />}
      footer={
        <View style={{ gap: spacing.sm }}>
          {error ? <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text> : null}
          <Button
            title={offering ? `Request help · ${formatINR(offering.price)}` : 'Request help'}
            variant="danger"
            size="lg"
            icon="warning"
            onPress={request}
          />
        </View>
      }>
      <View style={styles.alert}>
        <Ionicons name="call" size={18} color={colors.danger} />
        <Text style={styles.alertText}>In an accident or unsafe spot? Move to safety and call 112 first.</Text>
      </View>

      <Section title="Your vehicle">
        <VehicleSelector
          vehicles={vehicles ?? []}
          selectedId={vehicleId}
          onSelect={(id) => {
            setVehicleId(id);
            setOfferingId(null);
          }}
        />
      </Section>

      <Section title="Where are you?">
        <Card>
          <MapPicker value={loc} onChange={setLoc} addressLabel="Address / landmark" />
        </Card>
      </Section>

      {vehicle ? (
        <Section title="What's the problem?">
          <View style={styles.grid}>
            {offerings?.map((o) => {
              const key = Object.keys(ISSUE_ICON).find((k) => o.id.includes(k)) ?? 'tyre';
              const sel = o.id === offeringId;
              return (
                <Pressable key={o.id} onPress={() => setOfferingId(o.id)} style={[styles.issue, sel && styles.issueSel]}>
                  <Ionicons name={ISSUE_ICON[key]} size={24} color={sel ? colors.white : colors.danger} />
                  <Text style={[styles.issueName, sel && { color: colors.white }]}>{o.name}</Text>
                  <Text style={[styles.issuePrice, sel && { color: colors.white }]}>{formatINR(o.price)}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>
      ) : null}

      <Section title="Anything else? (optional)">
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Parked near the petrol pump, white Swift, hazard lights on"
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.notes}
        />
      </Section>

      <PaymentSheet
        visible={payOpen}
        amount={offering?.price ?? 0}
        title={offering ? `Roadside: ${offering.name}` : 'Roadside assistance'}
        onClose={() => setPayOpen(false)}
        onPaid={onPaid}
        successLabel="Help is on the way!"
        onSuccess={(id) => {
          setPayOpen(false);
          if (id) resetToTracking(`/track/request/${id}`);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  alert: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: radius.md },
  alertText: { flex: 1, color: colors.danger, fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  issue: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  issueSel: { backgroundColor: colors.danger, borderColor: colors.danger },
  issueName: { ...typography.bodyStrong, fontSize: 14 },
  issuePrice: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  notes: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
});

// Step 2: vehicle → address (MapPicker) → date/time slot → notes.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';

import {
  Button,
  Card,
  DEFAULT_LOCATION,
  Header,
  Loading,
  MapPicker,
  PriceText,
  Screen,
  Section,
  SlotPicker,
  slotToIso,
  VehicleSelector,
  type MapValue,
} from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { catalogService, vehicleService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

export default function BookingDetails() {
  const { service_id } = useLocalSearchParams<{ service_id: string }>();
  const { data: service } = useQuery(() => catalogService.getService(service_id), [service_id]);
  const { data: vehicles } = useQuery(
    async () => (service ? vehicleService.listMyVehicles(service.vehicle_type) : []),
    [service?.vehicle_type],
  );
  const [pickedVehicleId, setVehicleId] = useState<string | null>(null);
  const [loc, setLoc] = useState<MapValue>(DEFAULT_LOCATION);
  const [slot, setSlot] = useState<{ dayOffset: number | null; hour: number | null }>({ dayOffset: 1, hour: null });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // default to the most recently added vehicle until the user picks one
  const vehicleId =
    pickedVehicleId && vehicles?.some((v) => v.id === pickedVehicleId) ? pickedVehicleId : (vehicles?.at(-1)?.id ?? null);

  if (!service) return <Loading />;

  const next = () => {
    if (!vehicleId) return setError('Select or add a vehicle');
    if (loc.address.trim().length < 8) return setError('Enter the full service address');
    if (slot.dayOffset === null || slot.hour === null) return setError('Pick a date and time slot');
    setError('');
    router.push({
      pathname: '/book/review',
      params: {
        service_id: service.id,
        vehicle_id: vehicleId,
        address: loc.address.trim(),
        lat: String(loc.lat),
        lng: String(loc.lng),
        scheduled_at: slotToIso(slot.dayOffset, slot.hour),
        notes,
      },
    });
  };

  return (
    <Screen
      header={<Header back title="Booking details" subtitle={service.name} />}
      footer={
        <View style={{ gap: spacing.sm }}>
          {error ? <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text> : null}
          <View style={styles.footRow}>
            <PriceText amount={service.base_price} size="lg" />
            <Button title="Continue" fullWidth={false} style={{ flex: 1 }} onPress={next} />
          </View>
        </View>
      }>
      <Section title="1. Select vehicle">
        <VehicleSelector vehicles={vehicles ?? []} selectedId={vehicleId} onSelect={setVehicleId} type={service.vehicle_type} />
      </Section>
      <Section title="2. Service location">
        <Card>
          <MapPicker value={loc} onChange={setLoc} />
        </Card>
      </Section>
      <Section title="3. Date & time">
        <SlotPicker dayOffset={slot.dayOffset} hour={slot.hour} onChange={setSlot} />
      </Section>
      <Section title="4. Notes for mechanic (optional)">
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Brake noise from the rear wheel, call on arrival"
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.notes}
        />
        <Text style={typography.small}>Parts, if required, are billed separately after your approval.</Text>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  notes: {
    minHeight: 80,
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

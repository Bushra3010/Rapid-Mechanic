// Step 3: review & pay → creates service_request (status `submitted`) → tracking.
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Button, Card, Divider, Header, InfoRow as Info, Loading, PaymentSheet, Row, Screen, Section } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { catalogService, requestService, vehicleService } from '@/services';
import { spacing, typography } from '@/theme';
import type { GatewayResult } from '@/types';
import { formatDateTime, formatINR } from '@/utils/format';
import { resetToTracking } from '@/utils/nav';

export default function BookingReview() {
  const p = useLocalSearchParams<{
    service_id: string;
    vehicle_id: string;
    address: string;
    lat: string;
    lng: string;
    scheduled_at: string;
    notes: string;
  }>();
  const { data: service } = useQuery(() => catalogService.getService(p.service_id), [p.service_id]);
  const { data: vehicle } = useQuery(() => vehicleService.getVehicle(p.vehicle_id), [p.vehicle_id]);
  const [payOpen, setPayOpen] = useState(false);

  if (!service || !vehicle) return <Loading />;

  const amount = service.base_price;
  const taxIncluded = Math.round(amount - amount / 1.18);

  const onPaid = async (gw: GatewayResult) => {
    const req = await requestService.createServiceRequest(
      {
        kind: service.category,
        vehicle_id: vehicle.id,
        service_id: service.id,
        address: p.address,
        lat: Number(p.lat),
        lng: Number(p.lng),
        scheduled_at: p.scheduled_at,
        notes: p.notes ?? '',
        amount,
      },
      gw,
    );
    return req.id;
  };

  return (
    <Screen
      header={<Header back title="Review & pay" />}
      footer={<Button title={`Pay ${formatINR(amount)}`} variant="accent" size="lg" onPress={() => setPayOpen(true)} />}>
      <Card>
        <Text style={typography.caption}>{service.category === 'repair' ? 'REPAIR' : 'SERVICE'}</Text>
        <Text style={[typography.h3, { marginTop: 2 }]}>{service.name}</Text>
        <Text style={[typography.small, { marginTop: 4 }]}>{service.description}</Text>
      </Card>
      <Card style={{ gap: spacing.md }}>
        <Info icon={vehicle.type === 'two_wheeler' ? 'bicycle' : 'car-sport'} title={`${vehicle.make} ${vehicle.model}`} sub={vehicle.reg_number} />
        <Info icon="location" title="Service address" sub={p.address} />
        <Info icon="calendar" title="Scheduled for" sub={formatDateTime(p.scheduled_at)} />
        {p.notes ? <Info icon="chatbox-ellipses" title="Notes" sub={p.notes} /> : null}
      </Card>
      <Section title="Bill details">
        <Card>
          <Row label="Service charge" value={formatINR(amount)} />
          <Row label="Doorstep visit" value="FREE" />
          <Row label={`Includes GST (18%)`} value={formatINR(taxIncluded)} />
          <Divider />
          <Row label="To pay" value={formatINR(amount)} strong />
        </Card>
      </Section>
      <Text style={[typography.small, { textAlign: 'center' }]}>Free cancellation until a technician is assigned.</Text>

      <PaymentSheet
        visible={payOpen}
        amount={amount}
        title={service.name}
        onClose={() => setPayOpen(false)}
        onPaid={onPaid}
        successLabel="Booking confirmed!"
        onSuccess={(id) => {
          setPayOpen(false);
          if (id) resetToTracking(`/track/request/${id}`);
        }}
      />
    </Screen>
  );
}

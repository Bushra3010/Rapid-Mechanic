// Service / repair / RSA job tracking with status timeline + technician card.
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  DevSimulateButton,
  EmptyState,
  Header,
  InfoRow,
  Loading,
  Row,
  Screen,
  Section,
  StatusBadge,
  TechnicianCard,
  Timeline,
} from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { requestService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';
import { formatDateTime, formatINR, JOB_FLOW, jobStatusLabel, shortId } from '@/utils/format';

const HEADLINE: Record<string, { title: string; sub: string }> = {
  submitted: { title: 'Request received', sub: 'We are finding the best technician near you.' },
  assigned: { title: 'Technician assigned', sub: 'Your technician will reach you at the scheduled time.' },
  in_progress: { title: 'Work in progress', sub: 'Your technician is working on your vehicle.' },
  completed: { title: 'Job completed', sub: 'Thanks for choosing Rapid Mechanic!' },
  cancelled: { title: 'Request cancelled', sub: 'Any payment made will be refunded in 5–7 working days.' },
};

const RSA_HEADLINE: Record<string, { title: string; sub: string }> = {
  ...HEADLINE,
  submitted: { title: 'Finding help near you', sub: 'Hang tight — we are dispatching the nearest technician.' },
  assigned: { title: 'Help is on the way', sub: 'Estimated arrival in ~25–30 minutes.' },
  in_progress: { title: 'Technician has arrived', sub: 'Assistance in progress at your location.' },
};

export default function RequestTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: r, loading } = useQuery(() => requestService.getRequest(id), [id]);

  if (loading && !r) return <Loading />;
  if (!r) {
    return (
      <Screen header={<Header back title="Tracking" />}>
        <EmptyState icon="alert-circle-outline" title="Request not found" />
      </Screen>
    );
  }

  const isRsa = r.kind === 'rsa';
  const h = (isRsa ? RSA_HEADLINE : HEADLINE)[r.status];
  const canCancel = r.status === 'submitted';

  const cancel = () => {
    const doIt = () => requestService.cancelRequest(r.id);
    if (Platform.OS === 'web') {
      if (window.confirm('Cancel this request?')) doIt();
    } else {
      Alert.alert('Cancel request?', 'You will get a full refund.', [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel request', style: 'destructive', onPress: doIt },
      ]);
    }
  };

  return (
    <Screen
      header={
        <Header
          back
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/services'))}
          title={isRsa ? 'Roadside assistance' : 'Track service'}
          subtitle={shortId(r.id)}
        />
      }>
      <View style={[styles.hero, isRsa && { backgroundColor: colors.danger }, r.status === 'completed' && { backgroundColor: colors.success }]}>
        <Ionicons
          name={r.status === 'completed' ? 'checkmark-circle' : r.status === 'cancelled' ? 'close-circle' : isRsa ? 'navigate' : 'construct'}
          size={32}
          color={colors.white}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>{h.title}</Text>
          <Text style={styles.heroSub}>{h.sub}</Text>
        </View>
      </View>

      {r.technician && r.status !== 'cancelled' ? <TechnicianCard technician={r.technician} /> : null}

      <Section title="Status">
        <Card>
          <Timeline steps={JOB_FLOW} labels={jobStatusLabel} status={r.status} history={r.status_history} cancelledStatus="cancelled" />
        </Card>
        <DevSimulateButton
          disabled={r.status === 'completed' || r.status === 'cancelled'}
          onPress={() => requestService.simulateNextStatus(r.id)}
        />
      </Section>

      <Section title="Details">
        <Card style={{ gap: spacing.md }}>
          <View style={styles.titleRow}>
            <Text style={[typography.bodyStrong, { flex: 1 }]}>{r.title}</Text>
            <StatusBadge status={r.status} />
          </View>
          {r.vehicle ? (
            <InfoRow
              icon={r.vehicle.type === 'two_wheeler' ? 'bicycle' : 'car-sport'}
              title={`${r.vehicle.make} ${r.vehicle.model}`}
              sub={r.vehicle.reg_number}
            />
          ) : null}
          <InfoRow icon="location" title={isRsa ? 'Breakdown location' : 'Service address'} sub={`${r.address}\n${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`} />
          <InfoRow icon="calendar" title={isRsa ? 'Requested at' : 'Scheduled for'} sub={formatDateTime(r.scheduled_at)} />
          {r.notes ? <InfoRow icon="chatbox-ellipses" title="Notes" sub={r.notes} /> : null}
        </Card>
      </Section>

      <Card>
        <Row label="Amount" value={formatINR(r.amount)} strong />
        <Row label="Payment" value={r.payment_status === 'paid' ? 'Paid' : r.payment_status} />
      </Card>

      {canCancel ? <Button title="Cancel request" variant="outline" onPress={cancel} /> : null}
      {r.status === 'completed' && r.service ? (
        <Button
          title="Book again"
          icon="repeat"
          onPress={() => router.push({ pathname: '/book/details', params: { service_id: r.service!.id } })}
        />
      ) : null}
      <View style={styles.help}>
        <Ionicons name="headset-outline" size={16} color={colors.textMuted} />
        <Text style={typography.small}>Need help? Call 1800-120-7272</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg },
  heroTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  help: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});

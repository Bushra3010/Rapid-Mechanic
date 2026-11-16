import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  DevSimulateButton,
  Divider,
  EmptyState,
  Header,
  InfoRow,
  Loading,
  ProductThumb,
  Row,
  Screen,
  Section,
  StatusBadge,
  Timeline,
} from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { orderService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';
import { formatDate, formatINR, ORDER_FLOW, orderStatusLabel, shortId } from '@/utils/format';

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: o, loading } = useQuery(() => orderService.getOrder(id), [id]);

  if (loading && !o) return <Loading />;
  if (!o) {
    return (
      <Screen header={<Header back title="Order" />}>
        <EmptyState icon="alert-circle-outline" title="Order not found" />
      </Screen>
    );
  }

  const cancel = () => {
    const doIt = () => orderService.cancelOrder(o.id);
    if (Platform.OS === 'web') {
      if (window.confirm('Cancel this order?')) doIt();
    } else {
      Alert.alert('Cancel order?', 'A full refund will be issued to your original payment method.', [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel order', style: 'destructive', onPress: doIt },
      ]);
    }
  };

  return (
    <Screen
      header={
        <Header
          back
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/orders'))}
          title={`Order ${shortId(o.id)}`}
          subtitle={`Placed ${formatDate(o.created_at)}`}
        />
      }>
      <Card style={styles.statusCard}>
        <StatusBadge status={o.status} />
        <Text style={typography.h3}>
          {o.status === 'delivered'
            ? 'Delivered'
            : o.status === 'cancelled'
              ? 'Order cancelled'
              : o.status === 'placed'
                ? 'Seller is packing your order'
                : 'Your order is on the way'}
        </Text>
      </Card>

      {o.tracking ? (
        <Card style={styles.courier}>
          <Ionicons name="cube" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={typography.bodyStrong}>{o.tracking.courier}</Text>
            <Text style={typography.small}>AWB {o.tracking.awb}</Text>
          </View>
          <Pressable onPress={() => Linking.openURL(o.tracking!.url)} style={styles.trackBtn}>
            <Text style={styles.trackText}>Track</Text>
            <Ionicons name="open-outline" size={14} color={colors.accent} />
          </Pressable>
        </Card>
      ) : null}

      <Section title="Status">
        <Card>
          <Timeline steps={ORDER_FLOW} labels={orderStatusLabel} status={o.status} history={o.status_history} cancelledStatus="cancelled" />
        </Card>
        <DevSimulateButton
          disabled={o.status === 'delivered' || o.status === 'cancelled'}
          onPress={() => orderService.simulateNextOrderStatus(o.id)}
        />
      </Section>

      <Section title="Items">
        <Card style={{ gap: spacing.md }}>
          {o.items.map((i) => (
            <Pressable key={i.product_id} style={styles.item} onPress={() => router.push(`/product/${i.product_id}`)}>
              <View style={styles.thumb}>{i.product ? <ProductThumb product={i.product} size={56} /> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyStrong} numberOfLines={2}>
                  {i.product?.name ?? 'Product'}
                </Text>
                <Text style={typography.small}>
                  Qty {i.qty} · {i.product?.seller?.store_name}
                </Text>
              </View>
              <Text style={typography.bodyStrong}>{formatINR(i.price * i.qty)}</Text>
            </Pressable>
          ))}
          <Divider />
          <Row label="Total paid" value={formatINR(o.amount)} strong />
        </Card>
      </Section>

      <Card>
        <InfoRow icon="location" title="Delivery address" sub={o.shipping_address} />
      </Card>

      {o.status === 'placed' ? <Button title="Cancel order" variant="outline" onPress={cancel} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusCard: { gap: spacing.sm },
  courier: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  trackText: { color: colors.accent, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 56, height: 56, borderRadius: 10, overflow: 'hidden' },
});

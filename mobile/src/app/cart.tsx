import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Divider, EmptyState, Header, Loading, PriceText, ProductThumb, QtyStepper, Row, Screen } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { cartService, catalogService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import { formatINR } from '@/utils/format';

export default function Cart() {
  const { data: cart, loading } = useQuery(() => cartService.getCart());
  const { data: settings } = useQuery(() => catalogService.getPlatformSettings());

  if (loading && !cart) return <Loading />;
  const empty = !cart || cart.items.length === 0;

  return (
    <Screen
      header={<Header back title="My cart" subtitle={cart?.count ? `${cart.count} item${cart.count > 1 ? 's' : ''}` : undefined} />}
      footer={
        empty ? undefined : (
          <View style={styles.footRow}>
            <View>
              <Text style={typography.small}>Total</Text>
              <Text style={typography.h2}>{formatINR(cart.total)}</Text>
            </View>
            <Button title="Checkout" variant="accent" fullWidth={false} style={{ flex: 1 }} onPress={() => router.push('/checkout')} />
          </View>
        )
      }>
      {empty ? (
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Add oils, tyres, batteries and more from verified sellers."
          actionLabel="Browse products"
          onAction={() => router.push('/(tabs)/products')}
        />
      ) : (
        <>
          {cart.items.map(({ product, qty }) => (
            <Card key={product.id} style={styles.item}>
              <Pressable onPress={() => router.push(`/product/${product.id}`)} style={styles.thumb}>
                <ProductThumb product={product} size={72} />
              </Pressable>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={typography.bodyStrong} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={typography.small}>by {product.seller?.store_name}</Text>
                <View style={styles.itemFoot}>
                  <PriceText amount={product.price * qty} size="sm" />
                  <QtyStepper value={qty} max={product.stock} onChange={(n) => cartService.setCartQty(product.id, n)} />
                </View>
              </View>
            </Card>
          ))}
          <Card>
            <Row label={`Items (MRP)`} value={formatINR(cart.mrp_total)} />
            <Row label="Discount" value={<Text style={{ color: colors.success, fontWeight: '600' }}>−{formatINR(cart.mrp_total - cart.subtotal)}</Text>} />
            <Row label="Delivery" value={cart.shipping ? formatINR(cart.shipping) : 'FREE'} />
            <Divider />
            <Row label="Total" value={formatINR(cart.total)} strong />
            {cart.shipping && settings ? (
              <Text style={[typography.small, { color: colors.accent, marginTop: spacing.sm }]}>
                Add {formatINR(settings.free_shipping_above - cart.subtotal)} more for free delivery
              </Text>
            ) : null}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  footRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  item: { flexDirection: 'row', gap: spacing.md },
  thumb: { width: 72, borderRadius: 12, overflow: 'hidden' },
  itemFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Header, Loading, Screen, StatusBadge } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { cartService, orderService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';
import { formatDate, formatINR, shortId } from '@/utils/format';

export default function OrdersTab() {
  const { data: orders, loading } = useQuery(() => orderService.listMyOrders());
  const { data: cart } = useQuery(() => cartService.getCart());

  return (
    <Screen header={<Header title="Orders & cart" subtitle="Track your product orders" />}>
      {cart && cart.count > 0 ? (
        <Pressable style={styles.cart} onPress={() => router.push('/cart')}>
          <View style={styles.cartIcon}>
            <Ionicons name="cart" size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cartTitle}>
              {cart.count} item{cart.count > 1 ? 's' : ''} in your cart
            </Text>
            <Text style={styles.cartSub}>{formatINR(cart.total)} · Tap to checkout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </Pressable>
      ) : null}

      {loading && !orders ? (
        <Loading />
      ) : !orders?.length ? (
        <EmptyState
          icon="bag-handle-outline"
          title="No orders yet"
          message="Shop oils, tyres, batteries and accessories from trusted sellers."
          actionLabel="Browse products"
          onAction={() => router.push('/(tabs)/products')}
        />
      ) : (
        orders.map((o) => (
          <Card key={o.id} onPress={() => router.push(`/track/order/${o.id}`)}>
            <View style={styles.head}>
              <Text style={typography.bodyStrong}>Order {shortId(o.id)}</Text>
              <Text style={typography.bodyStrong}>{formatINR(o.amount)}</Text>
            </View>
            <Text style={typography.small}>Placed {formatDate(o.created_at)}</Text>
            <View style={{ gap: 2, marginTop: spacing.sm }}>
              {o.items.slice(0, 3).map((i) => (
                <Text key={i.product_id} style={typography.small} numberOfLines={1}>
                  {i.qty} × {i.product?.name ?? 'Product'}
                </Text>
              ))}
              {o.items.length > 3 ? <Text style={typography.small}>+{o.items.length - 3} more</Text> : null}
            </View>
            <View style={styles.foot}>
              <StatusBadge status={o.status} />
              <Text style={styles.track}>Track</Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cart: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.accent, borderRadius: radius.lg, padding: spacing.lg },
  cartIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cartTitle: { color: colors.white, fontWeight: '800', fontSize: 16 },
  cartSub: { color: '#FFE6D6', fontSize: 13 },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  track: { color: colors.accent, fontWeight: '700' },
});

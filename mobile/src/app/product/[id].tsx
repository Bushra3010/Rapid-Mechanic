import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Header, HeaderIconButton, Loading, PriceText, ProductThumb, QtyStepper, Screen, Section } from '@/components';
import { useCartCount, useQuery } from '@/hooks/useQuery';
import { cartService, productService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import { vehicleTypeLabel } from '@/utils/format';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product } = useQuery(() => productService.getProduct(id), [id]);
  const cartCount = useCartCount();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return <Loading />;
  const outOfStock = product.stock <= 0;

  const add = async () => {
    await cartService.addToCart(product.id, qty);
    setAdded(true);
  };

  return (
    <Screen
      padded={false}
      header={
        <Header
          back
          title={product.brand}
          right={<HeaderIconButton icon="cart-outline" label="Cart" badge={cartCount} onPress={() => router.push('/cart')} />}
        />
      }
      footer={
        added ? (
          <View style={styles.footRow}>
            <Button title="Keep shopping" variant="outline" fullWidth={false} style={{ flex: 1 }} onPress={() => router.back()} />
            <Button title="Go to cart" variant="accent" fullWidth={false} style={{ flex: 1 }} icon="cart" onPress={() => router.push('/cart')} />
          </View>
        ) : (
          <View style={styles.footRow}>
            <QtyStepper value={qty} max={product.stock} onChange={(n) => setQty(Math.max(1, n))} />
            <Button title={outOfStock ? 'Out of stock' : 'Add to cart'} variant="accent" fullWidth={false} style={{ flex: 1 }} disabled={outOfStock} onPress={add} />
          </View>
        )
      }>
      <ProductThumb product={product} size={240} />
      <View style={styles.body}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={typography.h2}>{product.name}</Text>
        <PriceText amount={product.price} mrp={product.mrp} size="lg" />
        <Text style={typography.small}>Inclusive of all taxes</Text>
        {added ? (
          <View style={styles.added}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: '700' }}>Added to cart</Text>
          </View>
        ) : null}

        <Card style={styles.seller}>
          <Ionicons name="storefront" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={typography.small}>Sold by</Text>
            <Text style={typography.bodyStrong}>{product.seller?.store_name}</Text>
          </View>
          {product.seller?.verified ? (
            <View style={styles.verified}>
              <Ionicons name="shield-checkmark" size={13} color={colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : null}
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={colors.white} />
            <Text style={styles.ratingText}>{product.seller?.rating.toFixed(1)}</Text>
          </View>
        </Card>

        <Section title="Details">
          <Card style={{ gap: spacing.sm }}>
            <Text style={typography.body}>{product.description}</Text>
            <Text style={typography.small}>Category: {product.category}</Text>
            <Text style={typography.small}>
              Fits: {product.compatible_vehicle_type === 'both' ? 'Two & four-wheelers' : vehicleTypeLabel[product.compatible_vehicle_type]}
            </Text>
            <Text style={[typography.small, { color: product.stock < 20 ? colors.accent : colors.success }]}>
              {outOfStock ? 'Out of stock' : product.stock < 20 ? `Only ${product.stock} left` : 'In stock'}
            </Text>
          </Card>
        </Section>

        <View style={styles.perks}>
          {[
            { icon: 'car-outline' as const, label: 'Free delivery over ₹499' },
            { icon: 'refresh-outline' as const, label: '7-day returns' },
            { icon: 'ribbon-outline' as const, label: '100% genuine' },
          ].map((p) => (
            <View key={p.label} style={styles.perk}>
              <Ionicons name={p.icon} size={20} color={colors.accent} />
              <Text style={styles.perkText}>{p.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  brand: { fontSize: 12, fontWeight: '800', color: colors.accent, letterSpacing: 0.6, textTransform: 'uppercase' },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  added: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seller: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontSize: 12, color: colors.success, fontWeight: '700' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.success, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  ratingText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  perks: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  perk: { flex: 1, alignItems: 'center', gap: 4 },
  perkText: { fontSize: 11, textAlign: 'center', color: colors.textMuted, fontWeight: '600' },
});

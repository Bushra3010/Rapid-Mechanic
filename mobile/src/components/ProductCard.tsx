import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { ProductWithSeller } from '@/services/products';
import { colors, radius, spacing, typography } from '@/theme';
import { Card } from './Card';
import { PriceText } from './PriceText';

const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Oils & Fluids': 'water',
  Brakes: 'disc',
  Tyres: 'ellipse-outline',
  Batteries: 'battery-charging',
  Filters: 'funnel',
  Accessories: 'construct',
  'Car Care': 'sparkles',
};

const CATEGORY_TINT = ['#E7EEF5', '#FDEFE5', '#E5F5EC', '#FFF6E0', '#EEE9FB'];

export function ProductThumb({ product, size = 120 }: { product: Pick<ProductWithSeller, 'images' | 'category'>; size?: number }) {
  // TODO(supabase-storage): products.images[] will hold public storage URLs.
  if (product.images[0]) {
    return <Image source={{ uri: product.images[0] }} style={[styles.thumb, { height: size }]} resizeMode="cover" />;
  }
  const idx = Object.keys(CATEGORY_ICON).indexOf(product.category);
  return (
    <View style={[styles.thumb, { height: size, backgroundColor: CATEGORY_TINT[Math.max(0, idx) % CATEGORY_TINT.length] }]}>
      <Ionicons name={CATEGORY_ICON[product.category] ?? 'cube'} size={size * 0.38} color={colors.primary} />
    </View>
  );
}

export function ProductCard({ product, onPress }: { product: ProductWithSeller; onPress: () => void }) {
  return (
    <Card onPress={onPress} padded={false} style={styles.card}>
      <ProductThumb product={product} />
      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <PriceText amount={product.price} mrp={product.mrp} size="sm" />
        <View style={styles.seller}>
          <Ionicons name="storefront-outline" size={12} color={colors.textMuted} />
          <Text style={typography.small} numberOfLines={1}>
            {product.seller?.store_name}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden' },
  thumb: { width: '100%', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  body: { padding: spacing.md, gap: 4 },
  brand: { fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.4 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, minHeight: 36 },
  seller: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, EmptyState, Header, HeaderIconButton, Loading, ProductCard } from '@/components';
import { PRODUCT_CATEGORIES } from '@/data/seed';
import { useCartCount, useQuery } from '@/hooks/useQuery';
import { productService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

export default function ProductsTab() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const cartCount = useCartCount();
  const { data, loading } = useQuery(() => productService.listProducts({ q, category }), [q, category]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Header
        title="Products"
        subtitle="Genuine parts from verified sellers"
        right={<HeaderIconButton icon="cart-outline" label="Cart" badge={cartCount} onPress={() => router.push('/cart')} />}
      />
      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search oil, tyres, helmets, brands…"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            returnKeyType="search"
          />
          {q ? <Ionicons name="close-circle" size={18} color={colors.textFaint} onPress={() => setQ('')} /> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: 2 }}>
          {PRODUCT_CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>
      {loading && !data ? (
        <Loading />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: spacing.md }}
          ListHeaderComponent={data?.length ? <Text style={typography.small}>{data.length} products</Text> : undefined}
          ListEmptyComponent={<EmptyState icon="search" title="No products found" message="Try a different search or category." />}
          renderItem={({ item }) => <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  searchWrap: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.md, backgroundColor: colors.surface },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
});

// Multi-seller catalog. TODO(supabase): from('products').select('*, sellers(store_name)')
import type { Product, Seller } from '@/types';
import { delay, readDb } from './_client';

export interface ProductWithSeller extends Product {
  seller: Seller | null;
}

function withSeller(p: Product): ProductWithSeller {
  return { ...p, seller: readDb().sellers.find((s) => s.id === p.seller_id) ?? null };
}

export async function listProducts(opts: { q?: string; category?: string } = {}): Promise<ProductWithSeller[]> {
  await delay(120);
  const q = opts.q?.trim().toLowerCase() ?? '';
  return readDb()
    .products.filter((p) => p.is_active)
    .filter((p) => !opts.category || opts.category === 'All' || p.category === opts.category)
    .filter((p) => !q || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q))
    .map(withSeller);
}

export async function getProduct(id: string): Promise<ProductWithSeller | null> {
  await delay(60);
  const p = readDb().products.find((x) => x.id === id);
  return p ? withSeller(p) : null;
}

// Cart stays client-side (zustand + AsyncStorage) even after Supabase is connected.
import { getState } from '@/store/useStore';
import { delay, readDb } from './_client';
import type { ProductWithSeller } from './products';

export interface CartItem {
  product: ProductWithSeller;
  qty: number;
}

export interface CartSummary {
  items: CartItem[];
  count: number;
  subtotal: number;
  mrp_total: number;
  shipping: number;
  total: number;
}

export async function getCart(): Promise<CartSummary> {
  await delay(30);
  const db = readDb();
  const items: CartItem[] = getState()
    .cart.map((line) => {
      const p = db.products.find((x) => x.id === line.product_id);
      if (!p) return null;
      return { product: { ...p, seller: db.sellers.find((s) => s.id === p.seller_id) ?? null }, qty: line.qty };
    })
    .filter((x): x is CartItem => !!x);
  const subtotal = items.reduce((n, i) => n + i.product.price * i.qty, 0);
  const mrp_total = items.reduce((n, i) => n + i.product.mrp * i.qty, 0);
  const { free_shipping_above, shipping_fee } = db.platform_settings;
  const shipping = subtotal === 0 || subtotal >= free_shipping_above ? 0 : shipping_fee;
  return { items, count: items.reduce((n, i) => n + i.qty, 0), subtotal, mrp_total, shipping, total: subtotal + shipping };
}

export async function addToCart(product_id: string, qty = 1): Promise<void> {
  const cart = getState().cart;
  const existing = cart.find((l) => l.product_id === product_id);
  getState().setCart(
    existing
      ? cart.map((l) => (l.product_id === product_id ? { ...l, qty: l.qty + qty } : l))
      : [...cart, { product_id, qty }],
  );
}

export async function setCartQty(product_id: string, qty: number): Promise<void> {
  const cart = getState().cart;
  getState().setCart(
    qty <= 0 ? cart.filter((l) => l.product_id !== product_id) : cart.map((l) => (l.product_id === product_id ? { ...l, qty } : l)),
  );
}

export async function clearCart(): Promise<void> {
  getState().setCart([]);
}

// Product orders. TODO(supabase): insert into 'orders' via an Edge Function that
// validates stock/prices and splits the order per seller.
import type { GatewayResult, Order, OrderStatus, StatusHistoryEntry } from '@/types';
import { ORDER_FLOW, uid } from '@/utils/format';
import { currentUserId, delay, nowIso, readDb, writeDb } from './_client';
import { clearCart, getCart } from './cart';
import { recordPayment } from './payments';
import type { ProductWithSeller } from './products';

export async function placeOrder(shipping_address: string, payment: GatewayResult): Promise<Order> {
  const cart = await getCart();
  if (cart.items.length === 0) throw new Error('Cart is empty');
  await delay(300);
  const id = uid('ord');
  const at = nowIso();
  const order: Order = {
    id,
    customer_id: currentUserId(),
    items: cart.items.map((i) => ({ product_id: i.product.id, seller_id: i.product.seller_id, qty: i.qty, price: i.product.price })),
    amount: cart.total,
    shipping_address,
    payment_status: 'paid',
    status: 'placed',
    status_history: [{ status: 'placed', at, by_role: 'customer', note: 'Order placed' }],
    tracking: null,
    created_at: at,
  };
  writeDb((db) => ({
    ...db,
    orders: [order, ...db.orders],
    products: db.products.map((p) => {
      const line = order.items.find((i) => i.product_id === p.id);
      return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
    }),
  }));
  recordPayment('order', id, order.amount, payment);
  await clearCart();
  return order;
}

export interface OrderDetail extends Omit<Order, 'items'> {
  items: (Order['items'][number] & { product: ProductWithSeller | null })[];
}

function hydrate(o: Order): OrderDetail {
  const db = readDb();
  return {
    ...o,
    items: o.items.map((i) => {
      const p = db.products.find((x) => x.id === i.product_id);
      return { ...i, product: p ? { ...p, seller: db.sellers.find((s) => s.id === p.seller_id) ?? null } : null };
    }),
  };
}

export async function listMyOrders(): Promise<OrderDetail[]> {
  await delay(100);
  const me = currentUserId();
  return readDb()
    .orders.filter((o) => o.customer_id === me)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(hydrate);
}

export async function getOrder(id: string): Promise<OrderDetail | null> {
  await delay(80);
  const o = readDb().orders.find((x) => x.id === id);
  return o ? hydrate(o) : null;
}

function pushStatus(id: string, status: OrderStatus, by_role: StatusHistoryEntry['by_role'], note: string, patch: Partial<Order> = {}) {
  writeDb((db) => ({
    ...db,
    orders: db.orders.map((o) =>
      o.id === id ? { ...o, ...patch, status, status_history: [...o.status_history, { status, at: nowIso(), by_role, note }] } : o,
    ),
  }));
}

export async function cancelOrder(id: string): Promise<void> {
  await delay(200);
  pushStatus(id, 'cancelled', 'customer', 'Cancelled by customer');
}

/** DEV ONLY — mimics seller / fulfilment updates: placed → dispatched → in_transit → delivered. */
export async function simulateNextOrderStatus(id: string): Promise<void> {
  await delay(150);
  const o = readDb().orders.find((x) => x.id === id);
  if (!o || o.status === 'cancelled' || o.status === 'delivered') return;
  const next = ORDER_FLOW[ORDER_FLOW.indexOf(o.status) + 1];
  if (next === 'dispatched') {
    const awb = `DLV${Math.floor(1e9 + Math.random() * 9e9)}`;
    pushStatus(id, next, 'seller', 'Handed over to Delhivery', {
      tracking: { courier: 'Delhivery', awb, url: `https://www.delhivery.com/track/package/${awb}` },
    });
  } else if (next === 'in_transit') {
    pushStatus(id, next, 'system', 'Reached nearest hub');
  } else if (next === 'delivered') {
    pushStatus(id, next, 'system', 'Delivered to customer');
  }
}

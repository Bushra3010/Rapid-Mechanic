// Mock payment gateway. TODO(payment-gateway): replace `chargeMock` with the real
// SDK (e.g. Razorpay / Cashfree / PhonePe PG): create an order on the backend
// (Supabase Edge Function), open the checkout SDK, then verify the signature
// server-side before marking the payment `paid`.
import type { GatewayResult, Payment } from '@/types';
import { uid } from '@/utils/format';
import { delay, nowIso, writeDb } from './_client';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export async function chargeMock(amount: number, method: PaymentMethod): Promise<GatewayResult> {
  await delay(1200);
  if (amount <= 0) throw new Error('Invalid amount');
  return { gateway: `mock_${method}`, gateway_ref: uid('mocktxn') };
}

/** Internal: records a payment row. Called by the create* services. */
export function recordPayment(
  ref_type: Payment['ref_type'],
  ref_id: string,
  amount: number,
  gw: GatewayResult,
): Payment {
  const payment: Payment = {
    id: uid('pay'),
    ref_type,
    ref_id,
    amount,
    gateway: gw.gateway,
    gateway_ref: gw.gateway_ref,
    status: 'paid',
    created_at: nowIso(),
  };
  writeDb((db) => ({ ...db, payments: [...db.payments, payment] }));
  return payment;
}

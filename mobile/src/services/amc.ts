// Yearly AMC plans. TODO(supabase): from('amc_plans'), insert into 'amc_subscriptions'.
import type { AmcPlan, AmcSubscription, GatewayResult, Vehicle, VehicleType } from '@/types';
import { uid } from '@/utils/format';
import { currentUserId, delay, nowIso, readDb, writeDb } from './_client';
import { recordPayment } from './payments';

export async function listAmcPlans(vehicle_type: VehicleType): Promise<AmcPlan[]> {
  await delay(100);
  return readDb()
    .amc_plans.filter((p) => p.is_active && p.vehicle_type === vehicle_type)
    .sort((a, b) => a.price_per_year - b.price_per_year);
}

export async function getAmcPlan(id: string): Promise<AmcPlan | null> {
  await delay(50);
  return readDb().amc_plans.find((p) => p.id === id) ?? null;
}

export async function subscribeToPlan(plan_id: string, vehicle_id: string, payment: GatewayResult): Promise<AmcSubscription> {
  await delay(300);
  const plan = readDb().amc_plans.find((p) => p.id === plan_id);
  if (!plan) throw new Error('Plan not found');
  const id = uid('amcs');
  const start = new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  const pay = recordPayment('amc', id, plan.price_per_year, payment);
  const sub: AmcSubscription = {
    id,
    customer_id: currentUserId(),
    plan_id,
    vehicle_id,
    start_date: nowIso(),
    end_date: end.toISOString(),
    status: 'active',
    payment_id: pay.id,
  };
  writeDb((db) => ({ ...db, amc_subscriptions: [sub, ...db.amc_subscriptions] }));
  return sub;
}

export interface AmcSubscriptionDetail extends AmcSubscription {
  plan: AmcPlan | null;
  vehicle: Vehicle | null;
}

export async function listMySubscriptions(): Promise<AmcSubscriptionDetail[]> {
  await delay(100);
  const me = currentUserId();
  const db = readDb();
  return db.amc_subscriptions
    .filter((s) => s.customer_id === me)
    .map((s) => ({
      ...s,
      // expire locally if the end date has passed
      status: s.status === 'active' && new Date(s.end_date) < new Date() ? 'expired' : s.status,
      plan: db.amc_plans.find((p) => p.id === s.plan_id) ?? null,
      vehicle: db.vehicles.find((v) => v.id === s.vehicle_id) ?? null,
    }));
}

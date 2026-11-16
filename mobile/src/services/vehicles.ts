// TODO(supabase): from('vehicles') with RLS customer_id = auth.uid()
import type { Vehicle, VehicleType } from '@/types';
import { uid } from '@/utils/format';
import { currentUserId, delay, readDb, writeDb } from './_client';

export type VehicleInput = Omit<Vehicle, 'id' | 'customer_id'>;

export async function listMyVehicles(type?: VehicleType): Promise<Vehicle[]> {
  await delay(80);
  const me = currentUserId();
  return readDb().vehicles.filter((v) => v.customer_id === me && (!type || v.type === type));
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  await delay(50);
  return readDb().vehicles.find((v) => v.id === id) ?? null;
}

export async function saveVehicle(input: VehicleInput, id?: string): Promise<Vehicle> {
  await delay(250);
  const me = currentUserId();
  const vehicle: Vehicle = { ...input, reg_number: input.reg_number.toUpperCase(), id: id ?? uid('veh'), customer_id: me };
  writeDb((db) => ({
    ...db,
    vehicles: id ? db.vehicles.map((v) => (v.id === id ? vehicle : v)) : [...db.vehicles, vehicle],
  }));
  return vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  await delay(200);
  writeDb((db) => ({ ...db, vehicles: db.vehicles.filter((v) => v.id !== id) }));
}

// Read-only catalog managed from the admin panel.
// TODO(supabase): from('services' | 'rsa_offerings' | 'technicians' | 'platform_settings')
import type { PlatformSettings, RsaOffering, Service, Technician, VehicleType } from '@/types';
import { delay, readDb } from './_client';

export async function listServices(vehicle_type: VehicleType, category?: Service['category']): Promise<Service[]> {
  await delay(100);
  return readDb().services.filter(
    (s) => s.is_active && s.vehicle_type === vehicle_type && (!category || s.category === category),
  );
}

export async function getService(id: string): Promise<Service | null> {
  await delay(50);
  return readDb().services.find((s) => s.id === id) ?? null;
}

export async function listRsaOfferings(vehicle_type: VehicleType): Promise<RsaOffering[]> {
  await delay(100);
  return readDb().rsa_offerings.filter((r) => r.is_active && r.vehicle_type === vehicle_type);
}

export async function getRsaOffering(id: string): Promise<RsaOffering | null> {
  await delay(50);
  return readDb().rsa_offerings.find((r) => r.id === id) ?? null;
}

export interface TechnicianWithProfile extends Technician {
  full_name: string;
  phone: string;
}

export async function getTechnician(id: string): Promise<TechnicianWithProfile | null> {
  await delay(50);
  const db = readDb();
  const t = db.technicians.find((x) => x.id === id);
  if (!t) return null;
  const p = db.profiles.find((x) => x.id === id);
  return { ...t, full_name: p?.full_name ?? '', phone: p?.phone ?? '' };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  await delay(30);
  return readDb().platform_settings;
}

// Service / repair / RSA jobs.
// TODO(supabase): insert into 'service_requests' (status 'submitted'); status changes
// are made by admin/technician panels and streamed back via supabase realtime.
import type {
  GatewayResult,
  JobStatus,
  RsaOffering,
  Service,
  ServiceRequest,
  StatusHistoryEntry,
  Vehicle,
} from '@/types';
import { JOB_FLOW, uid } from '@/utils/format';
import { currentUserId, delay, nowIso, readDb, writeDb } from './_client';
import { getTechnician, type TechnicianWithProfile } from './catalog';
import { recordPayment } from './payments';

export interface CreateRequestInput {
  kind: ServiceRequest['kind'];
  vehicle_id: string;
  service_id?: string | null;
  rsa_offering_id?: string | null;
  address: string;
  lat: number;
  lng: number;
  scheduled_at: string;
  notes: string;
  amount: number;
}

export async function createServiceRequest(input: CreateRequestInput, payment: GatewayResult): Promise<ServiceRequest> {
  await delay(300);
  const id = uid('sr');
  const at = nowIso();
  const req: ServiceRequest = {
    id,
    customer_id: currentUserId(),
    kind: input.kind,
    vehicle_id: input.vehicle_id,
    service_id: input.service_id ?? null,
    rsa_offering_id: input.rsa_offering_id ?? null,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    scheduled_at: input.scheduled_at,
    notes: input.notes,
    amount: input.amount,
    payment_status: 'paid',
    technician_id: null,
    status: 'submitted',
    status_history: [
      { status: 'submitted', at, by_role: 'customer', note: input.kind === 'rsa' ? 'Roadside help requested' : 'Request placed from app' },
    ],
    created_at: at,
  };
  writeDb((db) => ({ ...db, service_requests: [req, ...db.service_requests] }));
  recordPayment('service_request', id, input.amount, payment);
  return req;
}

export interface ServiceRequestDetail extends ServiceRequest {
  service: Service | null;
  rsa_offering: RsaOffering | null;
  vehicle: Vehicle | null;
  technician: TechnicianWithProfile | null;
  title: string;
}

function hydrate(r: ServiceRequest): Omit<ServiceRequestDetail, 'technician'> {
  const db = readDb();
  const service = r.service_id ? db.services.find((s) => s.id === r.service_id) ?? null : null;
  const rsa_offering = r.rsa_offering_id ? db.rsa_offerings.find((o) => o.id === r.rsa_offering_id) ?? null : null;
  const vehicle = db.vehicles.find((v) => v.id === r.vehicle_id) ?? null;
  const title = service?.name ?? (rsa_offering ? `Roadside: ${rsa_offering.name}` : 'Service request');
  return { ...r, service, rsa_offering, vehicle, title };
}

export async function listMyRequests(): Promise<ServiceRequestDetail[]> {
  await delay(100);
  const me = currentUserId();
  const db = readDb();
  return db.service_requests
    .filter((r) => r.customer_id === me)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((r) => {
      const t = r.technician_id ? db.technicians.find((x) => x.id === r.technician_id) : null;
      const p = t ? db.profiles.find((x) => x.id === t.id) : null;
      return { ...hydrate(r), technician: t ? { ...t, full_name: p?.full_name ?? '', phone: p?.phone ?? '' } : null };
    });
}

export async function getRequest(id: string): Promise<ServiceRequestDetail | null> {
  await delay(80);
  const r = readDb().service_requests.find((x) => x.id === id);
  if (!r) return null;
  const technician = r.technician_id ? await getTechnician(r.technician_id) : null;
  return { ...hydrate(r), technician };
}

export async function cancelRequest(id: string): Promise<void> {
  await delay(200);
  pushStatus(id, 'cancelled', 'customer', 'Cancelled by customer');
}

function pushStatus(id: string, status: JobStatus, by_role: StatusHistoryEntry['by_role'], note: string, patch: Partial<ServiceRequest> = {}) {
  writeDb((db) => ({
    ...db,
    service_requests: db.service_requests.map((r) =>
      r.id === id
        ? { ...r, ...patch, status, status_history: [...r.status_history, { status, at: nowIso(), by_role, note }] }
        : r,
    ),
  }));
}

/**
 * DEV ONLY — mimics what the admin / technician panels will do.
 * submitted → assigned (picks a technician) → in_progress → completed.
 */
export async function simulateNextStatus(id: string): Promise<void> {
  await delay(150);
  const db = readDb();
  const r = db.service_requests.find((x) => x.id === id);
  if (!r || r.status === 'cancelled' || r.status === 'completed') return;
  const next = JOB_FLOW[JOB_FLOW.indexOf(r.status) + 1];
  if (next === 'assigned') {
    const candidates = db.technicians.filter(
      (t) => t.is_active && (r.kind === 'rsa' || !r.service_id || t.service_ids.includes(r.service_id)),
    );
    const tech = candidates[Math.floor(Math.random() * candidates.length)] ?? db.technicians[0];
    pushStatus(id, 'assigned', 'admin', `Assigned to ${tech.business_name}`, { technician_id: tech.id });
  } else if (next === 'in_progress') {
    pushStatus(id, 'in_progress', 'technician', r.kind === 'rsa' ? 'Technician reached your location' : 'Technician started work');
  } else if (next === 'completed') {
    pushStatus(id, 'completed', 'technician', r.kind === 'rsa' ? 'Assistance completed' : 'Job completed');
  }
}

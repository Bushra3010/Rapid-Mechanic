import type { Fuel, JobStatus, OrderStatus, VehicleType } from '@/types';

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ₹ with Indian digit grouping, e.g. ₹1,25,000 */
export function formatINR(amount: number): string {
  return `₹${inr.format(Math.round(amount))}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${pad(d.getMinutes())} ${ampm}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} · ${formatTime(iso)}`;
}

export function dayLabel(d: Date): { top: string; bottom: string } {
  return { top: DAYS[d.getDay()], bottom: `${d.getDate()} ${MONTHS[d.getMonth()]}` };
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export const vehicleTypeLabel: Record<VehicleType, string> = {
  two_wheeler: 'Two-wheeler',
  four_wheeler: 'Four-wheeler',
};

export const jobStatusLabel: Record<JobStatus, string> = {
  submitted: 'Request submitted',
  assigned: 'Job assigned',
  in_progress: 'Work in progress',
  completed: 'Job completed',
  cancelled: 'Cancelled',
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  placed: 'Order placed',
  dispatched: 'Dispatched',
  in_transit: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const JOB_FLOW: JobStatus[] = ['submitted', 'assigned', 'in_progress', 'completed'];
export const ORDER_FLOW: OrderStatus[] = ['placed', 'dispatched', 'in_transit', 'delivered'];

export function shortId(id: string): string {
  return `#${id.replace(/^[a-z]+_/, '').slice(-6).toUpperCase()}`;
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export const fuelLabel: Record<Fuel, string> = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  cng: 'CNG',
  electric: 'Electric',
};

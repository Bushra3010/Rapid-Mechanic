// Entity shapes mirror docs/DOMAIN_MODEL.md (snake_case = future Supabase columns).

export type Role = 'customer' | 'admin' | 'seller' | 'technician';
export type VehicleType = 'two_wheeler' | 'four_wheeler';
export type Fuel = 'petrol' | 'diesel' | 'cng' | 'electric';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  reg_number: string;
  fuel: Fuel;
}

export interface Service {
  id: string;
  vehicle_type: VehicleType;
  category: 'service' | 'repair';
  name: string;
  description: string;
  base_price: number;
  duration_mins: number;
  is_active: boolean;
}

export interface ServiceArea {
  pincode: string;
  city: string;
  radius_km: number;
}

export interface Technician {
  id: string;
  business_name: string;
  rating: number;
  experience_years: number;
  verified: boolean;
  is_active: boolean;
  service_ids: string[];
  service_areas: ServiceArea[];
}

export interface Seller {
  id: string;
  store_name: string;
  gstin: string;
  rating: number;
  verified: boolean;
  is_active: boolean;
}

export interface AmcPlan {
  id: string;
  name: string;
  vehicle_type: VehicleType;
  price_per_year: number;
  covered_services: string[];
  visits_per_year: number;
  is_active: boolean;
}

export type AmcStatus = 'active' | 'expired' | 'cancelled';

export interface AmcSubscription {
  id: string;
  customer_id: string;
  plan_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  status: AmcStatus;
  payment_id: string;
}

export interface RsaOffering {
  id: string;
  name: string;
  vehicle_type: VehicleType;
  price: number;
  is_active: boolean;
}

export type JobStatus = 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type OrderStatus = 'placed' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface StatusHistoryEntry<S extends string = string> {
  status: S;
  at: string;
  by_role: Role | 'system';
  note: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  kind: 'service' | 'repair' | 'rsa';
  vehicle_id: string;
  service_id: string | null;
  rsa_offering_id: string | null;
  address: string;
  lat: number;
  lng: number;
  scheduled_at: string;
  notes: string;
  amount: number;
  payment_status: PaymentStatus;
  technician_id: string | null;
  status: JobStatus;
  status_history: StatusHistoryEntry<JobStatus>[];
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  images: string[];
  compatible_vehicle_type: VehicleType | 'both';
  is_active: boolean;
}

export interface OrderItem {
  product_id: string;
  seller_id: string;
  qty: number;
  price: number;
}

export interface OrderTracking {
  courier: string;
  awb: string;
  url: string;
}

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  amount: number;
  shipping_address: string;
  payment_status: PaymentStatus;
  status: OrderStatus;
  status_history: StatusHistoryEntry<OrderStatus>[];
  tracking: OrderTracking | null;
  created_at: string;
}

export interface Payment {
  id: string;
  ref_type: 'service_request' | 'amc' | 'order';
  ref_id: string;
  amount: number;
  gateway: string;
  gateway_ref: string;
  status: PaymentStatus;
  created_at: string;
}

export interface PlatformSettings {
  commission_percent: number;
  tax_percent: number;
  support_phone: string;
  support_email: string;
  service_radius_km: number;
  free_shipping_above: number;
  shipping_fee: number;
}

export interface CartLine {
  product_id: string;
  qty: number;
}

/** Result of the (mock) payment gateway, passed into create* service calls. */
export interface GatewayResult {
  gateway: string;
  gateway_ref: string;
}

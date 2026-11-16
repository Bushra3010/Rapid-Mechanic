// Mirrors docs/DOMAIN_MODEL.md — keep column names identical to future Supabase tables.
export type Role = 'customer' | 'admin' | 'seller' | 'technician'
export type VehicleType = 'two_wheeler' | 'four_wheeler'
export type JobStatus = 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
export type OrderStatus = 'placed' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface StatusEvent<S extends string = string> { status: S; at: string; by_role: Role | 'system'; note?: string }

export interface Profile { id: string; role: Role; full_name: string; phone: string; email: string; avatar_url?: string; created_at: string }
export interface Vehicle { id: string; customer_id: string; type: VehicleType; make: string; model: string; year: number; reg_number: string; fuel: string }
export interface Service { id: string; vehicle_type: VehicleType; category: 'service' | 'repair'; name: string; description: string; base_price: number; duration_mins: number; is_active: boolean }
export interface ServiceArea { city: string; pincode: string; radius_km: number }
export interface Technician { id: string; full_name: string; phone: string; email: string; business_name: string; rating: number; experience_years: number; verified: boolean; is_active: boolean; service_ids: string[]; service_areas: ServiceArea[]; created_at: string }
export interface Seller { id: string; full_name: string; phone: string; email: string; store_name: string; gstin: string; city: string; rating: number; verified: boolean; is_active: boolean; created_at: string }
export interface AmcPlan { id: string; name: string; vehicle_type: VehicleType; price_per_year: number; covered_services: string[]; visits_per_year: number; is_active: boolean }
export interface AmcSubscription { id: string; customer_id: string; plan_id: string; vehicle_id: string; start_date: string; end_date: string; status: 'active' | 'expired' | 'cancelled'; payment_id: string }
export interface RsaOffering { id: string; name: string; vehicle_type: VehicleType; price: number; description: string; is_active: boolean }
export interface ServiceRequest {
  id: string; customer_id: string; kind: 'service' | 'repair' | 'rsa'; vehicle_id: string
  service_id?: string; rsa_offering_id?: string; address: string; lat: number; lng: number
  scheduled_at: string; notes?: string; amount: number; payment_status: PaymentStatus
  technician_id?: string; status: JobStatus; status_history: StatusEvent<JobStatus>[]; created_at: string
}
export interface Product { id: string; seller_id: string; name: string; category: string; brand: string; description: string; price: number; mrp: number; stock: number; images: string[]; compatible_vehicle_type: VehicleType | 'both'; is_active: boolean }
export interface OrderItem { product_id: string; seller_id: string; qty: number; price: number }
export interface Order {
  id: string; customer_id: string; items: OrderItem[]; amount: number; shipping_address: string
  payment_status: PaymentStatus; status: OrderStatus; status_history: StatusEvent<OrderStatus>[]
  tracking?: { courier: string; awb: string; url?: string }; created_at: string
}
export interface Payment { id: string; ref_type: 'service_request' | 'amc' | 'order'; ref_id: string; amount: number; gateway: string; gateway_ref: string; status: PaymentStatus; created_at: string }
export interface PlatformSettings { commission_percent: number; tax_percent: number; support_phone: string; support_email: string; default_service_radius_km: number; rsa_enabled: boolean; marketplace_enabled: boolean }

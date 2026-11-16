import type {
  AmcPlan, AmcSubscription, Order, PlatformSettings, Product, Profile, RsaOffering,
  Seller, Service, ServiceRequest, Technician, Vehicle,
} from '../types'

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()

export const seedCustomers: Profile[] = [
  { id: 'cus_1', role: 'customer', full_name: 'Aarav Mehta', phone: '+91 98200 11223', email: 'aarav.m@example.com', created_at: ago(900) },
  { id: 'cus_2', role: 'customer', full_name: 'Priya Nair', phone: '+91 99300 44556', email: 'priya.n@example.com', created_at: ago(700) },
  { id: 'cus_3', role: 'customer', full_name: 'Rohan Kulkarni', phone: '+91 97690 77889', email: 'rohan.k@example.com', created_at: ago(400) },
  { id: 'cus_4', role: 'customer', full_name: 'Sneha Iyer', phone: '+91 90040 22113', email: 'sneha.i@example.com', created_at: ago(120) },
]

export const seedVehicles: Vehicle[] = [
  { id: 'veh_1', customer_id: 'cus_1', type: 'four_wheeler', make: 'Maruti Suzuki', model: 'Swift', year: 2021, reg_number: 'MH 04 KX 2231', fuel: 'Petrol' },
  { id: 'veh_2', customer_id: 'cus_1', type: 'two_wheeler', make: 'Honda', model: 'Activa 6G', year: 2022, reg_number: 'MH 04 LB 8812', fuel: 'Petrol' },
  { id: 'veh_3', customer_id: 'cus_2', type: 'four_wheeler', make: 'Hyundai', model: 'Creta', year: 2023, reg_number: 'MH 43 AR 1190', fuel: 'Diesel' },
  { id: 'veh_4', customer_id: 'cus_3', type: 'two_wheeler', make: 'Royal Enfield', model: 'Classic 350', year: 2020, reg_number: 'MH 02 DQ 4410', fuel: 'Petrol' },
  { id: 'veh_5', customer_id: 'cus_4', type: 'four_wheeler', make: 'Tata', model: 'Nexon EV', year: 2024, reg_number: 'MH 01 EV 7007', fuel: 'Electric' },
]

export const seedServices: Service[] = [
  { id: 'svc_1', vehicle_type: 'two_wheeler', category: 'service', name: 'General Bike Service', description: 'Engine oil change, chain lube, brake check, wash', base_price: 799, duration_mins: 90, is_active: true },
  { id: 'svc_2', vehicle_type: 'two_wheeler', category: 'service', name: 'Scooter Periodic Service', description: 'Oil, air filter clean, CVT check, wash', base_price: 699, duration_mins: 75, is_active: true },
  { id: 'svc_3', vehicle_type: 'two_wheeler', category: 'repair', name: 'Brake Shoe Replacement', description: 'Front/rear brake shoe replacement with labour', base_price: 449, duration_mins: 45, is_active: true },
  { id: 'svc_4', vehicle_type: 'two_wheeler', category: 'repair', name: 'Clutch Plate Repair', description: 'Clutch inspection and plate replacement', base_price: 1299, duration_mins: 120, is_active: true },
  { id: 'svc_5', vehicle_type: 'four_wheeler', category: 'service', name: 'Basic Car Service', description: 'Engine oil, oil filter, 20-point inspection, wash', base_price: 2499, duration_mins: 180, is_active: true },
  { id: 'svc_6', vehicle_type: 'four_wheeler', category: 'service', name: 'Comprehensive Car Service', description: 'All filters, coolant top-up, brake service, 50-point check', base_price: 4999, duration_mins: 300, is_active: true },
  { id: 'svc_7', vehicle_type: 'four_wheeler', category: 'repair', name: 'AC Gas Refill & Service', description: 'AC gas top-up, leak test, cabin filter clean', base_price: 1899, duration_mins: 120, is_active: true },
  { id: 'svc_8', vehicle_type: 'four_wheeler', category: 'repair', name: 'Battery Replacement', description: 'Battery health test and replacement (battery extra)', base_price: 299, duration_mins: 30, is_active: true },
  { id: 'svc_9', vehicle_type: 'four_wheeler', category: 'repair', name: 'Suspension Repair', description: 'Shock absorber and link inspection & repair', base_price: 2199, duration_mins: 180, is_active: false },
]

export const seedTechnicians: Technician[] = [
  { id: 'tec_1', full_name: 'Imran Shaikh', phone: '+91 98670 12345', email: 'imran@rapidmech.in', business_name: 'Shaikh Auto Works', rating: 4.8, experience_years: 9, verified: true, is_active: true, service_ids: ['svc_5', 'svc_6', 'svc_7', 'svc_8'], service_areas: [{ city: 'Navi Mumbai', pincode: '400703', radius_km: 10 }, { city: 'Thane', pincode: '400601', radius_km: 8 }], created_at: ago(2000) },
  { id: 'tec_2', full_name: 'Sunil Patil', phone: '+91 98920 55667', email: 'sunil@rapidmech.in', business_name: 'Patil Two-Wheeler Care', rating: 4.6, experience_years: 6, verified: true, is_active: true, service_ids: ['svc_1', 'svc_2', 'svc_3', 'svc_4'], service_areas: [{ city: 'Mumbai', pincode: '400050', radius_km: 6 }], created_at: ago(1500) },
  { id: 'tec_3', full_name: 'Deepak Yadav', phone: '+91 99200 88990', email: 'deepak@rapidmech.in', business_name: 'Yadav Roadside Rescue', rating: 4.4, experience_years: 4, verified: false, is_active: true, service_ids: ['svc_1', 'svc_8'], service_areas: [{ city: 'Pune', pincode: '411001', radius_km: 15 }], created_at: ago(300) },
]

export const seedSellers: Seller[] = [
  { id: 'sel_1', full_name: 'Vikram Shah', phone: '+91 98210 33445', email: 'vikram@autoparts.in', store_name: 'Shah Auto Parts', gstin: '27ABCDE1234F1Z5', city: 'Mumbai', rating: 4.7, verified: true, is_active: true, created_at: ago(2500) },
  { id: 'sel_2', full_name: 'Neha Joshi', phone: '+91 98330 66778', email: 'neha@moto-gear.in', store_name: 'MotoGear Hub', gstin: '27FGHIJ5678K1Z2', city: 'Pune', rating: 4.5, verified: true, is_active: true, created_at: ago(1800) },
  { id: 'sel_3', full_name: 'Karan Malhotra', phone: '+91 97730 99001', email: 'karan@carcare.in', store_name: 'CarCare Essentials', gstin: '27LMNOP9012Q1Z8', city: 'Thane', rating: 4.2, verified: false, is_active: true, created_at: ago(200) },
]

export const seedProducts: Product[] = [
  { id: 'prd_1', seller_id: 'sel_1', name: 'Castrol GTX 20W-50 Engine Oil 3.5L', category: 'Lubricants', brand: 'Castrol', description: 'Mineral engine oil for petrol cars', price: 1349, mrp: 1599, stock: 42, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
  { id: 'prd_2', seller_id: 'sel_1', name: 'Bosch Wiper Blade Set 22"/16"', category: 'Accessories', brand: 'Bosch', description: 'Frameless aerotwin wiper blades', price: 899, mrp: 1150, stock: 18, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
  { id: 'prd_3', seller_id: 'sel_2', name: 'Motul 7100 10W-40 1L', category: 'Lubricants', brand: 'Motul', description: '100% synthetic 4T bike oil', price: 749, mrp: 850, stock: 60, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
  { id: 'prd_4', seller_id: 'sel_2', name: 'Steelbird Full-Face Helmet', category: 'Riding Gear', brand: 'Steelbird', description: 'ISI certified, anti-scratch visor', price: 1599, mrp: 2199, stock: 7, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
  { id: 'prd_5', seller_id: 'sel_2', name: 'Rolon Chain Sprocket Kit', category: 'Spare Parts', brand: 'Rolon', description: 'For Bajaj Pulsar 150', price: 1899, mrp: 2300, stock: 3, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
  { id: 'prd_6', seller_id: 'sel_3', name: 'Amaron 35Ah Car Battery', category: 'Batteries', brand: 'Amaron', description: '55-month warranty', price: 4899, mrp: 5600, stock: 11, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
  { id: 'prd_7', seller_id: 'sel_3', name: '3M Car Shampoo 250ml', category: 'Car Care', brand: '3M', description: 'pH-balanced foam shampoo', price: 299, mrp: 349, stock: 0, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
  { id: 'prd_8', seller_id: 'sel_1', name: 'Philips Ultinon LED H4', category: 'Lighting', brand: 'Philips', description: 'Bright white headlamp pair', price: 2499, mrp: 2999, stock: 25, images: [], compatible_vehicle_type: 'both', is_active: false },
]

export const seedAmcPlans: AmcPlan[] = [
  { id: 'amc_1', name: 'Bike Care Basic', vehicle_type: 'two_wheeler', price_per_year: 1999, covered_services: ['2 periodic services', 'Free pickup & drop', '10% off parts'], visits_per_year: 2, is_active: true },
  { id: 'amc_2', name: 'Bike Care Plus', vehicle_type: 'two_wheeler', price_per_year: 3499, covered_services: ['3 periodic services', 'Free RSA (2/yr)', '15% off parts', 'Free wash every visit'], visits_per_year: 3, is_active: true },
  { id: 'amc_3', name: 'Car Care Essential', vehicle_type: 'four_wheeler', price_per_year: 6999, covered_services: ['2 basic services', 'AC check', '10% off parts'], visits_per_year: 2, is_active: true },
  { id: 'amc_4', name: 'Car Care Premium', vehicle_type: 'four_wheeler', price_per_year: 12999, covered_services: ['2 comprehensive services', 'Unlimited RSA', 'AC service', '20% off parts'], visits_per_year: 4, is_active: true },
]

export const seedAmcSubs: AmcSubscription[] = [
  { id: 'sub_1', customer_id: 'cus_1', plan_id: 'amc_3', vehicle_id: 'veh_1', start_date: ago(1200), end_date: new Date(Date.now() + 200 * 86400_000).toISOString(), status: 'active', payment_id: 'pay_101' },
  { id: 'sub_2', customer_id: 'cus_3', plan_id: 'amc_2', vehicle_id: 'veh_4', start_date: ago(400), end_date: new Date(Date.now() + 340 * 86400_000).toISOString(), status: 'active', payment_id: 'pay_102' },
]

export const seedRsa: RsaOffering[] = [
  { id: 'rsa_1', name: 'Flat Tyre Assistance', vehicle_type: 'four_wheeler', price: 499, description: 'Stepney change or puncture repair on spot', is_active: true },
  { id: 'rsa_2', name: 'Battery Jump-start', vehicle_type: 'four_wheeler', price: 599, description: 'Jump-start a discharged battery', is_active: true },
  { id: 'rsa_3', name: 'Towing (up to 10 km)', vehicle_type: 'four_wheeler', price: 1999, description: 'Flatbed towing to nearest garage', is_active: true },
  { id: 'rsa_4', name: 'Fuel Delivery (2L)', vehicle_type: 'two_wheeler', price: 299, description: 'Emergency fuel delivered to you (fuel cost extra)', is_active: true },
  { id: 'rsa_5', name: 'Bike Puncture Repair', vehicle_type: 'two_wheeler', price: 249, description: 'Tubeless / tube puncture on spot', is_active: true },
  { id: 'rsa_6', name: 'Key Lockout', vehicle_type: 'four_wheeler', price: 799, description: 'Non-destructive car unlock', is_active: false },
]

const hist = (steps: ServiceRequest['status'][], startH: number) =>
  steps.map((s, i) => ({ status: s, at: ago(startH - i * 2), by_role: (i === 0 ? 'customer' : i === 1 ? 'admin' : 'technician') as 'customer' | 'admin' | 'technician' }))

export const seedRequests: ServiceRequest[] = [
  { id: 'SR-1042', customer_id: 'cus_1', kind: 'service', vehicle_id: 'veh_1', service_id: 'svc_5', address: 'B-12, Palm Beach Rd, Sanpada, Navi Mumbai 400703', lat: 19.06, lng: 73.01, scheduled_at: ago(-20), amount: 2499, payment_status: 'paid', status: 'submitted', status_history: hist(['submitted'], 3), created_at: ago(3) },
  { id: 'SR-1041', customer_id: 'cus_2', kind: 'rsa', vehicle_id: 'veh_3', rsa_offering_id: 'rsa_1', address: 'Eastern Express Hwy, near Vikhroli', lat: 19.11, lng: 72.93, scheduled_at: ago(1), notes: 'Rear left tyre flat', amount: 499, payment_status: 'paid', technician_id: 'tec_1', status: 'in_progress', status_history: hist(['submitted', 'assigned', 'in_progress'], 5), created_at: ago(5) },
  { id: 'SR-1040', customer_id: 'cus_3', kind: 'repair', vehicle_id: 'veh_4', service_id: 'svc_4', address: '14 Linking Rd, Bandra West, Mumbai 400050', lat: 19.06, lng: 72.83, scheduled_at: ago(-4), amount: 1299, payment_status: 'paid', technician_id: 'tec_2', status: 'assigned', status_history: hist(['submitted', 'assigned'], 10), created_at: ago(10) },
  { id: 'SR-1039', customer_id: 'cus_1', kind: 'service', vehicle_id: 'veh_2', service_id: 'svc_2', address: 'B-12, Palm Beach Rd, Sanpada, Navi Mumbai 400703', lat: 19.06, lng: 73.01, scheduled_at: ago(30), amount: 699, payment_status: 'paid', technician_id: 'tec_2', status: 'completed', status_history: hist(['submitted', 'assigned', 'in_progress', 'completed'], 40), created_at: ago(40) },
  { id: 'SR-1038', customer_id: 'cus_4', kind: 'repair', vehicle_id: 'veh_5', service_id: 'svc_7', address: 'Hiranandani Estate, Thane 400607', lat: 19.25, lng: 72.97, scheduled_at: ago(-30), amount: 1899, payment_status: 'paid', status: 'submitted', status_history: hist(['submitted'], 1), created_at: ago(1) },
  { id: 'SR-1037', customer_id: 'cus_2', kind: 'service', vehicle_id: 'veh_3', service_id: 'svc_6', address: 'Vashi Sector 17, Navi Mumbai 400703', lat: 19.07, lng: 73.0, scheduled_at: ago(80), amount: 4999, payment_status: 'paid', technician_id: 'tec_1', status: 'completed', status_history: hist(['submitted', 'assigned', 'in_progress', 'completed'], 90), created_at: ago(90) },
]

const ohist = (steps: Order['status'][], startH: number) =>
  steps.map((s, i) => ({ status: s, at: ago(startH - i * 6), by_role: (i === 0 ? 'customer' : 'seller') as 'customer' | 'seller' }))

export const seedOrders: Order[] = [
  { id: 'OD-5521', customer_id: 'cus_1', items: [{ product_id: 'prd_1', seller_id: 'sel_1', qty: 1, price: 1349 }, { product_id: 'prd_2', seller_id: 'sel_1', qty: 1, price: 899 }], amount: 2248, shipping_address: 'B-12, Palm Beach Rd, Sanpada, Navi Mumbai 400703', payment_status: 'paid', status: 'placed', status_history: ohist(['placed'], 2), created_at: ago(2) },
  { id: 'OD-5520', customer_id: 'cus_3', items: [{ product_id: 'prd_3', seller_id: 'sel_2', qty: 2, price: 749 }, { product_id: 'prd_4', seller_id: 'sel_2', qty: 1, price: 1599 }], amount: 3097, shipping_address: '14 Linking Rd, Bandra West, Mumbai 400050', payment_status: 'paid', status: 'in_transit', status_history: ohist(['placed', 'dispatched', 'in_transit'], 30), tracking: { courier: 'Delhivery', awb: 'DLV8823411' }, created_at: ago(30) },
  { id: 'OD-5519', customer_id: 'cus_4', items: [{ product_id: 'prd_6', seller_id: 'sel_3', qty: 1, price: 4899 }], amount: 4899, shipping_address: 'Hiranandani Estate, Thane 400607', payment_status: 'paid', status: 'dispatched', status_history: ohist(['placed', 'dispatched'], 20), tracking: { courier: 'Blue Dart', awb: 'BD55120934' }, created_at: ago(20) },
  { id: 'OD-5518', customer_id: 'cus_2', items: [{ product_id: 'prd_3', seller_id: 'sel_2', qty: 1, price: 749 }], amount: 749, shipping_address: 'Vashi Sector 17, Navi Mumbai 400703', payment_status: 'paid', status: 'delivered', status_history: ohist(['placed', 'dispatched', 'in_transit', 'delivered'], 120), tracking: { courier: 'Delhivery', awb: 'DLV8811200' }, created_at: ago(120) },
]

export const seedSettings: PlatformSettings = {
  commission_percent: 12, tax_percent: 18, support_phone: '+91 95554 10584', support_email: 'support@rapidmechanic.in',
  default_service_radius_km: 10, rsa_enabled: true, marketplace_enabled: true,
}

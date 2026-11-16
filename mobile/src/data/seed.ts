// Realistic Indian mock data. When Supabase is connected this file is only
// used for local demos / storybook — the services read from the database instead.
import type {
  AmcPlan,
  AmcSubscription,
  Order,
  Payment,
  PlatformSettings,
  Product,
  Profile,
  RsaOffering,
  Seller,
  Service,
  ServiceRequest,
  Technician,
  Vehicle,
} from '@/types';

export const DEMO_CUSTOMER_ID = 'cust_demo';
export const DEMO_PHONE = '9876543210';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400_000).toISOString();

export interface MockDb {
  profiles: Profile[];
  vehicles: Vehicle[];
  services: Service[];
  technicians: Technician[];
  sellers: Seller[];
  amc_plans: AmcPlan[];
  amc_subscriptions: AmcSubscription[];
  rsa_offerings: RsaOffering[];
  service_requests: ServiceRequest[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  platform_settings: PlatformSettings;
}

export function createSeed(): MockDb {
  const profiles: Profile[] = [
    {
      id: DEMO_CUSTOMER_ID,
      role: 'customer',
      full_name: 'Aarav Sharma',
      phone: DEMO_PHONE,
      email: 'aarav.sharma@example.in',
      avatar_url: null,
      created_at: hoursAgo(24 * 60),
    },
    { id: 'tech_1', role: 'technician', full_name: 'Ramesh Kumar', phone: '9811122233', email: 'ramesh@speedfix.in', avatar_url: null, created_at: hoursAgo(24 * 200) },
    { id: 'tech_2', role: 'technician', full_name: 'Suresh Patil', phone: '9822233344', email: 'suresh@patilauto.in', avatar_url: null, created_at: hoursAgo(24 * 180) },
    { id: 'tech_3', role: 'technician', full_name: 'Imran Shaikh', phone: '9833344455', email: 'imran@roadstar.in', avatar_url: null, created_at: hoursAgo(24 * 150) },
    { id: 'tech_4', role: 'technician', full_name: 'Venkatesh Rao', phone: '9844455566', email: 'venkat@carcare.in', avatar_url: null, created_at: hoursAgo(24 * 120) },
    { id: 'sel_1', role: 'seller', full_name: 'Neha Gupta', phone: '9900011122', email: 'store@motoparts.in', avatar_url: null, created_at: hoursAgo(24 * 300) },
    { id: 'sel_2', role: 'seller', full_name: 'Rohit Mehta', phone: '9900022233', email: 'store@autozone.in', avatar_url: null, created_at: hoursAgo(24 * 250) },
    { id: 'sel_3', role: 'seller', full_name: 'Kavya Iyer', phone: '9900033344', email: 'store@tyrehub.in', avatar_url: null, created_at: hoursAgo(24 * 220) },
    { id: 'sel_4', role: 'seller', full_name: 'Harpreet Singh', phone: '9900044455', email: 'store@ridergear.in', avatar_url: null, created_at: hoursAgo(24 * 210) },
  ];

  const vehicles: Vehicle[] = [
    { id: 'veh_1', customer_id: DEMO_CUSTOMER_ID, type: 'two_wheeler', make: 'Honda', model: 'Activa 6G', year: 2022, reg_number: 'MH 12 AB 4521', fuel: 'petrol' },
    { id: 'veh_2', customer_id: DEMO_CUSTOMER_ID, type: 'four_wheeler', make: 'Maruti Suzuki', model: 'Swift VXi', year: 2020, reg_number: 'MH 14 CD 7788', fuel: 'petrol' },
    { id: 'veh_3', customer_id: DEMO_CUSTOMER_ID, type: 'two_wheeler', make: 'Royal Enfield', model: 'Classic 350', year: 2023, reg_number: 'MH 12 EF 0350', fuel: 'petrol' },
  ];

  const services: Service[] = [
    // Two-wheeler — service
    { id: 'svc_2w_general', vehicle_type: 'two_wheeler', category: 'service', name: 'General Service', description: 'Engine oil change, oil filter clean, chain lube & adjustment, brake check, 20-point inspection and wash.', base_price: 899, duration_mins: 120, is_active: true },
    { id: 'svc_2w_oil', vehicle_type: 'two_wheeler', category: 'service', name: 'Engine Oil Change', description: 'Drain and refill with manufacturer-recommended engine oil (up to 1.2 L).', base_price: 449, duration_mins: 30, is_active: true },
    { id: 'svc_2w_wash', vehicle_type: 'two_wheeler', category: 'service', name: 'Foam Wash & Polish', description: 'Doorstep foam wash, wax polish and tyre dressing.', base_price: 299, duration_mins: 45, is_active: true },
    // Two-wheeler — repair
    { id: 'svc_2w_brake', vehicle_type: 'two_wheeler', category: 'repair', name: 'Brake Pad / Shoe Replacement', description: 'Inspection and replacement of worn brake pads or shoes (parts billed extra).', base_price: 349, duration_mins: 45, is_active: true },
    { id: 'svc_2w_battery', vehicle_type: 'two_wheeler', category: 'repair', name: 'Battery Check & Replacement', description: 'Battery health test, terminal cleaning and replacement if required.', base_price: 249, duration_mins: 30, is_active: true },
    { id: 'svc_2w_clutch', vehicle_type: 'two_wheeler', category: 'repair', name: 'Clutch Plate Repair', description: 'Clutch cable adjustment or plate replacement for geared bikes.', base_price: 799, duration_mins: 90, is_active: true },
    { id: 'svc_2w_electrical', vehicle_type: 'two_wheeler', category: 'repair', name: 'Electrical & Wiring', description: 'Headlamp, indicator, horn and self-start diagnostics and repair.', base_price: 399, duration_mins: 60, is_active: true },
    // Four-wheeler — service
    { id: 'svc_4w_basic', vehicle_type: 'four_wheeler', category: 'service', name: 'Basic Car Service', description: 'Engine oil & oil filter replacement, air filter clean, coolant top-up, 30-point check.', base_price: 2499, duration_mins: 180, is_active: true },
    { id: 'svc_4w_comprehensive', vehicle_type: 'four_wheeler', category: 'service', name: 'Comprehensive Service', description: 'Everything in Basic plus spark plugs, cabin filter, brake cleaning, wheel alignment check.', base_price: 4999, duration_mins: 300, is_active: true },
    { id: 'svc_4w_ac', vehicle_type: 'four_wheeler', category: 'service', name: 'AC Service', description: 'AC gas top-up, condenser cleaning, cooling coil check and cabin filter clean.', base_price: 1599, duration_mins: 120, is_active: true },
    { id: 'svc_4w_spa', vehicle_type: 'four_wheeler', category: 'service', name: 'Interior & Exterior Car Spa', description: 'Foam wash, vacuum, dashboard polish and wax.', base_price: 999, duration_mins: 120, is_active: true },
    // Four-wheeler — repair
    { id: 'svc_4w_brake', vehicle_type: 'four_wheeler', category: 'repair', name: 'Brake Pad Replacement', description: 'Front brake pad replacement with disc inspection (parts billed extra).', base_price: 999, duration_mins: 90, is_active: true },
    { id: 'svc_4w_battery', vehicle_type: 'four_wheeler', category: 'repair', name: 'Battery Replacement', description: 'Battery diagnostics and fitment of a new battery (battery billed extra).', base_price: 499, duration_mins: 45, is_active: true },
    { id: 'svc_4w_suspension', vehicle_type: 'four_wheeler', category: 'repair', name: 'Suspension Repair', description: 'Shock absorber, strut and bush inspection and repair.', base_price: 1899, duration_mins: 180, is_active: true },
    { id: 'svc_4w_dent', vehicle_type: 'four_wheeler', category: 'repair', name: 'Dent & Paint (per panel)', description: 'Minor dent removal and paint touch-up per panel.', base_price: 2199, duration_mins: 240, is_active: true },
  ];

  const allIds = services.map((s) => s.id);
  const twoW = services.filter((s) => s.vehicle_type === 'two_wheeler').map((s) => s.id);
  const fourW = services.filter((s) => s.vehicle_type === 'four_wheeler').map((s) => s.id);

  const technicians: Technician[] = [
    { id: 'tech_1', business_name: 'SpeedFix Two Wheelers', rating: 4.7, experience_years: 9, verified: true, is_active: true, service_ids: twoW, service_areas: [{ pincode: '411001', city: 'Pune', radius_km: 10 }] },
    { id: 'tech_2', business_name: 'Patil Auto Works', rating: 4.5, experience_years: 14, verified: true, is_active: true, service_ids: allIds, service_areas: [{ pincode: '411038', city: 'Pune', radius_km: 12 }] },
    { id: 'tech_3', business_name: 'RoadStar Assistance', rating: 4.8, experience_years: 7, verified: true, is_active: true, service_ids: allIds, service_areas: [{ pincode: '400050', city: 'Mumbai', radius_km: 15 }] },
    { id: 'tech_4', business_name: 'CarCare Garage', rating: 4.6, experience_years: 11, verified: true, is_active: true, service_ids: fourW, service_areas: [{ pincode: '560034', city: 'Bengaluru', radius_km: 10 }] },
  ];

  const sellers: Seller[] = [
    { id: 'sel_1', store_name: 'MotoParts India', gstin: '27AABCM1234F1Z5', rating: 4.6, verified: true, is_active: true },
    { id: 'sel_2', store_name: 'AutoZone Spares', gstin: '07AAECA5678K1Z2', rating: 4.4, verified: true, is_active: true },
    { id: 'sel_3', store_name: 'TyreHub', gstin: '29AAFCT9012L1Z8', rating: 4.5, verified: true, is_active: true },
    { id: 'sel_4', store_name: 'RiderGear Co.', gstin: '03AAGCR3456M1Z1', rating: 4.3, verified: true, is_active: true },
  ];

  const amc_plans: AmcPlan[] = [
    { id: 'amc_2w_basic', name: 'Two-wheeler Care Basic', vehicle_type: 'two_wheeler', price_per_year: 1999, covered_services: ['2 General services', 'Unlimited chain lube', 'Free pick-up & drop', '10% off on parts'], visits_per_year: 2, is_active: true },
    { id: 'amc_2w_plus', name: 'Two-wheeler Care Plus', vehicle_type: 'two_wheeler', price_per_year: 3499, covered_services: ['3 General services', '2 Foam washes', 'Roadside assistance (2 call-outs)', 'Free battery check', '15% off on parts'], visits_per_year: 3, is_active: true },
    { id: 'amc_2w_premium', name: 'Two-wheeler Care Premium', vehicle_type: 'two_wheeler', price_per_year: 4999, covered_services: ['4 General services', 'Unlimited roadside assistance', '4 Foam washes', 'Brake pad labour free', '20% off on parts'], visits_per_year: 4, is_active: true },
    { id: 'amc_4w_basic', name: 'Car Care Basic', vehicle_type: 'four_wheeler', price_per_year: 5999, covered_services: ['2 Basic car services', '1 AC check-up', 'Free pick-up & drop', '10% off on parts'], visits_per_year: 2, is_active: true },
    { id: 'amc_4w_plus', name: 'Car Care Plus', vehicle_type: 'four_wheeler', price_per_year: 9999, covered_services: ['1 Comprehensive + 1 Basic service', '1 AC service', '2 Car spas', 'Roadside assistance (3 call-outs)', '15% off on parts'], visits_per_year: 3, is_active: true },
    { id: 'amc_4w_premium', name: 'Car Care Premium', vehicle_type: 'four_wheeler', price_per_year: 14999, covered_services: ['2 Comprehensive services', '2 AC services', '4 Car spas', 'Unlimited roadside assistance', 'Wheel alignment & balancing', '20% off on parts'], visits_per_year: 4, is_active: true },
  ];

  const rsa_offerings: RsaOffering[] = [
    { id: 'rsa_2w_tyre', name: 'Flat tyre / puncture', vehicle_type: 'two_wheeler', price: 299, is_active: true },
    { id: 'rsa_2w_battery', name: 'Battery jump-start', vehicle_type: 'two_wheeler', price: 349, is_active: true },
    { id: 'rsa_2w_tow', name: 'Towing to nearest garage', vehicle_type: 'two_wheeler', price: 799, is_active: true },
    { id: 'rsa_2w_fuel', name: 'Fuel delivery (up to 2 L)', vehicle_type: 'two_wheeler', price: 249, is_active: true },
    { id: 'rsa_2w_lock', name: 'Key lockout', vehicle_type: 'two_wheeler', price: 399, is_active: true },
    { id: 'rsa_4w_tyre', name: 'Flat tyre / spare change', vehicle_type: 'four_wheeler', price: 499, is_active: true },
    { id: 'rsa_4w_battery', name: 'Battery jump-start', vehicle_type: 'four_wheeler', price: 599, is_active: true },
    { id: 'rsa_4w_tow', name: 'Towing (up to 25 km)', vehicle_type: 'four_wheeler', price: 1999, is_active: true },
    { id: 'rsa_4w_fuel', name: 'Fuel delivery (up to 5 L)', vehicle_type: 'four_wheeler', price: 449, is_active: true },
    { id: 'rsa_4w_lock', name: 'Car lockout', vehicle_type: 'four_wheeler', price: 799, is_active: true },
  ];

  const products: Product[] = [
    { id: 'prd_1', seller_id: 'sel_1', name: 'Castrol Power1 4T 10W-30 Engine Oil (1 L)', category: 'Oils & Fluids', brand: 'Castrol', description: 'Fully synthetic-technology 4-stroke engine oil for scooters and commuter bikes.', price: 399, mrp: 460, stock: 120, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
    { id: 'prd_2', seller_id: 'sel_2', name: 'Mobil Super 5W-30 Car Engine Oil (3.5 L)', category: 'Oils & Fluids', brand: 'Mobil', description: 'Semi-synthetic engine oil for petrol cars like Swift, i20 and Baleno.', price: 1849, mrp: 2150, stock: 60, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
    { id: 'prd_3', seller_id: 'sel_1', name: 'Bosch Brake Pad Set — Honda Activa', category: 'Brakes', brand: 'Bosch', description: 'OE-quality brake shoes for Honda Activa 5G/6G and Dio.', price: 289, mrp: 350, stock: 85, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
    { id: 'prd_4', seller_id: 'sel_2', name: 'Brembo Front Brake Pads — Hyundai Creta', category: 'Brakes', brand: 'Brembo', description: 'Low-dust ceramic front brake pads for Hyundai Creta (2015–2023).', price: 2499, mrp: 2999, stock: 25, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
    { id: 'prd_5', seller_id: 'sel_3', name: 'MRF Zapper 90/90-12 Tubeless Tyre', category: 'Tyres', brand: 'MRF', description: 'Front/rear tubeless tyre for scooters like Activa, Jupiter and Access.', price: 1450, mrp: 1650, stock: 40, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
    { id: 'prd_6', seller_id: 'sel_3', name: 'Apollo Amazer 4G Life 185/65 R15', category: 'Tyres', brand: 'Apollo', description: 'Long-life tubeless car tyre for Swift Dzire, Baleno, i20.', price: 4299, mrp: 4890, stock: 32, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
    { id: 'prd_7', seller_id: 'sel_2', name: 'Exide Mileage 35Ah Car Battery', category: 'Batteries', brand: 'Exide', description: 'Maintenance-free battery with 55 months warranty. Fits Maruti Swift, WagonR.', price: 4599, mrp: 5299, stock: 18, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
    { id: 'prd_8', seller_id: 'sel_1', name: 'Amaron Pro Bike Rider 5Ah Battery', category: 'Batteries', brand: 'Amaron', description: 'Zero-maintenance 2W battery for Activa, Splendor, Pulsar.', price: 1249, mrp: 1450, stock: 50, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
    { id: 'prd_9', seller_id: 'sel_4', name: 'Steelbird SBA-1 Full Face Helmet (M)', category: 'Accessories', brand: 'Steelbird', description: 'ISI-certified full face helmet with clear visor.', price: 1199, mrp: 1599, stock: 70, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
    { id: 'prd_10', seller_id: 'sel_4', name: 'Royal Enfield Classic 350 Crash Guard', category: 'Accessories', brand: 'RiderGear', description: 'Powder-coated steel engine guard for Classic 350 (2021+).', price: 2299, mrp: 2799, stock: 15, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
    { id: 'prd_11', seller_id: 'sel_2', name: '3M Car Microfibre Cloth (Pack of 3)', category: 'Car Care', brand: '3M', description: 'Lint-free 350 GSM microfibre cloths for wash and polish.', price: 349, mrp: 499, stock: 200, images: [], compatible_vehicle_type: 'both', is_active: true },
    { id: 'prd_12', seller_id: 'sel_1', name: 'Bosch Air Filter — Maruti Swift', category: 'Filters', brand: 'Bosch', description: 'Engine air filter for Maruti Swift / Dzire petrol (2018+).', price: 449, mrp: 560, stock: 45, images: [], compatible_vehicle_type: 'four_wheeler', is_active: true },
    { id: 'prd_13', seller_id: 'sel_4', name: 'Motul Chain Lube C2 (150 ml)', category: 'Oils & Fluids', brand: 'Motul', description: 'Road chain lubricant for all motorcycles with O/X-ring chains.', price: 349, mrp: 399, stock: 90, images: [], compatible_vehicle_type: 'two_wheeler', is_active: true },
    { id: 'prd_14', seller_id: 'sel_3', name: 'Michelin Digital Tyre Inflator', category: 'Car Care', brand: 'Michelin', description: '12V portable tyre inflator with auto cut-off and LED light.', price: 3199, mrp: 4299, stock: 22, images: [], compatible_vehicle_type: 'both', is_active: true },
  ];

  const service_requests: ServiceRequest[] = [
    {
      id: 'sr_demo1',
      customer_id: DEMO_CUSTOMER_ID,
      kind: 'service',
      vehicle_id: 'veh_2',
      service_id: 'svc_4w_basic',
      rsa_offering_id: null,
      address: 'Flat 302, Sai Residency, Baner Road, Pune 411045',
      lat: 18.559,
      lng: 73.7868,
      scheduled_at: daysFromNow(1),
      notes: 'Please call before arriving.',
      amount: 2499,
      payment_status: 'paid',
      technician_id: 'tech_2',
      status: 'assigned',
      status_history: [
        { status: 'submitted', at: hoursAgo(20), by_role: 'customer', note: 'Request placed from app' },
        { status: 'assigned', at: hoursAgo(18), by_role: 'admin', note: 'Assigned to Patil Auto Works' },
      ],
      created_at: hoursAgo(20),
    },
    {
      id: 'sr_demo2',
      customer_id: DEMO_CUSTOMER_ID,
      kind: 'service',
      vehicle_id: 'veh_1',
      service_id: 'svc_2w_general',
      rsa_offering_id: null,
      address: 'Flat 302, Sai Residency, Baner Road, Pune 411045',
      lat: 18.559,
      lng: 73.7868,
      scheduled_at: hoursAgo(24 * 30),
      notes: '',
      amount: 899,
      payment_status: 'paid',
      technician_id: 'tech_1',
      status: 'completed',
      status_history: [
        { status: 'submitted', at: hoursAgo(24 * 31), by_role: 'customer', note: 'Request placed from app' },
        { status: 'assigned', at: hoursAgo(24 * 31 - 2), by_role: 'admin', note: 'Assigned to SpeedFix Two Wheelers' },
        { status: 'in_progress', at: hoursAgo(24 * 30), by_role: 'technician', note: 'Technician started work' },
        { status: 'completed', at: hoursAgo(24 * 30 - 2), by_role: 'technician', note: 'Service completed' },
      ],
      created_at: hoursAgo(24 * 31),
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord_demo1',
      customer_id: DEMO_CUSTOMER_ID,
      items: [
        { product_id: 'prd_1', seller_id: 'sel_1', qty: 2, price: 399 },
        { product_id: 'prd_13', seller_id: 'sel_4', qty: 1, price: 349 },
      ],
      amount: 1147,
      shipping_address: 'Flat 302, Sai Residency, Baner Road, Pune 411045',
      payment_status: 'paid',
      status: 'dispatched',
      status_history: [
        { status: 'placed', at: hoursAgo(30), by_role: 'customer', note: 'Order placed' },
        { status: 'dispatched', at: hoursAgo(6), by_role: 'seller', note: 'Handed over to Delhivery' },
      ],
      tracking: { courier: 'Delhivery', awb: 'DLV8812345601', url: 'https://www.delhivery.com/track/package/DLV8812345601' },
      created_at: hoursAgo(30),
    },
  ];

  const amc_subscriptions: AmcSubscription[] = [
    {
      id: 'amcs_demo1',
      customer_id: DEMO_CUSTOMER_ID,
      plan_id: 'amc_2w_plus',
      vehicle_id: 'veh_3',
      start_date: hoursAgo(24 * 90),
      end_date: daysFromNow(275),
      status: 'active',
      payment_id: 'pay_demo3',
    },
  ];

  const payments: Payment[] = [
    { id: 'pay_demo1', ref_type: 'service_request', ref_id: 'sr_demo1', amount: 2499, gateway: 'mock', gateway_ref: 'mock_txn_1001', status: 'paid', created_at: hoursAgo(20) },
    { id: 'pay_demo2', ref_type: 'order', ref_id: 'ord_demo1', amount: 1147, gateway: 'mock', gateway_ref: 'mock_txn_1002', status: 'paid', created_at: hoursAgo(30) },
    { id: 'pay_demo3', ref_type: 'amc', ref_id: 'amcs_demo1', amount: 3499, gateway: 'mock', gateway_ref: 'mock_txn_1003', status: 'paid', created_at: hoursAgo(24 * 90) },
  ];

  return {
    profiles,
    vehicles,
    services,
    technicians,
    sellers,
    amc_plans,
    amc_subscriptions,
    rsa_offerings,
    service_requests,
    products,
    orders,
    payments,
    platform_settings: {
      commission_percent: 12,
      tax_percent: 18,
      support_phone: '1800-120-7272',
      support_email: 'support@rapidmechanic.in',
      service_radius_km: 10,
      free_shipping_above: 499,
      shipping_fee: 49,
    },
  };
}

/** Product category list used for the catalog chips. */
export const PRODUCT_CATEGORIES = ['All', 'Oils & Fluids', 'Brakes', 'Tyres', 'Batteries', 'Filters', 'Accessories', 'Car Care'];

/** Popular makes/models for the add-vehicle form. */
export const VEHICLE_MAKES: Record<'two_wheeler' | 'four_wheeler', string[]> = {
  two_wheeler: ['Honda', 'Hero', 'TVS', 'Bajaj', 'Royal Enfield', 'Suzuki', 'Yamaha', 'Ather', 'Ola Electric'],
  four_wheeler: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'MG'],
};

// Single import point for the data-access layer.
// Every function is async so the mock implementation can be swapped for Supabase
// without touching screens.
export * as authService from './auth';
export * as profileService from './profile';
export * as vehicleService from './vehicles';
export * as catalogService from './catalog';
export * as requestService from './requests';
export * as amcService from './amc';
export * as productService from './products';
export * as cartService from './cart';
export * as orderService from './orders';
export * as paymentService from './payments';

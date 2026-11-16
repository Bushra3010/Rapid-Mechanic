# Rapid Mechanic — Shared Domain Model (frontend contract)

Source of scope: `NEXTB_Vehicle_Services_and_Marketplace_Quotation.pdf` (11 Nov 2026).
Both front ends (`mobile/` customer app and `web/` panels) use these entity shapes in their
mock data layer. When Supabase is connected, each entity becomes a table with the same
snake_case column names, so only the data-access layer changes.

## Brand
- Navy `#143C5F` (primary), Orange `#E36010` (accent), Orange light `#F28A25`
- Logo: `1790315266808.png` (copied into each app's assets as `logo.png`)

## Roles
`customer` (mobile app) · `admin` · `seller` · `technician` (web panels)

## Entities

| Entity | Key fields |
|---|---|
| `profiles` | id, role, full_name, phone, email, avatar_url, created_at |
| `vehicles` | id, customer_id, type (`two_wheeler` \| `four_wheeler`), make, model, year, reg_number, fuel |
| `services` (listings) | id, vehicle_type, category (`service` \| `repair`), name, description, base_price, duration_mins, is_active |
| `technicians` | id (=profile id), business_name, rating, experience_years, verified, is_active, service_ids[], service_areas[] (pincode/city + radius_km) |
| `sellers` | id (=profile id), store_name, gstin, rating, verified, is_active |
| `amc_plans` | id, name, vehicle_type, price_per_year, covered_services[], visits_per_year, is_active |
| `amc_subscriptions` | id, customer_id, plan_id, vehicle_id, start_date, end_date, status (`active` \| `expired` \| `cancelled`), payment_id |
| `rsa_offerings` | id, name (e.g. Flat tyre, Battery jump-start, Towing, Fuel delivery, Lockout), vehicle_type, price, is_active |
| `service_requests` | id, customer_id, kind (`service` \| `repair` \| `rsa`), vehicle_id, service_id \| rsa_offering_id, address, lat, lng, scheduled_at, notes, amount, payment_status, technician_id, status, status_history[] |
| `products` | id, seller_id, name, category, brand, description, price, mrp, stock, images[], compatible_vehicle_type, is_active |
| `orders` | id, customer_id, items[{product_id, seller_id, qty, price}], amount, shipping_address, payment_status, status, status_history[], tracking {courier, awb, url} |
| `payments` | id, ref_type (`service_request` \| `amc` \| `order`), ref_id, amount, gateway, gateway_ref, status (`pending` \| `paid` \| `failed` \| `refunded`) |
| `platform_settings` | key/value (commission %, tax %, support phone/email, service radius default) |

## Status flows (from the quotation)

Service / repair / RSA job:
`submitted` → `assigned` → `in_progress` → `completed` (plus `cancelled`)

Displayed as: Request submitted › Job assigned › Work in progress › Job completed

Product order:
`placed` → `dispatched` → `in_transit` → `delivered` (plus `cancelled`)

Displayed as: Order placed › Dispatched › In transit › Delivered

Every status change appends `{status, at, by_role, note}` to `status_history`.

## Integrations (stubbed in the front end for now)
- Google Maps: address / RSA pin picking (placeholder map UI until API key is provided)
- Payment gateway: single gateway for service, RSA, AMC and product payments (mock "Pay" step)
- Delivery tracking: order updates from fulfilment team / courier (manual status updates for now)

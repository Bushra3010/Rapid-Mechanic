# Rapid Mechanic — Customer App (Android + iOS)

Front-end only. Vehicle services, roadside assistance (RSA), yearly AMC plans and a multi-seller
parts marketplace. All data comes from a **local mock data layer** (zustand + AsyncStorage) that
follows `../docs/DOMAIN_MODEL.md` exactly, so it can be swapped for Supabase later.

## Stack

| | |
|---|---|
| Expo SDK 58 (React Native 0.88, React 19.3) | managed workflow, no `ios/` / `android/` folders |
| expo-router 58 | file-based navigation in `src/app/` |
| TypeScript 6 (strict) | |
| zustand 5 + `@react-native-async-storage/async-storage` | mock DB, session and cart, persisted on device |
| `@expo/vector-icons` (Ionicons) | icons |
| expo-location | optional "Use current location" (falls back to a demo location) |
| react-native-web + react-dom | browser preview |

## Run it

```bash
cd mobile
npm install
npx expo start          # scan the QR code with Expo Go (Android) or the Camera app (iOS)
npx expo start --web    # or press "w": preview in a browser
```

Every native module used is bundled in **Expo Go**, so no development build is needed yet.

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src
npm run build:web   # static web export to dist/
EXPO_PUBLIC_DEMO_MODE=1 npx expo export --platform web   # web export WITH the demo tools visible
```

### Demo tips
- **Login:** any 10-digit number, then any 4–6 digit OTP. Tap the blue hint on the login screen to use
  the demo customer **98765 43210**, which has seeded vehicles, an active booking, an order and an AMC plan.
  A new number creates a fresh customer and asks for their name.
- **Simulate next update (dev):** on every tracking screen, pushes the job
  (`submitted → assigned → in_progress → completed`) or order
  (`placed → dispatched → in_transit → delivered`) to the next status, appending to `status_history`.
  On `assigned` a matching technician is attached; on `dispatched` a courier + AWB is attached.
  Shown in dev builds, or when `EXPO_PUBLIC_DEMO_MODE=1`.
- **Profile → Reset demo data (dev)** restores the seed.

## Project layout

```
mobile/
├── app.json                 # name, icon/splash = assets/logo.png, bundle ids, location permission text
├── assets/logo.png          # brand logo (app icon, splash, login, headers)
└── src/
    ├── app/                 # screens (expo-router)
    │   ├── _layout.tsx      # root stack, splash-screen hide after store hydration
    │   ├── index.tsx        # splash → onboarding / login / tabs
    │   ├── onboarding.tsx   # 3-slide intro
    │   ├── login.tsx        # phone + mock OTP
    │   ├── (tabs)/          # bottom tabs
    │   │   ├── index.tsx    #   Home: greeting, RSA SOS card, tiles, AMC banner, in-progress cards
    │   │   ├── services.tsx #   My service requests (service / repair / RSA) with filters
    │   │   ├── products.tsx #   catalog: search, category chips, 2-col product grid
    │   │   ├── orders.tsx   #   cart banner + my orders
    │   │   └── profile.tsx  #   profile, vehicles, requests, orders, AMC, support, logout
    │   ├── book/[type].tsx  # service & repair listings by vehicle_type (two_wheeler | four_wheeler)
    │   ├── book/details.tsx # vehicle → MapPicker address → date/slot → notes
    │   ├── book/review.tsx  # review & pay → service_request(status=submitted) → tracking
    │   ├── amc/index.tsx    # AMC plans per vehicle type
    │   ├── amc/[id].tsx     # plan detail, choose vehicle, pay → amc_subscription(active)
    │   ├── rsa/index.tsx    # roadside: vehicle, MapPicker, issue (rsa_offerings), notes, pay
    │   ├── product/[id].tsx # product detail, seller card, qty, add to cart
    │   ├── cart.tsx         # cart with qty steppers and bill
    │   ├── checkout.tsx     # address + pincode + pay → order(status=placed)
    │   ├── track/request/[id].tsx  # job / RSA tracking: timeline + technician card
    │   ├── track/order/[id].tsx    # order tracking: timeline + courier/AWB
    │   ├── vehicles/index.tsx      # my vehicles (edit / delete)
    │   ├── vehicles/edit.tsx       # add / edit vehicle
    │   ├── profile/edit.tsx        # edit profile (also first-login "complete your profile")
    │   └── profile/amc.tsx         # my AMC plans
    ├── components/          # Button, Card, Screen, Header, Chip, PriceText, StatusBadge, Timeline,
    │                        # EmptyState, MapPicker, PaymentSheet, TextField, SlotPicker,
    │                        # VehicleSelector, TechnicianCard, ProductCard, QtyStepper, ...
    ├── services/            # ⬅ the ONLY data-access layer (async functions)
    ├── store/useStore.ts    # zustand mock DB + session + cart (persisted)
    ├── data/seed.ts         # Indian mock data (₹, Pune/Mumbai/Bengaluru, Activa, Classic 350, Swift, Creta…)
    ├── hooks/useQuery.ts    # runs a service fn and re-runs on store changes (stand-in for realtime)
    ├── types.ts             # entity types = DOMAIN_MODEL.md (snake_case)
    ├── theme.ts             # colors (navy #143C5F, orange #E36010, #F28A25), spacing, radius, typography
    └── utils/               # ₹ formatting (en-IN), dates, status labels, nav helper
```

## Where to plug in the real backend

### Supabase
Screens never touch the store directly — they call `src/services/*` (every function is `async`).
To connect Supabase:

1. `npx expo install @supabase/supabase-js react-native-url-polyfill` and create
   `src/services/supabase.ts` with `createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, { auth: { storage: AsyncStorage, persistSession: true } })`.
2. Replace each service body; every file has a `TODO(supabase)` comment:
   - `auth.ts` → `supabase.auth.signInWithOtp({ phone })` / `verifyOtp({ phone, token, type: 'sms' })`
     (configure an SMS provider, e.g. Twilio/MSG91, in Supabase Auth).
   - `profile.ts`, `vehicles.ts`, `catalog.ts`, `amc.ts`, `products.ts`, `requests.ts`, `orders.ts` →
     `supabase.from('<table>')` with the same snake_case columns. Use RLS `customer_id = auth.uid()`.
   - Status changes (`simulateNextStatus`, `simulateNextOrderStatus`) are dev-only — in production they
     come from the admin / technician / seller panels.
3. In `src/hooks/useQuery.ts`, replace the zustand subscription with
   `supabase.channel(...).on('postgres_changes', …)` so tracking screens update live.
4. `cart.ts` can stay local. `src/store/useStore.ts` then only needs `session` + `cart`.
5. `services/_client.ts#currentUserId()` → `(await supabase.auth.getUser()).data.user.id`.

### Google Maps
`src/components/MapPicker.tsx` is a styled placeholder (tap to move the pin, "Use current location"
via expo-location with a demo fallback). Keep its `value` / `onChange({ address, lat, lng })` contract and:
1. `npx expo install react-native-maps` and render `<MapView provider={PROVIDER_GOOGLE}>` with a draggable `<Marker>`.
2. Add keys in `app.json`: `ios.config.googleMapsApiKey` and `android.config.googleMaps.apiKey`
   (requires a development build — Expo Go uses its own key on Android only).
3. Use Places Autocomplete + Geocoding API for the address field. On web, use the Maps JS API.

### Payment gateway
`src/components/PaymentSheet.tsx` shows the mock sheet and calls
`paymentService.chargeMock()` in `src/services/payments.ts`. Replace that with the real gateway
(Razorpay / Cashfree / PhonePe PG):
1. Create the gateway order server-side (Supabase Edge Function) for the amount.
2. Open the gateway's checkout SDK (needs a development build) and get the payment reference.
3. Verify the signature server-side, then insert into `payments` with `status = 'paid'`.

The sheet's contract — `onPaid(GatewayResult) → create the entity` — and every `create*` service
(`createServiceRequest`, `subscribeToPlan`, `placeOrder`) already take a `GatewayResult`
(`{ gateway, gateway_ref }`) and write the `payments` row (`ref_type` = `service_request` | `amc` | `order`).

## Notes
- Currency is always formatted with `formatINR()` (₹ + `en-IN` grouping, e.g. ₹1,25,000).
- Service prices are shown GST-inclusive (18% from `platform_settings.tax_percent`); product orders get free
  delivery above ₹499, else ₹49.
- Product images are category-icon placeholders until `products.images[]` holds Supabase Storage URLs.

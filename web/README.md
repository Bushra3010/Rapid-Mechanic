# Rapid Mechanic — Web Panels (Admin · Seller · Technician)

Vite + React 19 + TypeScript + Tailwind CSS 3 + React Router 7 + Zustand.

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

Requires Node 20.18+ (Vite is pinned to v6 for this Node version).

## Demo login
Pick a panel on the sign-in page; any password with 4+ characters works.

| Panel | Demo email | What it covers (from the quotation) |
|---|---|---|
| Platform admin | admin@rapidmechanic.in | Sellers, technicians, service listings, AMC plans, RSA offerings, requests, product listings, orders, customers, platform settings |
| Seller | vikram@autoparts.in | Own product listings (create/edit), inventory, incoming orders, fulfilment status |
| Technician | imran@rapidmech.in | Profile, offered services, service areas, status of assigned service/repair/RSA jobs |

Data is mock data stored in the browser (localStorage). *Platform settings → Reset demo data* restores the sample set.

## Structure
```
src/
  types.ts              entity types — mirror docs/DOMAIN_MODEL.md / future Supabase tables
  data/seed.ts          sample data
  store/useStore.ts     local mock DB (zustand, persisted)
  services/api.ts       ALL writes + auth go through here  ← swap for Supabase
  components/           ui.tsx (design system), CrudPage.tsx, details.tsx (job/order detail + timelines)
  layouts/PanelLayout   role-guarded sidebar layout
  pages/admin|seller|technician
```

## Connecting Supabase (next step)
1. `npm i @supabase/supabase-js`, add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to `.env.local`.
2. Replace function bodies in `src/services/api.ts` (`signIn`, `save`, `destroy`, `updateJobStatus`, `assignTechnician`, `updateOrderStatus`, `saveSettings`).
3. Replace store reads with queries (or hydrate the store from Supabase + realtime subscriptions) — pages read via `useStore`.
4. Row-level security: sellers only see their products/order items, technicians only their jobs.

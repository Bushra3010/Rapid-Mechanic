# Rapid Mechanic — Vehicle Services & Marketplace

Built from `NEXTB_Vehicle_Services_and_Marketplace_Quotation.pdf`.

## Live demo (GitHub Pages)
- Web panels (admin / seller / technician): https://bushra3010.github.io/Rapid-Mechanic/
- Customer app, browser preview: https://bushra3010.github.io/Rapid-Mechanic/app/

Every push to `main` redeploys via `.github/workflows/deploy-pages.yml`. Demo data lives in each visitor's browser.

| Folder | What | Stack |
|---|---|---|
| `mobile/` | Customer app (Android + iOS): 2W/4W service & repair, yearly AMC, roadside assistance, products marketplace, profile & tracking | Expo / React Native |
| `web/` | Web panels: platform admin, seller, technician | Vite + React + Tailwind |
| `docs/DOMAIN_MODEL.md` | Shared entities, statuses and integration notes (the contract for the Supabase schema) | — |

Current status: **front end only, on mock data.** Backend (Supabase), Google Maps, payment gateway and delivery tracking are stubbed with clear `TODO` markers. See each folder's README to run it.

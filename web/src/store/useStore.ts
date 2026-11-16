import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as seed from '../data/seed'
import type {
  AmcPlan, AmcSubscription, Order, PlatformSettings, Product, Profile, Role, RsaOffering,
  Seller, Service, ServiceRequest, Technician, Vehicle,
} from '../types'

/**
 * Local mock database. Each collection maps 1:1 to a future Supabase table.
 * Components READ from this store (reactive); all WRITES go through src/services/api.ts,
 * which is the only file that needs to change when Supabase is connected.
 */
export interface Db {
  customers: Profile[]; vehicles: Vehicle[]; services: Service[]; technicians: Technician[]
  sellers: Seller[]; products: Product[]; amc_plans: AmcPlan[]; amc_subscriptions: AmcSubscription[]
  rsa_offerings: RsaOffering[]; service_requests: ServiceRequest[]; orders: Order[]; settings: PlatformSettings
}
export type Collection = Exclude<keyof Db, 'settings'>
export interface Session { role: Exclude<Role, 'customer'>; user_id: string; name: string }

interface State extends Db {
  session: Session | null
  setSession: (s: Session | null) => void
  upsert: <K extends Collection>(k: K, row: Db[K][number]) => void
  remove: (k: Collection, id: string) => void
  setSettings: (s: PlatformSettings) => void
  resetDemo: () => void
}

const initial = (): Db => ({
  customers: seed.seedCustomers, vehicles: seed.seedVehicles, services: seed.seedServices,
  technicians: seed.seedTechnicians, sellers: seed.seedSellers, products: seed.seedProducts,
  amc_plans: seed.seedAmcPlans, amc_subscriptions: seed.seedAmcSubs, rsa_offerings: seed.seedRsa,
  service_requests: seed.seedRequests, orders: seed.seedOrders, settings: seed.seedSettings,
})

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...initial(),
      session: null,
      setSession: (session) => set({ session }),
      upsert: (k, row) =>
        set((s) => {
          const list = s[k] as { id: string }[]
          const r = row as { id: string }
          const exists = list.some((x) => x.id === r.id)
          return { [k]: exists ? list.map((x) => (x.id === r.id ? r : x)) : [r, ...list] } as Partial<State>
        }),
      remove: (k, id) => set((s) => ({ [k]: (s[k] as { id: string }[]).filter((x) => x.id !== id) }) as Partial<State>),
      setSettings: (settings) => set({ settings }),
      resetDemo: () => set((s) => ({ ...initial(), session: s.session })),
    }),
    { name: 'rapid-mechanic-web-v1' },
  ),
)

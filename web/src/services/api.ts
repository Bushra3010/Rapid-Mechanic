/**
 * Data-access layer. Every mutation the UI performs goes through here.
 * TODO(supabase): replace the bodies with supabase-js calls, e.g.
 *   await supabase.from('service_requests').update({ status }).eq('id', id)
 * Keep the function signatures stable so pages don't change.
 */
import { useStore, type Collection, type Db, type Session } from '../store/useStore'
import type { JobStatus, OrderStatus, PlatformSettings, Role } from '../types'

const st = () => useStore.getState()
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 150))

// ---- Auth (mock) ----
export const DEMO_ACCOUNTS: Record<Session['role'], { email: string; user_id: string; name: string }> = {
  admin: { email: 'admin@rapidmechanic.in', user_id: 'adm_1', name: 'Platform Admin' },
  seller: { email: 'vikram@autoparts.in', user_id: 'sel_1', name: 'Shah Auto Parts' },
  technician: { email: 'imran@rapidmech.in', user_id: 'tec_1', name: 'Imran Shaikh' },
}
export async function signIn(role: Session['role'], email: string, password: string) {
  // TODO(supabase): supabase.auth.signInWithPassword({ email, password }) then read profiles.role
  if (!email || password.length < 4) throw new Error('Enter your email and a password of at least 4 characters.')
  const acc = DEMO_ACCOUNTS[role]
  const session: Session = { role, user_id: acc.user_id, name: acc.name }
  st().setSession(session)
  return delay(session)
}
export async function signOut() { st().setSession(null) }

// ---- Generic CRUD ----
export async function save<K extends Collection>(k: K, row: Db[K][number]) { st().upsert(k, row); return delay(row) }
export async function destroy(k: Collection, id: string) { st().remove(k, id); return delay(true) }
export async function saveSettings(s: PlatformSettings) { st().setSettings(s); return delay(s) }

// ---- Workflows ----
export async function updateJobStatus(id: string, status: JobStatus, by_role: Role, note?: string) {
  const r = st().service_requests.find((x) => x.id === id)
  if (!r) throw new Error('Request not found')
  st().upsert('service_requests', { ...r, status, status_history: [...r.status_history, { status, at: new Date().toISOString(), by_role, note }] })
  return delay(true)
}
export async function assignTechnician(id: string, technician_id: string) {
  const r = st().service_requests.find((x) => x.id === id)
  if (!r) throw new Error('Request not found')
  const already = r.status !== 'submitted'
  st().upsert('service_requests', {
    ...r, technician_id,
    status: already ? r.status : 'assigned',
    status_history: already ? r.status_history : [...r.status_history, { status: 'assigned', at: new Date().toISOString(), by_role: 'admin' }],
  })
  return delay(true)
}
export async function updateOrderStatus(id: string, status: OrderStatus, by_role: Role, tracking?: { courier: string; awb: string }) {
  const o = st().orders.find((x) => x.id === id)
  if (!o) throw new Error('Order not found')
  st().upsert('orders', { ...o, status, tracking: tracking ?? o.tracking, status_history: [...o.status_history, { status, at: new Date().toISOString(), by_role }] })
  return delay(true)
}

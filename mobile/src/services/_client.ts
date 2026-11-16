// Shared helpers for the mock data layer. Replace with a Supabase client
// (`createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`) when the backend is ready.
import type { MockDb } from '@/data/seed';
import { getState } from '@/store/useStore';

/** Simulated network latency so loading states are exercised. */
export const delay = (ms = 150) => new Promise<void>((r) => setTimeout(r, ms));

export function readDb(): MockDb {
  return getState().db;
}

export function writeDb(fn: (db: MockDb) => MockDb) {
  getState().updateDb(fn);
}

export function currentUserId(): string {
  const id = getState().session.user_id;
  if (!id) throw new Error('Not signed in');
  return id;
}

export const nowIso = () => new Date().toISOString();

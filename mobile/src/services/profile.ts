// TODO(supabase): from('profiles').select().eq('id', auth.uid()).single() / .update()
import type { Profile } from '@/types';
import { currentUserId, delay, readDb, writeDb } from './_client';

export async function getMyProfile(): Promise<Profile | null> {
  await delay(50);
  const id = currentUserId();
  return readDb().profiles.find((p) => p.id === id) ?? null;
}

export async function updateMyProfile(patch: Partial<Pick<Profile, 'full_name' | 'email' | 'avatar_url'>>): Promise<Profile> {
  await delay(250);
  const id = currentUserId();
  writeDb((db) => ({ ...db, profiles: db.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  return readDb().profiles.find((p) => p.id === id)!;
}

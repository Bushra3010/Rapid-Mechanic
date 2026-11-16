// TODO(supabase): replace with supabase.auth.signInWithOtp({ phone }) and
// supabase.auth.verifyOtp({ phone, token, type: 'sms' }).
import { DEMO_PHONE } from '@/data/seed';
import { getState } from '@/store/useStore';
import type { Profile } from '@/types';
import { uid } from '@/utils/format';
import { delay, nowIso, readDb, writeDb } from './_client';

export const DEMO_LOGIN_PHONE = DEMO_PHONE;

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '').slice(-10);
}

export async function sendOtp(phone: string): Promise<{ sent: true }> {
  await delay(500);
  if (normalizePhone(phone).length !== 10) throw new Error('Enter a valid 10-digit mobile number');
  return { sent: true };
}

/** Mock: any 4–6 digit code is accepted. Creates a customer profile on first login. */
export async function verifyOtp(phone: string, code: string): Promise<{ profile: Profile; isNew: boolean }> {
  await delay(600);
  if (!/^\d{4,6}$/.test(code)) throw new Error('Enter the 4–6 digit OTP');
  const digits = normalizePhone(phone);
  let profile = readDb().profiles.find((p) => p.phone === digits && p.role === 'customer');
  let isNew = false;
  if (!profile) {
    isNew = true;
    profile = {
      id: uid('cust'),
      role: 'customer',
      full_name: '',
      phone: digits,
      email: '',
      avatar_url: null,
      created_at: nowIso(),
    };
    const created = profile;
    writeDb((db) => ({ ...db, profiles: [...db.profiles, created] }));
  }
  getState().setSession({ user_id: profile.id });
  return { profile, isNew };
}

export async function signOut(): Promise<void> {
  await delay(100);
  getState().setSession({ user_id: null });
  getState().setCart([]);
}

export function getSessionSync() {
  return getState().session;
}

export async function completeOnboarding(): Promise<void> {
  getState().setSession({ onboarded: true });
}

/** Dev helper: restore the seeded demo data. */
export async function resetDemoData(): Promise<void> {
  const me = getState().session.user_id;
  getState().resetDemoData();
  // if the signed-in profile no longer exists after the reset, switch to the demo customer
  if (me && !readDb().profiles.some((p) => p.id === me)) {
    getState().setSession({ user_id: readDb().profiles.find((p) => p.phone === DEMO_PHONE)?.id ?? null });
  }
}

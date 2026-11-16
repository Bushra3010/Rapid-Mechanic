// Local mock "database" + session + cart, persisted to AsyncStorage.
// Screens must NOT import this directly for data — go through src/services/*.
// When Supabase is wired in, `db` disappears and services query the API instead;
// `session` maps to supabase.auth and `cart` can stay local.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSeed, type MockDb } from '@/data/seed';
import type { CartLine } from '@/types';

export interface Session {
  user_id: string | null;
  onboarded: boolean;
}

interface StoreState {
  db: MockDb;
  session: Session;
  cart: CartLine[];
  hydrated: boolean;
  updateDb: (fn: (db: MockDb) => MockDb) => void;
  setSession: (patch: Partial<Session>) => void;
  setCart: (cart: CartLine[]) => void;
  resetDemoData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      db: createSeed(),
      session: { user_id: null, onboarded: false },
      cart: [],
      hydrated: false,
      updateDb: (fn) => set((s) => ({ db: fn(s.db) })),
      setSession: (patch) => set((s) => ({ session: { ...s.session, ...patch } })),
      setCart: (cart) => set({ cart }),
      resetDemoData: () => set({ db: createSeed(), cart: [] }),
    }),
    {
      name: 'rapid-mechanic-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ db: s.db, session: s.session, cart: s.cart }),
      onRehydrateStorage: () => () => {
        useStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Read the current snapshot outside React (used by services). */
export const getState = () => useStore.getState();

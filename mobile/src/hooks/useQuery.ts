import { useCallback, useEffect, useRef, useState } from 'react';

import { useStore } from '@/store/useStore';

/**
 * Runs an async service function and re-runs it whenever the local mock store changes
 * (stand-in for Supabase realtime subscriptions). Screens only ever talk to services.
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback(async () => {
    try {
      const result = await fnRef.current();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fnRef.current = fn;
    run();
    // TODO(supabase): replace with supabase.channel(...).on('postgres_changes', ...)
    const unsub = useStore.subscribe((s, prev) => {
      if (s.db !== prev.db || s.cart !== prev.cart || s.session !== prev.session) run();
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, refresh: run };
}

/** Cart badge count (cart is client-side state by design). */
export function useCartCount() {
  return useStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
}

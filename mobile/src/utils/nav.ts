import { router } from 'expo-router';

/** After a successful checkout: clear the booking stack and open the tracking screen. */
export function resetToTracking(path: string) {
  if (router.canDismiss()) router.dismissAll();
  router.push(path as never);
}

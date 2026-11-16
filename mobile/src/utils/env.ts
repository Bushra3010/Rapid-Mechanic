/**
 * Dev / demo tooling (e.g. "Simulate next update") is shown in development builds,
 * or in any build when EXPO_PUBLIC_DEMO_MODE=1 (useful for client demos of a web export).
 */
export const SHOW_DEV_TOOLS = __DEV__ || process.env.EXPO_PUBLIC_DEMO_MODE === '1';

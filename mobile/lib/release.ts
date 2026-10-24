/**
 * Explicit preview-only flow. Never ship a production binary with demo verification.
 * Production requires an integrated, server-verified authentication provider.
 */
export const DEMO_MODE = process.env.EXPO_PUBLIC_BSQUARE_DEMO === 'true';

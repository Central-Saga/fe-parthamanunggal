// Centralized config helpers

// Determine API base URL from env with sensible fallbacks.
// Supports both NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_API_URL to avoid confusion.
export function getApiBaseUrl() {
  const fromBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const fromUrl = process.env.NEXT_PUBLIC_API_URL;
  const internal = process.env.INTERNAL_API_BASE_URL;

  // Server runtime (Next.js server/SSR)
  if (typeof window === 'undefined') {
    const serverBase = internal || fromBase || fromUrl;
    if (serverBase) return serverBase;
    return process.env.NODE_ENV === 'production'
      ? 'https://api.parthamanunggal.com'
      : 'http://localhost:8000';
  }

  // Browser runtime (client)
  const host = window.location.hostname;
  // Force localhost backend when site is opened from localhost,
  // even if a stale NEXT_PUBLIC_* value was baked during build.
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
    const base = 'http://localhost:8000';
    if (process.env.NODE_ENV !== 'production') {
      console.log('[config] Inferred local API base:', base);
    }
    return base;
  }

  // Otherwise, use env if provided
  const clientBase = fromBase || fromUrl;
  if (clientBase) {
    return clientBase;
  }

  // Final fallback
  return 'https://api.parthamanunggal.com';
}

export function shouldProxyApiThroughNext() {
  const viaServer = process.env.NEXT_PUBLIC_USE_SERVER_AUTH === '1';
  const viaSanctum = process.env.NEXT_PUBLIC_USE_SANCTUM === '1';
  return Boolean(viaServer || viaSanctum);
}

// Feature flag: enable interest trigger UI/integration
export function isInterestTriggerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_INTEREST_TRIGGER === '1';
}

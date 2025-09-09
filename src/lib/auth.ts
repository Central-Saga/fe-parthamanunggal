// lib/auth.ts
import { apiRequest } from './api';
import { shouldProxyApiThroughNext } from './config';

type LoginResponse = {
  access_token?: string;
  token?: string;
  token_type?: string;
  [k: string]: unknown;
};

// Read env statically so Next can inline values into the client bundle
const AUTO_LOGIN = process.env.NEXT_PUBLIC_AUTO_LOGIN === '1';
const AUTO_LOGIN_EMAIL = process.env.NEXT_PUBLIC_AUTO_LOGIN_EMAIL || '';
const AUTO_LOGIN_PASSWORD = process.env.NEXT_PUBLIC_AUTO_LOGIN_PASSWORD || '';

export async function checkSession(): Promise<boolean> {
  try {
    // For Sanctum session mode, Laravel typically exposes /user
    const user = await apiRequest<any>('GET', '/user');
    return Boolean(user);
  } catch {
    return false;
  }
}

export async function loginWithSanctumSession(email: string, password: string): Promise<boolean> {
  try {
    // Get CSRF cookie first
    await apiRequest('GET', '/csrf-cookie');
  } catch (e) {
    // Some setups mount sanctum under /sanctum/csrf-cookie
    try { await apiRequest('GET', '/sanctum/csrf-cookie'); } catch {}
  }

  try {
    await apiRequest('POST', '/login', { email, password });
    const ok = await checkSession();
    return ok;
  } catch (e) {
    return false;
  }
}

export async function loginWithApiToken(email: string, password: string): Promise<boolean> {
  try {
    const res = await apiRequest<LoginResponse>('POST', '/api/login', { email, password });
    const token = (res && (res.access_token || (res as any).token)) as string | undefined;
    const type = (res && (res.token_type || 'Bearer')) as string;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      localStorage.setItem('token_type', type || 'Bearer');
      return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

export async function autoLoginIfEnabled(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (!AUTO_LOGIN) return false;

  // If token already present, assume logged in for API-token flow
  const existing = localStorage.getItem('access_token');
  if (existing) return true;

  const email = AUTO_LOGIN_EMAIL;
  const password = AUTO_LOGIN_PASSWORD;
  if (!email || !password) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] AUTO_LOGIN enabled but email/password not set');
    }
    return false;
  }

  // If we proxy via Next and Sanctum is intended, prefer session flow first
  const useSanctum = shouldProxyApiThroughNext();

  // Only do session-based login (Option A)
  if (!useSanctum) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] Sanctum proxy is off; enable NEXT_PUBLIC_USE_SERVER_AUTH=1 and NEXT_PUBLIC_USE_SANCTUM=1');
    }
  }

  // Already logged in?
  if (await checkSession()) return true;

  // Try session login
  const ok = await loginWithSanctumSession(email, password);
  return ok;
}

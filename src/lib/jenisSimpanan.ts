import { apiRequest } from "./api";

export type JenisKey =
  | "wajib"
  | "pokok"
  | "wajib_usaha"
  | "wajib_khusus"
  | "sukarela"
  | "modal"
  | "khusus"
  | "berjangka";

function envNameFor(key: JenisKey): string {
  return `NEXT_PUBLIC_JENIS_${key.toUpperCase()}`;
}

function parseEnvInt(val: string | undefined): number | null {
  if (!val) return null;
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getJenisIdFromEnv(key: JenisKey): number | null {
  if (typeof process === "undefined") return null;
  const name = envNameFor(key);
  // @ts-ignore - NEXT_PUBLIC_* will be inlined on client
  const val = process.env?.[name] as string | undefined;
  return parseEnvInt(val);
}

function candidatesForName(key: JenisKey): string[] {
  switch (key) {
    case "wajib":
      return ["wajib"]; 
    case "pokok":
      return ["pokok"]; 
    case "wajib_usaha":
      return ["wajib usaha", "wajib_usaha", "wajib-usaha"]; 
    case "wajib_khusus":
      return ["wajib khusus", "wajib_khusus", "wajib-khusus"]; 
    case "sukarela":
      return ["sukarela"]; 
    case "modal":
      return ["modal"]; 
    case "khusus":
      return ["khusus"]; 
    case "berjangka":
      return ["berjangka"]; 
  }
}

export interface JenisSimpananItem { id: number; nama: string }

export async function resolveJenisId(key: JenisKey): Promise<number | null> {
  const envId = getJenisIdFromEnv(key);
  if (envId) return envId;

  // Try fetching jenis list from likely endpoints
  const endpoints = [
    "/api/jenis-simpanans",
    "/api/jenis_simpanans",
    "/api/jenis-simpanan",
    "/api/jenis_simpanan",
  ];

  for (const ep of endpoints) {
    try {
      const res = await apiRequest<JenisSimpananItem[] | { data: JenisSimpananItem[] }>("GET", ep);
      const list: JenisSimpananItem[] = Array.isArray(res) ? res : ((res as any)?.data ?? []);
      const names = candidatesForName(key);
      const found = list.find((it: JenisSimpananItem) => names.includes(String((it as any).nama || "").toLowerCase()));
      if (found?.id) return found.id;
    } catch {
      // try next
    }
  }
  return null;
}

let runtimeCache: Record<string, number | null> | null = null;
export async function getJenisIdRuntime(key: JenisKey): Promise<number | null> {
  try {
    if (!runtimeCache) {
      const res = await apiRequest<{ jenisIds: Record<string, number | null> }>('GET', '/api/client-config');
      runtimeCache = res?.jenisIds || {};
    }
    const id = (runtimeCache as any)?.[key] as number | null | undefined;
    if (id) return id;
  } catch {
    // ignore
  }
  return null;
}

export async function fetchJenisById(id: number): Promise<JenisSimpananItem | null> {
  try {
    const res = await apiRequest<JenisSimpananItem | { data: JenisSimpananItem }>("GET", `/api/jenis-simpanans/${id}`);
    const data = (res as any)?.data ? (res as any).data : res;
    return (data as JenisSimpananItem) ?? null;
  } catch {
    try {
      const res = await apiRequest<JenisSimpananItem | { data: JenisSimpananItem }>("GET", `/api/jenis_simpanans/${id}`);
      const data = (res as any)?.data ? (res as any).data : res;
      return (data as JenisSimpananItem) ?? null;
    } catch {
      return null;
    }
  }
}

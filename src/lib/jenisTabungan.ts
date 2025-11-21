import { apiRequest } from "./api";

export type TabunganKey = "harian" | "berjangka" | "deposito";

function envNameFor(key: TabunganKey): string {
  return `NEXT_PUBLIC_JENIS_TABUNGAN_${key.toUpperCase()}`;
}

function parseEnvInt(val: string | undefined): number | null {
  if (!val) return null;
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getTabunganJenisIdFromEnv(key: TabunganKey): number | null {
  let v: string | undefined;
  
  // Kita harus tulis satu per satu agar Next.js Build bisa membacanya
  switch (key) {
    case 'harian':
      v = process.env.NEXT_PUBLIC_JENIS_TABUNGAN_HARIAN;
      break;
    case 'berjangka':
      v = process.env.NEXT_PUBLIC_JENIS_TABUNGAN_BERJANGKA;
      break;
    case 'deposito':
      v = process.env.NEXT_PUBLIC_JENIS_TABUNGAN_DEPOSITO;
      break;
  }
  
  return parseEnvInt(v);
}

export interface JenisTabunganItem { id: number; nama: string }

function candidatesForName(key: TabunganKey): string[] {
  switch (key) {
    case "harian": return ["harian"]; 
    case "berjangka": return ["berjangka"]; 
    case "deposito": return ["deposito"]; 
  }
}

export async function resolveTabunganJenisId(key: TabunganKey): Promise<number | null> {
  const envId = getTabunganJenisIdFromEnv(key);
  if (envId) return envId;
  const endpoints = [
    "/api/jenis-tabungans",
    "/api/jenis_tabungans",
    "/api/jenis-tabungan",
    "/api/jenis_tabungan",
  ];
  for (const ep of endpoints) {
    try {
      const res = await apiRequest<JenisTabunganItem[] | { data: JenisTabunganItem[] }>("GET", ep);
      const list: JenisTabunganItem[] = Array.isArray(res) ? res : ((res as any)?.data ?? []);
      const names = candidatesForName(key);
      const found = list.find((it: JenisTabunganItem) => names.includes(String((it as any).nama || "").toLowerCase()));
      if (found?.id) return found.id;
    } catch {}
  }
  return null;
}

export async function fetchTabunganJenisById(id: number): Promise<JenisTabunganItem | null> {
  try {
    const res = await apiRequest<JenisTabunganItem | { data: JenisTabunganItem }>("GET", `/api/jenis-tabungans/${id}`);
    return (res as any)?.data ? (res as any).data : (res as any);
  } catch {
    try {
      const res = await apiRequest<JenisTabunganItem | { data: JenisTabunganItem }>("GET", `/api/jenis_tabungans/${id}`);
      return (res as any)?.data ? (res as any).data : (res as any);
    } catch {
      return null;
    }
  }
}

let runtimeTabunganCache: Record<string, number | null> | null = null;
export async function getTabunganJenisIdRuntime(key: TabunganKey): Promise<number | null> {
  try {
    if (!runtimeTabunganCache) {
      const res = await apiRequest<{ tabunganJenisIds?: Record<string, number | null> }>("GET", "/api/client-config");
      runtimeTabunganCache = res?.tabunganJenisIds || {};
    }
    const id = (runtimeTabunganCache as any)?.[key] as number | null | undefined;
    if (id) return id;
  } catch {}
  return null;
}


import { NextResponse } from 'next/server';

function parseIntEnv(name: string): number | null {
  const v = process.env[name];
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET() {
  const mapping = {
    sukarela: parseIntEnv('NEXT_PUBLIC_JENIS_SUKARELA'),
    wajib_usaha: parseIntEnv('NEXT_PUBLIC_JENIS_WAJIB_USAHA'),
    berjangka: parseIntEnv('NEXT_PUBLIC_JENIS_BERJANGKA'),
    pokok: parseIntEnv('NEXT_PUBLIC_JENIS_POKOK'),
    wajib: parseIntEnv('NEXT_PUBLIC_JENIS_WAJIB'),
    wajib_khusus: parseIntEnv('NEXT_PUBLIC_JENIS_WAJIB_KHUSUS'),
    khusus: parseIntEnv('NEXT_PUBLIC_JENIS_KHUSUS'),
    modal: parseIntEnv('NEXT_PUBLIC_JENIS_MODAL'),
  } as const;
  const tabungan = {
    harian: parseIntEnv('NEXT_PUBLIC_JENIS_TABUNGAN_HARIAN'),
    berjangka: parseIntEnv('NEXT_PUBLIC_JENIS_TABUNGAN_BERJANGKA'),
    deposito: parseIntEnv('NEXT_PUBLIC_JENIS_TABUNGAN_DEPOSITO'),
  } as const;
  return NextResponse.json({ jenisIds: mapping, tabunganJenisIds: tabungan });
}

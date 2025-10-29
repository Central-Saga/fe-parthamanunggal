"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { financeApi } from '@/lib/api/finance';
import type { NeracaHarianResponse } from '@/types/finance';

// Bulanan shares the same response shape as harian
const cache = new Map<string, NeracaHarianResponse>();

export function useNeracaBulanan(tahun: number, bulan: number) {
  const key = useMemo(() => `${tahun}-${String(bulan).padStart(2, '0')}` , [tahun, bulan]);
  const [data, setData] = useState<NeracaHarianResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!tahun || !bulan) return;
    setIsLoading(true);
    setError(null);
    try {
      if (cache.has(key)) setData(cache.get(key) || null);
      const res = await financeApi.getNeracaBulanan(tahun, bulan);
      cache.set(key, res as NeracaHarianResponse);
      if (mounted.current) setData(res as NeracaHarianResponse);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal memuat';
      if (mounted.current) setError(String(msg));
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [tahun, bulan, key]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  const refetch = useCallback(() => load(), [load]);

  return { data, isLoading, error, refetch } as const;
}


"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { financeApi } from '@/lib/api/finance';
import type { NeracaHarianResponse } from '@/types/finance';

const cache = new Map<string, NeracaHarianResponse>();

export function useNeracaTahunan(tahun: number) {
  const key = useMemo(() => String(tahun), [tahun]);
  const [data, setData] = useState<NeracaHarianResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!tahun) return;
    setIsLoading(true);
    setError(null);
    try {
      if (cache.has(key)) setData(cache.get(key) || null);
      const res = await financeApi.getNeracaTahunan(tahun);
      cache.set(key, res as NeracaHarianResponse);
      if (mounted.current) setData(res as NeracaHarianResponse);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal memuat';
      if (mounted.current) setError(String(msg));
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [tahun, key]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  const refetch = useCallback(() => load(), [load]);

  return { data, isLoading, error, refetch } as const;
}


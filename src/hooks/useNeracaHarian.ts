"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { financeApi } from '@/lib/api/finance';
import type { NeracaHarianResponse } from '@/types/finance';

const cache = new Map<string, NeracaHarianResponse>();

export function useNeracaHarian(tanggal: string) {
  const [data, setData] = useState<NeracaHarianResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = useMemo(() => tanggal || '', [tanggal]);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!key) return;
    setIsLoading(true);
    setError(null);
    try {
      if (cache.has(key)) {
        setData(cache.get(key) || null);
      }
      const res = await financeApi.getNeracaHarian(key);
      cache.set(key, res);
      if (mounted.current) setData(res);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal memuat';
      if (mounted.current) setError(String(msg));
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  const refetch = useCallback(() => load(), [load]);

  const prefetch = useCallback(async (tgl: string) => {
    try {
      const res = await financeApi.getNeracaHarian(tgl);
      cache.set(tgl, res);
    } catch {}
  }, []);

  return { data, isLoading, error, refetch, prefetch } as const;
}
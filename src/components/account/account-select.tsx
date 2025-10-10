"use client";

import { useEffect, useMemo, useState } from 'react';
import { akunApi } from '@/lib/api-akun';
import type { Akun } from '@/types/akun';

type Props = {
  value?: number | null;
  onChange?: (val: number | null) => void;
  placeholder?: string;
  className?: string;
};

export default function AccountSelect({ value, onChange, placeholder = 'Pilih akun…', className }: Props) {
  const [options, setOptions] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await akunApi.list({ per_page: 200 });
        // Support both paginated and non-paginated
        const rows = Array.isArray((res as any)) ? (res as any as Akun[]) : (res as any).data;
        if (mounted) setOptions(rows || []);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  return (
    <select
      className={`w-full rounded-md border px-3 py-2 text-sm ${className || ''}`}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : null)}
      disabled={loading}
    >
      <option value="">{loading ? 'Memuat…' : placeholder}</option>
      {options?.map((a) => (
        <option key={a.id} value={a.id}>
          {a.kode_akun} — {a.nama_akun}
        </option>
      ))}
    </select>
  );
}


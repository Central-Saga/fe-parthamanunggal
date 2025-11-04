"use client";

import type { ColumnDef } from '@tanstack/react-table';
import type { BungaTabungan } from '@/types/bunga_tabungan';
import type { Tabungan } from '@/types/tabungan';
import type { JenisTabungan } from '@/types/jenis_tabungan';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

function formatIDR(n: number | string) {
  const v = typeof n === 'string' ? Number(n) : n;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(v || 0));
}

// Simple runtime caches to minimize network calls during cell rendering
const tabunganJenisCache = new Map<number, number>(); // tabungan_id -> jenis_tabungan_id
const jenisNamaCache = new Map<number, string>(); // jenis_tabungan_id -> nama

function JenisNameCell({ tabunganId }: { tabunganId: number }) {
  const [name, setName] = useState<string>("...");

  useEffect(() => {
    let mounted = true;
    async function ensureJenisList() {
      if (jenisNamaCache.size > 0) return;
      try {
        const res = await apiRequest<JenisTabungan[] | { data: JenisTabungan[] }>('GET', '/api/jenis-tabungans');
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? []);
        for (const j of list ?? []) jenisNamaCache.set(Number((j as any).id), String((j as any).nama ?? ''));
      } catch {}
    }
    async function run() {
      await ensureJenisList();
      let jenisId = tabunganJenisCache.get(tabunganId) || null;
      if (!jenisId) {
        try {
          const tRes = await apiRequest<Tabungan | { data: Tabungan }>('GET', `/api/tabungans/${tabunganId}`);
          const t: Tabungan = (tRes as any)?.data ? (tRes as any).data : (tRes as any);
          jenisId = Number(t.jenis_tabungan_id);
          tabunganJenisCache.set(tabunganId, jenisId);
        } catch {}
      }
      if (!mounted) return;
      if (jenisId && jenisNamaCache.has(jenisId)) {
        setName(jenisNamaCache.get(jenisId) || String(jenisId));
      } else if (jenisId) {
        setName(String(jenisId));
      } else {
        setName('-');
      }
    }
    run();
    return () => { mounted = false };
  }, [tabunganId]);

  return <span>{name}</span>;
}

export const bungaColumns: ColumnDef<BungaTabungan & { tabungan?: { id: number; anggota_id?: number } }>[] = [
  { header: 'ID', accessorKey: 'id', size: 80 },
  { header: 'Tabungan ID', accessorKey: 'tabungan_id', size: 100 },
  {
    header: 'Jenis Tabungan',
    id: 'jenis_tabungan',
    cell: ({ row }) => <JenisNameCell tabunganId={Number(row.original.tabungan_id)} />,
  },
  {
    header: 'Periode',
    id: 'periode',
    cell: ({ row }) => `${row.original.bulan}/${row.original.tahun}`,
  },
  {
    header: 'Saldo Minimum',
    accessorKey: 'saldo_minimum',
    cell: ({ getValue }) => formatIDR(getValue() as any),
  },
  {
    header: 'Persentase',
    accessorKey: 'persentase',
    cell: ({ getValue }) => {
      const raw = Number(getValue() ?? 0);
      const pct = isFinite(raw) ? (raw <= 1 ? raw * 100 : raw) : 0;
      return `${pct}%`;
    },
  },
  {
    header: 'Jumlah Bunga',
    accessorKey: 'jumlah_bunga',
    cell: ({ getValue }) => formatIDR(getValue() as any),
  },
  {
    header: 'Status',
    accessorKey: 'status',
  },
  {
    id: 'link',
    header: 'Detail',
    cell: ({ row }) => (
      <Link className="text-emerald-700 hover:underline" href={`/dashboard/tabungan/${row.original.tabungan_id}`}>Lihat Tabungan</Link>
    ),
  },
];

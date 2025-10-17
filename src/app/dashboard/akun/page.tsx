"use client";

import { useEffect, useMemo, useState } from 'react';
import { akunApi } from '@/lib/api-akun';
import type { Akun, Paginated } from '@/types/akun';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AkunListPage() {
  const [data, setData] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(50);

  async function load() {
    setLoading(true);
    try {
      const res = await akunApi.list({ q, per_page: perPage, page });
      const rows = Array.isArray((res as any)) ? (res as any as Akun[]) : (res as Paginated<Akun>).data;
      setData(rows || []);
      if (!Array.isArray(res)) {
        setTotal((res as Paginated<Akun>).total);
      } else {
        setTotal(rows?.length || 0);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, page, perPage]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Akun (COA)</h1>
        <Button asChild>
          <Link href="/dashboard/akun/new">Tambah Akun</Link>
        </Button>
      </div>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode/nama…" className="w-64 rounded-md border px-3 py-2 text-sm" />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Kode</th>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-left">Tipe</th>
              <th className="px-3 py-2 text-left">Saldo Normal</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">Memuat…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">Belum ada akun.</td></tr>
            ) : (
              data.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{a.kode_akun}</td>
                  <td className="px-3 py-2">{a.nama_akun}</td>
                  <td className="px-3 py-2">{a.tipe || '-'}</td>
                  <td className="px-3 py-2">{a.saldo_normal || '-'}</td>
                  <td className="px-3 py-2">{a.status ? 'Aktif' : 'Non Aktif'}</td>
                  <td className="px-3 py-2 text-right">
                    <Link className="text-emerald-700 hover:underline" href={`/dashboard/akun/${a.id}/edit`}>Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


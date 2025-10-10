"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jurnalApi } from '@/lib/api-jurnal';

export default function JurnalListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tanggal, setTanggal] = useState<string>('');
  const [dari, setDari] = useState<string>('');
  const [sampai, setSampai] = useState<string>('');
  const [sumber, setSumber] = useState<string>('');

  async function load() {
    setLoading(true);
    try {
      const res = await jurnalApi.list({ per_page: 50, tanggal: tanggal || undefined, dari: dari || undefined, sampai: sampai || undefined, sumber: sumber || undefined });
      // assume Laravel pagination
      const rows = Array.isArray((res as any)) ? (res as any) : (res as any).data;
      setItems(rows || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tanggal, dari, sampai, sumber]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Jurnal Umum</h1>
        <Link href="/dashboard/jurnal/new" className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm">Tambah Jurnal</Link>
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="grid gap-1">
          <span className="text-sm">Tanggal</span>
          <input type="date" className="rounded-md border px-3 py-2 text-sm" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </label>
        <div className="text-sm text-muted-foreground">atau rentang</div>
        <label className="grid gap-1">
          <span className="text-sm">Dari</span>
          <input type="date" className="rounded-md border px-3 py-2 text-sm" value={dari} onChange={(e) => setDari(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Sampai</span>
          <input type="date" className="rounded-md border px-3 py-2 text-sm" value={sampai} onChange={(e) => setSampai(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Sumber</span>
          <input className="rounded-md border px-3 py-2 text-sm" value={sumber} onChange={(e) => setSumber(e.target.value)} placeholder="manual/transaksi_tabungan" />
        </label>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Tanggal</th>
              <th className="px-3 py-2 text-left">No Bukti</th>
              <th className="px-3 py-2 text-left">Sumber</th>
              <th className="px-3 py-2 text-left">Keterangan</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">Memuat…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">Belum ada jurnal.</td></tr>
            ) : (
              items.map((j: any) => (
                <tr key={j.id} className="border-t">
                  <td className="px-3 py-2">{j.tanggal}</td>
                  <td className="px-3 py-2">{j.no_bukti || '-'}</td>
                  <td className="px-3 py-2">{j.sumber || '-'}</td>
                  <td className="px-3 py-2">{j.keterangan || '-'}</td>
                  <td className="px-3 py-2 text-right">
                    <Link className="text-emerald-700 hover:underline" href={`/dashboard/jurnal/${j.id}`}>Detail</Link>
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


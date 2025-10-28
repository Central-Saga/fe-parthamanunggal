"use client";

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { financeApi } from '@/lib/api/finance';
import { formatRupiah } from '@/utils/number';
import Link from 'next/link';

type ShuBulanan = { tahun: number; bulan: number; shu_bulanan: number; days: number };
type ShuTahunan = { tahun: number; shu_tahunan: number; days: number };

function pad2(n: number) { return String(n).padStart(2, '0'); }

export default function ShuPage() {
  const today = new Date();
  const [tahun, setTahun] = useState<number>(today.getFullYear());
  const [bulan, setBulan] = useState<number>(today.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulanan, setBulanan] = useState<ShuBulanan | null>(null);
  const [tahunan, setTahunan] = useState<ShuTahunan | null>(null);

  const tanggalPrefill = useMemo(() => `${tahun}-${pad2(bulan)}-01`, [tahun, bulan]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const [b, t] = await Promise.all([
        financeApi.getShuBulanan(tahun, bulan),
        financeApi.getShuTahunan(tahun),
      ]);
      setBulanan(b as ShuBulanan);
      setTahunan(t as ShuTahunan);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal memuat SHU periodik';
      setError(String(msg));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold">Ringkasan SHU</h1>
        <div className="flex items-center gap-2">
          <input type="number" className="w-[110px] rounded-md border px-3 py-2 text-sm" value={tahun} onChange={(e) => setTahun(Number(e.target.value) || tahun)} placeholder="Tahun" />
          <select className="rounded-md border px-3 py-2 text-sm" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
          <Button onClick={load} variant="outline">Tampilkan</Button>
          <Link href={`/dashboard/laporan/neraca-harian?tanggal=${tanggalPrefill}`}>
            <Button>Lihat Neraca Harian</Button>
          </Link>
        </div>
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="text-sm text-muted-foreground">Memuat…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-xs text-muted-foreground">SHU Bulanan</div>
            <div className="mt-1 text-2xl font-semibold">{formatRupiah(bulanan?.shu_bulanan || 0)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Periode: {pad2(bulan)}/{tahun} • Hari: {bulanan?.days ?? 0}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-xs text-muted-foreground">SHU YTD</div>
            <div className="mt-1 text-2xl font-semibold">{formatRupiah(tahunan?.shu_tahunan || 0)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Tahun: {tahun} • Hari: {tahunan?.days ?? 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
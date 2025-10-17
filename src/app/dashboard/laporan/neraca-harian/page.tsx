"use client";

import { useEffect, useState } from 'react';
import { laporanApi } from '@/lib/api-laporan';
import { Button } from '@/components/ui/button';
import NeracaTable from '@/components/finance/neraca-table';
import type { NeracaResponse } from '@/types/laporan';
import NeracaCreateModal from '@/components/finance/neraca-create-modal';

export default function NeracaHarianPage() {
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<NeracaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await laporanApi.getNeracaHarian(tanggal);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tanggal]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold">Neraca Saldo Harian</h1>
        <div className="flex items-center gap-2">
          <input type="date" className="rounded-md border px-3 py-2 text-sm" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          <Button onClick={load} variant="outline">Muat</Button>
          <Button onClick={() => setOpenCreate(true)}>Buat Baris</Button>
        </div>
      </div>
      {error && <div className="text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="text-sm text-muted-foreground">Memuat…</div>
      ) : (
        <NeracaTable data={data} />
      )}
      {openCreate && (
        <NeracaCreateModal
          tanggal={tanggal}
          neracaData={data}
          onClose={() => setOpenCreate(false)}
          onSaved={() => { setOpenCreate(false); load(); }}
        />
      )}
    </div>
  );
}

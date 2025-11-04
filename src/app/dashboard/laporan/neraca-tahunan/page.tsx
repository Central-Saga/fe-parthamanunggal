"use client";

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import NeracaTable from '@/components/finance/neraca-table';
import type { NeracaResponse } from '@/types/laporan';
import { useNeracaTahunan } from '@/hooks/useNeracaTahunan';
import { formatRupiah } from '@/utils/number';

export default function NeracaTahunanPage() {
  const now = new Date();
  const [tahun, setTahun] = useState<number>(now.getFullYear());
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const start = 1900;
    const arr: number[] = [];
    for (let y = current; y >= start; y--) arr.push(y);
    return arr;
  }, []);
  const { data, isLoading, error, refetch } = useNeracaTahunan(tahun);

  function toNumber(v: any): number {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const cleaned = v.replace(/\./g, '').replace(/,/g, '.');
      const n = Number.parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Neraca Saldo Tahunan</h1>
          {data?.ringkasan?.source && (
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: data.ringkasan.source === 'snapshot' ? '#dcfce7' : '#fef9c3',
                color: data.ringkasan.source === 'snapshot' ? '#166534' : '#854d0e',
              }}
            >
              {data.ringkasan.source === 'snapshot' ? 'Snapshot' : 'Jurnal'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            aria-label="Pilih tahun"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button onClick={() => setTahun(now.getFullYear())} variant="ghost">
            Tahun ini
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            Muat
          </Button>
        </div>
      </div>
      {error && <div className="text-sm text-red-700">{error}</div>}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Memuat…</div>
      ) : (
        <>
          <NeracaTable data={data as unknown as NeracaResponse} />
          {data?.ringkasan && (
            <div className="-mt-2 flex flex-wrap gap-2">
              {(() => {
                const r = data.ringkasan as any;
                const pendapatan = toNumber(r?.pendapatan ?? r?.pendapatan_tahun ?? 0);
                const biaya = toNumber(r?.biaya ?? r?.biaya_tahun ?? 0);
                const labaRugi = toNumber(r?.laba_rugi ?? r?.shu_tahunan ?? (pendapatan - biaya));
                return (
                  <>
                    <div className="inline-flex items-center rounded-md bg-muted/30 px-3 py-2 text-sm">
                      <span className="text-muted-foreground mr-2">Pendapatan</span>
                      <span className="font-semibold">{formatRupiah(pendapatan)}</span>
                    </div>
                    <div className="inline-flex items-center rounded-md bg-muted/30 px-3 py-2 text-sm">
                      <span className="text-muted-foreground mr-2">Biaya</span>
                      <span className="font-semibold">{formatRupiah(biaya)}</span>
                    </div>
                    <div className="inline-flex items-center rounded-md bg-muted/30 px-3 py-2 text-sm">
                      <span className="text-muted-foreground mr-2">Laba Rugi (SHU)</span>
                      <span className="font-semibold">{formatRupiah(labaRugi)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}

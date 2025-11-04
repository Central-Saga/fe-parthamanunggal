"use client";

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import NeracaTable from '@/components/finance/neraca-table';
import type { NeracaResponse } from '@/types/laporan';
import { useNeracaBulanan } from '@/hooks/useNeracaBulanan';
import { formatRupiah } from '@/utils/number';

function parsePeriode(val: string) {
  const [y, m] = (val || '').split('-').map((v) => Number(v));
  const tahun = Number.isFinite(y) && y > 0 ? y : new Date().getFullYear();
  const bulan = Number.isFinite(m) && m > 0 ? m : (new Date().getMonth() + 1);
  return { tahun, bulan };
}

export default function NeracaBulananPage() {
  const now = new Date();
  const [periode, setPeriode] = useState<string>(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const { tahun, bulan } = useMemo(() => parsePeriode(periode), [periode]);
  const { data, isLoading, error, refetch } = useNeracaBulanan(tahun, bulan);

  function toNumber(v: any): number {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      // Support id-ID formatted strings like 1.234,56
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
          <h1 className="text-lg font-semibold">Neraca Saldo Bulanan</h1>
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
          <input
            type="month"
            className="rounded-md border px-3 py-2 text-sm"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
          />
          <Button onClick={() => setPeriode(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)} variant="ghost">
            Bulan ini
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
                const pendapatan = toNumber(r?.pendapatan ?? r?.pendapatan_bulan ?? 0);
                const biaya = toNumber(r?.biaya ?? r?.biaya_bulan ?? 0);
                const labaRugi = toNumber(r?.laba_rugi ?? r?.shu_bulanan ?? (pendapatan - biaya));
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

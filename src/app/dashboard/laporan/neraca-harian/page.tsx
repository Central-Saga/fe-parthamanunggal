"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import NeracaTable from '@/components/finance/neraca-table';
import type { NeracaResponse } from '@/types/laporan';
import NeracaCreateModal from '@/components/finance/neraca-create-modal';
import { useNeracaHarian } from '@/hooks/useNeracaHarian';
import ShuSummary from '@/components/finance/ShuSummary';
import InputShuAwalModal from '@/components/finance/InputShuAwalModal';

export default function NeracaHarianPage() {
  const search = useSearchParams();
  const qsTanggal = (search?.get('tanggal') || '').trim();
  const [tanggal, setTanggal] = useState<string>(qsTanggal || new Date().toISOString().slice(0, 10));
  const { data, isLoading, error, refetch, prefetch } = useNeracaHarian(tanggal);
  const [openCreate, setOpenCreate] = useState(false);
  const [openShuAwal, setOpenShuAwal] = useState(false);

  function onSuccessShuAwal(tgl: string) {
    refetch();
    try {
      const d = new Date(tgl + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      const next = d.toISOString().slice(0, 10);
      prefetch(next);
    } catch {}
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Neraca Saldo Harian</h1>
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
            type="date"
            className="rounded-md border px-3 py-2 text-sm"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
          <Button onClick={() => setTanggal(new Date().toISOString().slice(0, 10))} variant="ghost">
            Hari ini
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            Muat
          </Button>
          <Button onClick={() => setOpenCreate(true)}>Buat Baris</Button>
          <Button onClick={() => setOpenShuAwal(true)} variant="default">
            Set SHU Awal
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
            <div className="-mt-2">
              <ShuSummary
                shu_awal={data.ringkasan.shu_awal || 0}
                shu_harian={data.ringkasan.shu_harian}
                shu_kumulatif={data.ringkasan.shu_kumulatif}
              />
            </div>
          )}
        </>
      )}
      {openCreate && (
        <NeracaCreateModal
          tanggal={tanggal}
          neracaData={data as any}
          onClose={() => setOpenCreate(false)}
          onSaved={() => {
            setOpenCreate(false);
            refetch();
          }}
        />
      )}
      {openShuAwal && (
        <InputShuAwalModal
          tanggal={tanggal}
          onClose={() => setOpenShuAwal(false)}
          onSuccess={onSuccessShuAwal}
        />
      )}
    </div>
  );
}

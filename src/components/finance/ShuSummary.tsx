"use client";

import { formatRupiah } from '@/utils/number';

type Props = {
  shu_awal?: number;
  shu_harian: number;
  shu_kumulatif: number;
};

export default function ShuSummary({ shu_awal = 0, shu_harian, shu_kumulatif }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="inline-flex items-center rounded-md bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground mr-2">SHU Awal</span>
        <span className="font-semibold">{formatRupiah(shu_awal)}</span>
      </div>
      <div className="inline-flex items-center rounded-md bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground mr-2">SHU Harian</span>
        <span className="font-semibold">{formatRupiah(shu_harian)}</span>
      </div>
      <div className="inline-flex items-center rounded-md bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground mr-2">SHU Kumulatif</span>
        <span className="font-semibold">{formatRupiah(shu_kumulatif)}</span>
      </div>
    </div>
  );
}
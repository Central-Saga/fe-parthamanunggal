"use client";

import type { NeracaResponse } from '@/types/laporan';

type Props = { data: NeracaResponse | null };

function splitToDK(value: number) {
  if (value >= 0) return { d: value, k: 0 };
  return { d: 0, k: Math.abs(value) };
}

function fmtDateHeader(iso: string) {
  try {
    const d = new Date(iso + 'T00:00:00');
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' }); // Apr style
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return iso;
  }
}

export default function NeracaTable({ data }: Props) {
  if (!data) return null;
  const rows = data.data || [];
  const r = data.ringkasan;

  // Totals per kolom (sesuai header lama)
  let tAwalD = 0, tAwalK = 0, tMutD = 0, tMutK = 0, tAkhD = 0, tAkhK = 0;

  const mutasiLabel = `Mutasi ${fmtDateHeader(data.tanggal)}`;

  const body = rows.map((row, i) => {
    const awal = splitToDK(row.saldo_awal);
    const akhir = splitToDK(row.saldo_akhir);
    tAwalD += awal.d; tAwalK += awal.k;
    tMutD += row.mutasi_debet; tMutK += row.mutasi_kredit;
    tAkhD += akhir.d; tAkhK += akhir.k;
    return (
      <tr key={i} className="border-t odd:bg-white even:bg-muted/40 hover:bg-muted/50 transition-colors">
        <td className="px-3 py-2 whitespace-nowrap">{row.kode_akun}</td>
        <td className="px-3 py-2">{row.nama_akun}</td>
        <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{awal.d.toLocaleString('id-ID')}</td>
        <td className="px-3 py-2 text-right tabular-nums border-r text-rose-700">{awal.k.toLocaleString('id-ID')}</td>
        <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{row.mutasi_debet.toLocaleString('id-ID')}</td>
        <td className="px-3 py-2 text-right tabular-nums border-r text-rose-700">{row.mutasi_kredit.toLocaleString('id-ID')}</td>
        <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{akhir.d.toLocaleString('id-ID')}</td>
        <td className="px-3 py-2 text-right tabular-nums text-rose-700">{akhir.k.toLocaleString('id-ID')}</td>
      </tr>
    );
  });

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="[&>tr>th]:align-middle">
            <tr className="bg-muted/50 sticky top-0 z-10">
              <th className="px-3 py-2 text-left" rowSpan={2}>Kode</th>
              <th className="px-3 py-2 text-left" rowSpan={2}>Akun</th>
              <th className="px-3 py-2 text-center" colSpan={2}>Saldo Awal</th>
              <th className="px-3 py-2 text-center border-x" colSpan={2}>{mutasiLabel}</th>
              <th className="px-3 py-2 text-center" colSpan={2}>Neraca Saldo</th>
            </tr>
            <tr className="bg-muted/50 sticky top-[34px] z-10">
              <th className="px-3 py-2 text-right text-emerald-700">Debet</th>
              <th className="px-3 py-2 text-right border-r text-rose-700">Kredit</th>
              <th className="px-3 py-2 text-right text-emerald-700">Debet</th>
              <th className="px-3 py-2 text-right border-r text-rose-700">Kredit</th>
              <th className="px-3 py-2 text-right text-emerald-700">Debet</th>
              <th className="px-3 py-2 text-right text-rose-700">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {body}
          </tbody>
          <tfoot className="border-t bg-muted/30">
            <tr className="bg-muted/50">
              <td className="px-3 py-2 font-medium" colSpan={2}>Total</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-emerald-700">{tAwalD.toLocaleString('id-ID')}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums border-r text-rose-700">{tAwalK.toLocaleString('id-ID')}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-emerald-700">{tMutD.toLocaleString('id-ID')}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums border-r text-rose-700">{tMutK.toLocaleString('id-ID')}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-emerald-700">{tAkhD.toLocaleString('id-ID')}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-rose-700">{tAkhK.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td className="px-3 py-2" colSpan={8}>
                <span className="inline-block rounded-md bg-muted/30 px-2 py-1 mr-2">SHU Harian: <span className="font-semibold">{r.shu_harian.toLocaleString('id-ID')}</span></span>
                <span className="inline-block rounded-md bg-muted/30 px-2 py-1">SHU Kumulatif: <span className="font-semibold">{r.shu_kumulatif.toLocaleString('id-ID')}</span></span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

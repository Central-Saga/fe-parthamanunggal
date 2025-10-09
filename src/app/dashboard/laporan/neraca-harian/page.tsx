"use client";

import { useState } from "react";

type Row = {
  kodeAkun: string;
  namaAkun: string;
  saldoAwal: number;
  mutasiDebet: number;
  mutasiKredit: number;
  saldoAkhir: number;
};

function formatIDR(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(v || 0));
}

export default function NeracaHarianPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState<string>(today);
  const [rows, setRows] = useState<Row[]>([]);
  const [shuHarian, setShuHarian] = useState<number>(0);
  const [shuKumulatif, setShuKumulatif] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onTampilkan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = `/api/laporan/neraca-harian?tanggal=${encodeURIComponent(tanggal)}`;
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!res.ok) throw new Error(`Gagal memuat laporan (${res.status})`);
      const payload = await res.json();
      // Flexible parsing: support several shapes without mengubah kontrak BE
      const dataNode: any = payload?.data?.data ?? payload?.data ?? payload;
      const list: any[] = Array.isArray(dataNode?.rows) ? dataNode.rows : Array.isArray(dataNode) ? dataNode : [];
      const mapped: Row[] = list.map((it) => ({
        kodeAkun: String(it.kode_akun ?? it.kode ?? it.code ?? "-"),
        namaAkun: String(it.nama_akun ?? it.nama ?? it.name ?? "-"),
        saldoAwal: Number(it.saldo_awal ?? 0),
        mutasiDebet: Number(it.mutasi_debet ?? it.debet ?? it.debit ?? 0),
        mutasiKredit: Number(it.mutasi_kredit ?? it.kredit ?? 0),
        saldoAkhir: Number(it.saldo_akhir ?? 0),
      }));
      setRows(mapped);
      const shuH = Number(payload?.shu_harian ?? payload?.data?.shu_harian ?? dataNode?.shu_harian ?? 0);
      const shuK = Number(payload?.shu_kumulatif ?? payload?.data?.shu_kumulatif ?? dataNode?.shu_kumulatif ?? 0);
      setShuHarian(shuH);
      setShuKumulatif(shuK);
    } catch (e: any) {
      setError(e?.message || "Terjadi kesalahan saat mengambil data");
      setRows([]);
      setShuHarian(0);
      setShuKumulatif(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Laporan Neraca Saldo Harian</h1>
        <p className="text-sm text-muted-foreground">Pilih tanggal untuk melihat laporan neraca saldo harian.</p>
      </div>

      {/* FilterTanggal */}
      <form onSubmit={onTampilkan} className="flex items-end gap-3 flex-wrap">
        <div className="grid gap-1">
          <label className="text-sm">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-emerald-600 text-white px-3 text-sm disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Memuat..." : "Tampilkan Laporan"}
        </button>
        <button
          type="button"
          className="h-9 rounded-md border border-input px-3 text-sm"
          onClick={() => window.print()}
        >
          Cetak PDF
        </button>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* TabelNeraca dengan header bertingkat */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left" rowSpan={2}>Kode</th>
              <th className="px-3 py-2 text-left" rowSpan={2}>Akun</th>
              <th className="px-3 py-2 text-center" colSpan={2}>Saldo Awal</th>
              <th className="px-3 py-2 text-center" colSpan={2}>Mutasi {new Date(tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</th>
              <th className="px-3 py-2 text-center" colSpan={2}>Neraca Saldo</th>
            </tr>
            <tr>
              <th className="px-3 py-1 text-left">Debet</th>
              <th className="px-3 py-1 text-left">Kredit</th>
              <th className="px-3 py-1 text-left">Debet</th>
              <th className="px-3 py-1 text-left">Kredit</th>
              <th className="px-3 py-1 text-left">Debet</th>
              <th className="px-3 py-1 text-left">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">Memuat data...</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">Tidak ada transaksi pada tanggal ini.</td>
              </tr>
            )}
            {!loading && rows.map((r, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2">{r.kodeAkun}</td>
                <td className="px-3 py-2">{r.namaAkun}</td>
                {/* Saldo Awal dibagi Debet/Kredit berdasarkan tanda */}
                <td className="px-3 py-2 text-emerald-700">{formatIDR(r.saldoAwal >= 0 ? r.saldoAwal : 0)}</td>
                <td className="px-3 py-2 text-red-600">{formatIDR(r.saldoAwal < 0 ? Math.abs(r.saldoAwal) : 0)}</td>
                {/* Mutasi */}
                <td className="px-3 py-2">{formatIDR(r.mutasiDebet || 0)}</td>
                <td className="px-3 py-2">{formatIDR(r.mutasiKredit || 0)}</td>
                {/* Neraca Saldo dibagi Debet/Kredit */}
                <td className="px-3 py-2 text-emerald-700">{formatIDR(r.saldoAkhir >= 0 ? r.saldoAkhir : 0)}</td>
                <td className="px-3 py-2 text-red-600">{formatIDR(r.saldoAkhir < 0 ? Math.abs(r.saldoAkhir) : 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RingkasanSHU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">SHU Harian</div>
          <div className={`text-lg font-semibold ${shuHarian < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{formatIDR(shuHarian)}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">SHU Kumulatif</div>
          <div className={`text-lg font-semibold ${shuKumulatif < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{formatIDR(shuKumulatif)}</div>
        </div>
      </div>
    </div>
  );
}

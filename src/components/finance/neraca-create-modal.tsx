"use client";

import { useEffect, useMemo, useState } from 'react';
import AccountSelect from '@/components/account/account-select';
import { akunApi } from '@/lib/api-akun';
import { jurnalApi } from '@/lib/api-jurnal';
import { laporanApi } from '@/lib/api-laporan';
import type { NeracaResponse } from '@/types/laporan';

type Props = {
  tanggal: string;
  onClose: () => void;
  onSaved: () => void;
  neracaData?: NeracaResponse | null;
};

export default function NeracaCreateModal({ tanggal, onClose, onSaved, neracaData }: Props) {
  const [akunId, setAkunId] = useState<number | null>(null);
  const [akunLawanId, setAkunLawanId] = useState<number | null>(null);
  // Gunakan string untuk UX: input kosong ("") tidak menampilkan angka 0 yang mengganggu.
  const [saldoAwalD, setSaldoAwalD] = useState<string>('');
  const [saldoAwalK, setSaldoAwalK] = useState<string>('');
  const [mutasiD, setMutasiD] = useState<string>('');
  const [mutasiK, setMutasiK] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAwal, setCurrentAwal] = useState<{ d: number; k: number }>({ d: 0, k: 0 });

  // Cari akun default penyeimbang: coba kode 3-1300 (L/R Tahun Berjalan), jika tidak ada ambil akun tipe modal pertama.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await akunApi.list({ per_page: 200 });
        const rows: any[] = Array.isArray(res) ? res : res.data || [];
        let candidate = rows.find((a) => a.kode_akun === '3-1300');
        if (!candidate) candidate = rows.find((a) => a.tipe === 'modal');
        if (mounted && candidate) setAkunLawanId(candidate.id);
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  // Tampilkan saldo awal sesuai tabel neraca untuk akun terpilih
  useEffect(() => {
    let cancelled = false;
    async function syncSaldoAwal() {
      setCurrentAwal({ d: 0, k: 0 });
      if (!akunId) return;
      try {
        const akun = await akunApi.show(akunId);
        const kode = (akun as any)?.kode_akun as string | undefined;
        if (!kode) return;
        let data: NeracaResponse | null | undefined = neracaData;
        if (!data) {
          data = await laporanApi.getNeracaHarian(tanggal);
        }
        const row = data?.data?.find((r) => r.kode_akun === kode);
        if (!row) return;
        const awal = row.saldo_awal;
        const d = awal >= 0 ? awal : 0;
        const k = awal < 0 ? Math.abs(awal) : 0;
        if (!cancelled) setCurrentAwal({ d, k });
      } catch {}
    }
    syncSaldoAwal();
    return () => { cancelled = true };
  }, [akunId, tanggal, neracaData]);

  const neraca = useMemo(() => {
    const awal = (parseFloat(saldoAwalD) || 0) - (parseFloat(saldoAwalK) || 0);
    const mut = (parseFloat(mutasiD) || 0) - (parseFloat(mutasiK) || 0);
    const akhir = awal + mut;
    return akhir >= 0
      ? { debet: akhir, kredit: 0 }
      : { debet: 0, kredit: Math.abs(akhir) };
  }, [saldoAwalD, saldoAwalK, mutasiD, mutasiK]);

  async function submit() {
    setError(null);
    if (!akunId) { setError('Pilih akun terlebih dahulu'); return; }
    if (!akunLawanId) { setError('Pilih akun lawan (penyeimbang)'); return; }
    if (((parseFloat(saldoAwalD) || 0) > 0 && (parseFloat(saldoAwalK) || 0) > 0) ||
        ((parseFloat(mutasiD) || 0) > 0 && (parseFloat(mutasiK) || 0) > 0)) {
      setError('Debet/Kredit tidak boleh diisi bersamaan pada satu kelompok'); return;
    }
    setSaving(true);
    try {
      const jobs: Promise<any>[] = [];
      // Saldo awal → jurnal tanggal H-1
      if ((parseFloat(saldoAwalD) || 0) > 0 || (parseFloat(saldoAwalK) || 0) > 0) {
        const t = new Date(tanggal + 'T00:00:00');
        t.setDate(t.getDate() - 1);
        const tStr = t.toISOString().slice(0, 10);
        const isDebet = (parseFloat(saldoAwalD) || 0) > 0;
        const amt = isDebet ? (parseFloat(saldoAwalD) || 0) : (parseFloat(saldoAwalK) || 0);
        jobs.push(jurnalApi.create({
          tanggal: tStr,
          sumber: 'neraca-awal',
          keterangan: 'Input saldo awal via neraca',
          details: isDebet
            ? [ { akun_id: akunId, debet: amt }, { akun_id: akunLawanId, kredit: amt } ]
            : [ { akun_id: akunLawanId, debet: amt }, { akun_id: akunId, kredit: amt } ],
        }));
      }
      // Mutasi hari ini → jurnal tanggal H
      if ((parseFloat(mutasiD) || 0) > 0 || (parseFloat(mutasiK) || 0) > 0) {
        const isDebet = (parseFloat(mutasiD) || 0) > 0;
        const amt = isDebet ? (parseFloat(mutasiD) || 0) : (parseFloat(mutasiK) || 0);
        jobs.push(jurnalApi.create({
          tanggal,
          sumber: 'neraca-mutasi',
          keterangan: 'Input mutasi via neraca',
          details: isDebet
            ? [ { akun_id: akunId, debet: amt }, { akun_id: akunLawanId, kredit: amt } ]
            : [ { akun_id: akunLawanId, debet: amt }, { akun_id: akunId, kredit: amt } ],
        }));
      }
      await Promise.all(jobs);
      onSaved();
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-5xl rounded-xl bg-white shadow-xl border">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <h2 className="font-medium">Input Baris Neraca</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:underline">Tutup</button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="text-sm text-red-700">{error}</div>}
          <div className="grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Akun</span>
              <AccountSelect value={akunId} onChange={setAkunId} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Akun Lawan (penyeimbang)</span>
              <AccountSelect value={akunLawanId} onChange={setAkunLawanId} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="rounded-lg border p-4">
              <div className="text-sm font-medium mb-1">Saldo Awal (s/d H-1)</div>
              <div className="mb-2 text-xs text-muted-foreground">Saldo awal saat ini: 
                <span className="ml-1">Debet <span className="font-semibold text-emerald-700">{currentAwal.d.toLocaleString('id-ID')}</span></span>
                <span className="ml-3">Kredit <span className="font-semibold text-rose-700">{currentAwal.k.toLocaleString('id-ID')}</span></span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[420px] w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="px-3 py-2 text-right text-emerald-700">Debet</th>
                      <th className="px-3 py-2 text-right text-rose-700">Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          className="w-full rounded-md border px-3 py-2 text-right text-emerald-700"
                          value={saldoAwalD}
                          placeholder="0"
                          min={0}
                          step={0.01}
                          onFocus={(e) => { if (e.currentTarget.value === '0') setSaldoAwalD(''); }}
                          onChange={(e) => { const v = e.target.value; setSaldoAwalD(v); if (parseFloat(v) > 0) setSaldoAwalK(''); }}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          className="w-full rounded-md border px-3 py-2 text-right text-rose-700"
                          value={saldoAwalK}
                          placeholder="0"
                          min={0}
                          step={0.01}
                          onFocus={(e) => { if (e.currentTarget.value === '0') setSaldoAwalK(''); }}
                          onChange={(e) => { const v = e.target.value; setSaldoAwalK(v); if (parseFloat(v) > 0) setSaldoAwalD(''); }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Isi salah satu sisi saja untuk saldo awal (Debet atau Kredit).</p>
            </section>
            <section className="rounded-lg border p-4">
              <div className="text-sm font-medium mb-3">Mutasi Hari Ini</div>
              <div className="overflow-x-auto">
                <table className="min-w-[420px] w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="px-3 py-2 text-right text-emerald-700">Debet</th>
                      <th className="px-3 py-2 text-right text-rose-700">Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          className="w-full rounded-md border px-3 py-2 text-right text-emerald-700"
                          value={mutasiD}
                          placeholder="0"
                          min={0}
                          step={0.01}
                          onFocus={(e) => { if (e.currentTarget.value === '0') setMutasiD(''); }}
                          onChange={(e) => { const v = e.target.value; setMutasiD(v); if (parseFloat(v) > 0) setMutasiK(''); }}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          className="w-full rounded-md border px-3 py-2 text-right text-rose-700"
                          value={mutasiK}
                          placeholder="0"
                          min={0}
                          step={0.01}
                          onFocus={(e) => { if (e.currentTarget.value === '0') setMutasiK(''); }}
                          onChange={(e) => { const v = e.target.value; setMutasiK(v); if (parseFloat(v) > 0) setMutasiD(''); }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Isi salah satu sisi saja untuk mutasi hari ini (Debet atau Kredit).</p>
            </section>
          </div>

          <section className="rounded-md border p-3 bg-muted/30">
            <div className="text-sm font-medium mb-2">Neraca Saldo (otomatis)</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">Debet: <span className="font-semibold text-emerald-700">{neraca.debet.toLocaleString('id-ID')}</span></div>
              <div className="text-sm">Kredit: <span className="font-semibold text-rose-700">{neraca.kredit.toLocaleString('id-ID')}</span></div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
          <button onClick={onClose} className="rounded-md bg-muted px-3 py-2 text-sm">Batal</button>
          <button onClick={submit} disabled={saving} className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm disabled:opacity-50">{saving ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jurnalApi } from '@/lib/api-jurnal';
import JournalDetailsTable from '@/components/jurnal/journal-details-table';
import type { JurnalDetail } from '@/types/jurnal';

export default function JurnalCreatePage() {
  const router = useRouter();
  const [tanggal, setTanggal] = useState<string>('');
  const [noBukti, setNoBukti] = useState<string>('');
  const [sumber, setSumber] = useState<string>('manual');
  const [sumberId, setSumberId] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [details, setDetails] = useState<JurnalDetail[]>([{ akun_id: 0, debet: 0, kredit: 0 }, { akun_id: 0, debet: 0, kredit: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDebet = details.reduce((s, r) => s + (Number(r.debet) || 0), 0);
  const totalKredit = details.reduce((s, r) => s + (Number(r.kredit) || 0), 0);
  const balanced = Math.round((totalDebet - totalKredit) * 100) / 100 === 0 && details.length >= 2;

  async function submit() {
    setSaving(true); setError(null);
    try {
      if (!tanggal) { setError('Tanggal wajib diisi'); setSaving(false); return; }
      await jurnalApi.create({
        tanggal,
        no_bukti: noBukti || undefined,
        sumber: sumber || undefined,
        sumber_id: sumberId ? Number(sumberId) : undefined,
        keterangan: keterangan || undefined,
        details: details.map((d) => ({ akun_id: Number(d.akun_id), debet: Number(d.debet) || 0, kredit: Number(d.kredit) || 0 })),
      });
      router.push('/dashboard/jurnal');
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">Tambah Jurnal</h1>
      {error && <div className="text-sm text-red-700">{error}</div>}
      <div className="grid gap-3 max-w-3xl">
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Tanggal</span>
            <input type="date" className="rounded-md border px-3 py-2 text-sm" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">No Bukti</span>
            <input className="rounded-md border px-3 py-2 text-sm" value={noBukti} onChange={(e) => setNoBukti(e.target.value)} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Sumber</span>
            <input className="rounded-md border px-3 py-2 text-sm" value={sumber} onChange={(e) => setSumber(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Sumber ID</span>
            <input className="rounded-md border px-3 py-2 text-sm" value={sumberId} onChange={(e) => setSumberId(e.target.value)} />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm">Keterangan</span>
          <textarea className="rounded-md border px-3 py-2 text-sm" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
        </label>
      </div>

      <JournalDetailsTable rows={details} onChange={setDetails} />

      <div className="flex items-center gap-4">
        <div className="text-sm">Total Debet: <span className="font-medium">{totalDebet.toLocaleString()}</span></div>
        <div className="text-sm">Total Kredit: <span className="font-medium">{totalKredit.toLocaleString()}</span></div>
        <div className={`text-sm ${balanced ? 'text-emerald-700' : 'text-amber-700'}`}>{balanced ? 'Seimbang' : 'Tidak seimbang'}</div>
      </div>

      <div className="flex gap-2">
        <button className="rounded-md bg-gray-200 px-3 py-2 text-sm" onClick={() => history.back()}>Batal</button>
        <button disabled={!balanced || saving} className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm disabled:opacity-50" onClick={submit}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
      </div>
    </div>
  );
}


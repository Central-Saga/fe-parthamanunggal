"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { akunApi } from '@/lib/api-akun';

export default function AkunEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await akunApi.show(Number(id));
        setForm({
          kode_akun: data.kode_akun,
          nama_akun: data.nama_akun,
          tipe: data.tipe || '',
          saldo_normal: data.saldo_normal || '',
          status: !!data.status,
        });
      } catch (e: any) {
        setError(e?.message || 'Gagal memuat data');
      } finally { setLoading(false); }
    }
    load();
  }, [id]);

  async function submit() {
    setSaving(true); setError(null);
    try {
      await akunApi.update(Number(id), {
        kode_akun: form.kode_akun,
        nama_akun: form.nama_akun,
        tipe: (form.tipe || undefined) as any,
        saldo_normal: (form.saldo_normal || undefined) as any,
        status: !!form.status,
      });
      router.push('/dashboard/akun');
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="p-4">Memuat…</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">Edit Akun</h1>
      {error && <div className="text-sm text-red-700">{error}</div>}
      <div className="grid gap-3 max-w-xl">
        <label className="grid gap-1">
          <span className="text-sm">Kode Akun</span>
          <input className="rounded-md border px-3 py-2 text-sm" value={form.kode_akun || ''} onChange={(e) => setForm({ ...form, kode_akun: e.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Nama Akun</span>
          <input className="rounded-md border px-3 py-2 text-sm" value={form.nama_akun || ''} onChange={(e) => setForm({ ...form, nama_akun: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Tipe</span>
            <select className="rounded-md border px-3 py-2 text-sm" value={form.tipe || ''} onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
              <option value="">(kosong)</option>
              <option value="aset">aset</option>
              <option value="kewajiban">kewajiban</option>
              <option value="modal">modal</option>
              <option value="pendapatan">pendapatan</option>
              <option value="biaya">biaya</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Saldo Normal</span>
            <select className="rounded-md border px-3 py-2 text-sm" value={form.saldo_normal || ''} onChange={(e) => setForm({ ...form, saldo_normal: e.target.value })}>
              <option value="">(kosong)</option>
              <option value="debit">debit</option>
              <option value="kredit">kredit</option>
            </select>
          </label>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={!!form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} />
          <span className="text-sm">Aktif</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button className="rounded-md bg-gray-200 px-3 py-2 text-sm" onClick={() => history.back()}>Batal</button>
        <button disabled={saving} className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm disabled:opacity-50" onClick={submit}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
      </div>
    </div>
  );
}


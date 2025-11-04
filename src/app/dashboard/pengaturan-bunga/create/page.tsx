"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { JenisTabungan } from '@/types/jenis_tabungan';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CreatePengaturanBungaPage() {
  const router = useRouter();
  const [jenis, setJenis] = useState<JenisTabungan[]>([]);
  const [jenisId, setJenisId] = useState<number | ''>('' as any);
  const [value, setValue] = useState<string>('');
  const [periode, setPeriode] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiRequest<JenisTabungan[] | { data: JenisTabungan[] }>('GET', '/api/jenis-tabungans')
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? []);
        if (mounted) setJenis(list ?? []);
      })
      .catch(() => {});
    return () => { mounted = false };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!jenisId) return setError('Jenis tabungan wajib dipilih');
    const numVal = Number(value);
    if (!Number.isFinite(numVal) || numVal < 0) return setError('Rasio harus angka >= 0');
    setLoading(true);
    try {
      await apiRequest('POST', '/api/pengaturans', {
        nama_setting: 'bunga',
        jenis_setting: 'interest',
        jenis_tabungan_id: Number(jenisId),
        periode_berlaku: periode || null,
        value: String(numVal), // ratio, e.g. 0.02
        keterangan: keterangan || null,
      });
      router.push('/dashboard/pengaturan-bunga');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal menyimpan';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Tambah Pengaturan Bunga</h1>
      <p className="text-sm text-muted-foreground mb-4">Value dalam rasio, contoh 0.02 = 2%</p>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 max-w-xl">
            <div className="grid gap-1">
              <label className="text-sm">Jenis Tabungan</label>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={jenisId}
                onChange={(e) => setJenisId(Number(e.target.value))}
                required
              >
                <option value="">Pilih jenis tabungan</option>
                {jenis.map((j) => (
                  <option key={j.id} value={j.id}>{j.nama}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Rasio</label>
              <Input placeholder="0.02 = 2%" value={value} onChange={(e) => setValue(e.target.value)} required />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Periode Berlaku (opsional)</label>
              <Input type="date" value={periode} onChange={(e) => setPeriode(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Keterangan</label>
              <Input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


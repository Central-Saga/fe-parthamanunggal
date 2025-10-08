"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { JenisTabungan } from '@/types/jenis_tabungan';
import type { Pengaturan } from '@/types/pengaturan';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EditPengaturanBungaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [jenis, setJenis] = useState<JenisTabungan[]>([]);
  const [jenisId, setJenisId] = useState<number | ''>('' as any);
  const [value, setValue] = useState<string>('');
  const [periode, setPeriode] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [jenisRes, dataRes] = await Promise.all([
          apiRequest<JenisTabungan[] | { data: JenisTabungan[] }>('GET', '/api/jenis-tabungans'),
          apiRequest<Pengaturan | { data: Pengaturan }>('GET', `/api/pengaturans/${id}`),
        ]);
        const jenisList = Array.isArray(jenisRes) ? jenisRes : ((jenisRes as any)?.data ?? []);
        const p: Pengaturan = (dataRes as any)?.data ? (dataRes as any).data : (dataRes as any);
        if (!mounted) return;
        setJenis(jenisList ?? []);
        setJenisId(p.jenis_tabungan_id as unknown as number);
        setValue(String(p.value ?? ''));
        setPeriode(String(p.periode_berlaku ?? ''));
        setKeterangan(String(p.keterangan ?? ''));
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => { mounted = false };
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!jenisId) return setError('Jenis tabungan wajib dipilih');
    const numVal = Number(value);
    if (!Number.isFinite(numVal) || numVal < 0) return setError('Rasio harus angka >= 0');
    setLoading(true);
    try {
      await apiRequest('PUT', `/api/pengaturans/${id}`, {
        nama_setting: 'bunga',
        jenis_setting: 'interest',
        jenis_tabungan_id: Number(jenisId),
        periode_berlaku: periode || null,
        value: String(numVal),
        keterangan: keterangan || null,
      });
      router.push('/dashboard/pengaturan-bunga');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal memperbarui';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Edit Pengaturan Bunga</h1>
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


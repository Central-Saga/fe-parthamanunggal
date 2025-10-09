'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Tabungan } from '@/types/tabungan';
import { catatTabunganColumns } from './columns';
import { getTabunganJenisIdFromEnv, getTabunganJenisIdRuntime, resolveTabunganJenisId } from '@/lib/jenisTabungan';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CatatTabunganDataTable() {
  const envId = getTabunganJenisIdFromEnv('harian');
  const initial = envId ? `/api/tabungans?jenis_tabungan_id=${envId}` : '/api/tabungans';
  const [url, setUrl] = useState<string>(initial);
  const [modalOpen, setModalOpen] = useState<false | 'tambah' | 'kurang'>(false);
  const [selected, setSelected] = useState<Tabungan | null>(null);
  const [tanggal, setTanggal] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [nominal, setNominal] = useState<string>('');
  const [ket, setKet] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSaldo = useMemo(() => Number(selected?.saldo || 0), [selected]);
  const nominalNum = useMemo(() => Number(nominal || 0), [nominal]);
  const invalid = !Number.isFinite(nominalNum) || nominalNum <= 0 || (modalOpen === 'kurang' && nominalNum > currentSaldo);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const runtimeId = await getTabunganJenisIdRuntime('harian');
      const id = envId ?? runtimeId ?? (await resolveTabunganJenisId('harian'));
      const built = id ? `/api/tabungans?jenis_tabungan_id=${id}` : '/api/tabungans';
      if (mounted) setUrl(built);
    }
    set();
    return () => { mounted = false };
  }, [envId]);

  function openTambah(row: Tabungan) {
    setSelected(row);
    setModalOpen('tambah');
    setTanggal(new Date().toISOString().slice(0,10));
    setNominal('');
    setKet('');
    setError(null);
  }
  function openKurang(row: Tabungan) {
    setSelected(row);
    setModalOpen('kurang');
    setTanggal(new Date().toISOString().slice(0,10));
    setNominal('');
    setKet('');
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !modalOpen) return;
    setLoading(true);
    setError(null);
    const tipe = modalOpen === 'tambah' ? 'setor' : 'tarik';
    const beforeSaldo = Number(selected.saldo || 0);
    try {
      try {
        await apiRequest('POST', '/api/transaksi-tabungans', {
          tabungan_id: selected.id,
          tipe,
          nominal: nominalNum,
          tanggal,
          keterangan: ket || null,
          status: 'Aktif',
        });
      } catch {}
      try {
        const newSaldo = tipe === 'setor' ? beforeSaldo + nominalNum : beforeSaldo - nominalNum;
        await apiRequest('PUT', `/api/tabungans/${selected.id}`, { ...selected, saldo: newSaldo } as any);
      } catch {}
      // update table by forcing reload
      setUrl((prev) => prev.replace(/([?&])r=\d+/, '$1') + (prev.includes('?') ? '&' : '?') + `r=${Date.now()}`);
      // append local log for that tabungan id to show later in detail page
      try {
        const key = `saldo_logs_${selected.id}`;
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const entry = {
          id: Date.now(),
          tanggal,
          aksi: modalOpen === 'tambah' ? 'tambah_saldo' : 'kurangi_saldo',
          dari: beforeSaldo,
          ke: modalOpen === 'tambah' ? beforeSaldo + nominalNum : beforeSaldo - nominalNum,
          nominal: nominalNum,
          keterangan: ket || null,
        };
        const next = [entry, ...((Array.isArray(arr) ? arr : []) as any[])];
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      setModalOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StandardDataTable<Tabungan>
        columns={catatTabunganColumns}
        listUrl={url}
        createHref={"/dashboard/tabungan/harian/create"}
        createLabel="Tambah Tabungan Harian"
        searchPlaceholder="Cari tabungan harian..."
        emptyText="Belum ada tabungan harian"
        meta={{ onTambah: openTambah, onKurang: openKurang }}
      />

      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">{modalOpen === 'tambah' ? 'Tambah Saldo' : 'Kurangi Saldo'}</h2>
            <div className="text-sm text-muted-foreground mb-2">Tabungan ID: {String(selected.id)} • Saldo saat ini: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(selected.saldo || 0))}</div>
            <form className="grid gap-3" onSubmit={onSubmit}>
              <div className="grid gap-1">
                <label className="text-sm">Nominal</label>
                <Input type="number" step="0.01" min="0" value={nominal} onChange={(e) => setNominal(e.target.value)} placeholder="100000" />
                {nominal && invalid && (
                  <div className="text-xs text-red-600">{!Number.isFinite(nominalNum) || nominalNum <= 0 ? 'Nominal harus lebih dari 0' : 'Nominal melebihi saldo saat ini'}</div>
                )}
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Tanggal</label>
                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Keterangan (opsional)</label>
                <Input value={ket} onChange={(e) => setKet(e.target.value)} placeholder={modalOpen === 'tambah' ? 'Setoran manual' : 'Penarikan manual'} />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex items-center gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading || invalid}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

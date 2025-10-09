"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { Tabungan } from '@/types/tabungan';
import type { BungaTabungan } from '@/types/bunga_tabungan';
import type { TransaksiTabungan } from '@/types/transaksi_tabungan';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ApiList<T> = { data: T } | T;

type SaldoLogEntry = {
  id: number;
  tanggal: string; // ISO date
  aksi: 'tambah_saldo' | 'kurangi_saldo';
  dari: number;
  ke: number;
  nominal: number;
  keterangan?: string | null;
};

function formatIDR(n: number | string) {
  const v = typeof n === 'string' ? Number(n) : n;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(v || 0));
}

function formatDDMMYYYY(s: string): string {
  // Handle plain date-only string to avoid timezone shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function lastDayOfMonth(year: number, month: number) {
  // month 1-12
  return new Date(year, month, 0).getDate();
}

export default function TabunganDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [tabungan, setTabungan] = useState<Tabungan | null>(null);
  const [bunga, setBunga] = useState<BungaTabungan[]>([]);
  const [trx, setTrx] = useState<TransaksiTabungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bunga' | 'transaksi'>('bunga');
  const [anggotaTabungan, setAnggotaTabungan] = useState<Tabungan[] | null>(null);
  const totalSaldoAnggota = useMemo(() => {
    if (!anggotaTabungan) return null;
    try {
      return anggotaTabungan.reduce((sum, t) => sum + Number(t.saldo || 0), 0);
    } catch {
      return null;
    }
  }, [anggotaTabungan]);
  const [filterYear, setFilterYear] = useState<number | ''>('' as any);
  const [filterMonth, setFilterMonth] = useState<number | ''>('' as any);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genOk, setGenOk] = useState<string | null>(null);
  // Anggap endpoint tersedia; jika submit gagal 404, kita akan tandai false
  const [triggerAvailable, setTriggerAvailable] = useState<boolean | null>(true);
  const [showAddSaldo, setShowAddSaldo] = useState(false);
  const [showSubSaldo, setShowSubSaldo] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addNominal, setAddNominal] = useState<string>('');
  const [addTanggal, setAddTanggal] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [addKet, setAddKet] = useState<string>('');
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [subNominal, setSubNominal] = useState<string>('');
  const [subTanggal, setSubTanggal] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [subKet, setSubKet] = useState<string>('');
  // Derived guards
  const currentSaldo = useMemo(() => Number(tabungan?.saldo || 0), [tabungan]);
  const addNominalNum = useMemo(() => Number(addNominal || 0), [addNominal]);
  const isAddInvalid = !Number.isFinite(addNominalNum) || addNominalNum <= 0;
  const subNominalNum = useMemo(() => Number(subNominal || 0), [subNominal]);
  const isSubInvalid = !Number.isFinite(subNominalNum) || subNominalNum <= 0;
  const isSubExceeds = subNominalNum > currentSaldo;
  const [saldoLogs, setSaldoLogs] = useState<SaldoLogEntry[]>([]);

  // Load/save saldo logs from localStorage to persist across refreshes (per tabungan id)
  useEffect(() => {
    try {
      const key = `saldo_logs_${id}`;
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      const arr = raw ? JSON.parse(raw) : [];
      setSaldoLogs(Array.isArray(arr) ? arr : []);
    } catch {
      setSaldoLogs([]);
    }
  }, [id]);

  useEffect(() => {
    try {
      const key = `saldo_logs_${id}`;
      if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(saldoLogs));
    } catch {}
  }, [saldoLogs, id]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [tRes, bRes, xRes] = await Promise.all([
          apiRequest<Tabungan | { data: Tabungan }>('GET', `/api/tabungans/${id}`),
          apiRequest<ApiList<BungaTabungan[]>>('GET', `/api/bunga-tabungans/tabungan/${id}`),
          apiRequest<ApiList<TransaksiTabungan[]>>('GET', `/api/transaksi-tabungans/tabungan/${id}`),
        ]);
        const t: Tabungan = (tRes as any)?.data ? (tRes as any).data : (tRes as any);
        const bungaList = Array.isArray(bRes) ? bRes : ((bRes as any)?.data ?? (bRes as any));
        const trxList = Array.isArray(xRes) ? xRes : ((xRes as any)?.data ?? (xRes as any));
        if (!mounted) return;
        setTabungan(t);
        setBunga(bungaList ?? []);
        setTrx(trxList ?? []);

        // Load all tabungan for same anggota to compute aggregate saldo
        try {
          let listRes: any;
          try {
            listRes = await apiRequest<Tabungan[] | { data: Tabungan[] }>('GET', `/api/tabungans?anggota_id=${t.anggota_id}`);
          } catch {
            listRes = await apiRequest<Tabungan[] | { data: Tabungan[] }>('GET', `/api/tabungans`);
          }
          const list: Tabungan[] = Array.isArray(listRes) ? listRes : ((listRes as any)?.data ?? []);
          const own = list.filter((it) => Number(it.anggota_id) === Number(t.anggota_id));
          if (mounted) setAnggotaTabungan(own);
        } catch {
          if (mounted) setAnggotaTabungan(null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Gagal memuat');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [id]);

  const filteredBunga = useMemo(() => {
    return bunga.filter((b) => {
      if (filterYear && b.tahun !== Number(filterYear)) return false;
      if (filterMonth && b.bulan !== Number(filterMonth)) return false;
      return true;
    });
  }, [bunga, filterYear, filterMonth]);

  function renderBungaRow(b: BungaTabungan) {
    const sal = formatIDR(b.saldo_minimum);
    // BE might store 0.02 or 2 — try to present as %
    const raw = Number(b.persentase);
    const pct = isFinite(raw) ? (raw <= 1 ? raw * 100 : raw) : 0;
    const jumlah = formatIDR(b.jumlah_bunga);
    const created = formatDDMMYYYY(b.created_at);
    return (
      <tr key={b.id}>
        <td className="px-3 py-2">{b.bulan}/{b.tahun}</td>
        <td className="px-3 py-2">{sal}</td>
        <td className="px-3 py-2">{pct}%</td>
        <td className="px-3 py-2">{jumlah}</td>
        <td className="px-3 py-2">{(b as any).status ?? '-'}</td>
        <td className="px-3 py-2">{created}</td>
      </tr>
    );
  }

  async function onSubSaldoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubError(null);
    const nominal = Number(subNominal);
    if (!Number.isFinite(nominal) || nominal <= 0) {
      setSubError('Nominal harus > 0');
      return;
    }
    const beforeSaldo = Number(tabungan?.saldo || 0);
    if (nominal > beforeSaldo) {
      setSubError('Nominal melebihi saldo saat ini');
      return;
    }
    setSubLoading(true);
    try {
      // Buat transaksi tarik; jika gagal, lanjutkan update saldo langsung
      try {
        await apiRequest('POST', '/api/transaksi-tabungans', {
          tabungan_id: id,
          tipe: 'tarik',
          nominal,
          tanggal: subTanggal,
          keterangan: subKet || null,
          status: 'Aktif',
        });
      } catch {}
      // Update saldo tabungan agar konsisten dengan perubahan
      try {
        const newSaldo = beforeSaldo - nominal;
        await apiRequest('PUT', `/api/tabungans/${id}`, {
          ...tabungan,
          saldo: newSaldo,
        } as any);
      } catch {}
      // Optimistic UI update
      setTabungan((prev) => (prev ? { ...prev, saldo: Number(prev.saldo || 0) - nominal } : prev));
      setAnggotaTabungan((prev) => {
        if (!prev) return prev;
        return prev.map((t) => (Number(t.id) === Number(id) ? { ...t, saldo: Number(t.saldo || 0) - nominal } as Tabungan : t));
      });
      setTrx((prev) => [
        {
          id: Math.floor(Date.now() % 2147483647),
          tabungan_id: id,
          tipe: 'tarik',
          nominal: String(nominal),
          tanggal: subTanggal,
          keterangan: subKet || 'Kurangi saldo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as TransaksiTabungan,
        ...prev,
      ]);
      // Append saldo change log
      setSaldoLogs((prev) => [
        {
          id: Date.now(),
          tanggal: subTanggal,
          aksi: 'kurangi_saldo',
          dari: beforeSaldo,
          ke: beforeSaldo - nominal,
          nominal,
          keterangan: subKet || null,
        },
        ...prev,
      ]);
      
      setSubNominal('');
      setSubKet('');
      // Re-fetch minimal: current tabungan and transaksi
      try {
        const tRes = await apiRequest<Tabungan | { data: Tabungan }>('GET', `/api/tabungans/${id}`);
        const t: Tabungan = (tRes as any)?.data ? (tRes as any).data : (tRes as any);
        setTabungan(t);
        if (t?.anggota_id) {
          try {
            const listRes = await apiRequest<Tabungan[] | { data: Tabungan[] }>('GET', `/api/tabungans?anggota_id=${t.anggota_id}`);
            const list: Tabungan[] = Array.isArray(listRes) ? listRes : ((listRes as any)?.data ?? []);
            const own = list.filter((it) => Number(it.anggota_id) === Number(t.anggota_id));
            setAnggotaTabungan(own);
          } catch {}
        }
        const xRes = await apiRequest<ApiList<TransaksiTabungan[]>>('GET', `/api/transaksi-tabungans/tabungan/${id}`);
        const trxList = Array.isArray(xRes) ? xRes : ((xRes as any)?.data ?? (xRes as any));
        setTrx(trxList ?? []);
      } catch {}
    } catch (e: any) {
      setSubError(e?.response?.data?.message || e?.message || 'Gagal mengurangi saldo');
    } finally {
      setSubLoading(false);
    }
  }
  function isBungaTrx(t: TransaksiTabungan): boolean {
    // Prefer explicit link from backend when available
    if (t.saving_interest_id && Number(t.saving_interest_id) > 0) return true;
    // Fallbacks for older payloads: setor at EOM or keterangan contains marker
    if (String(t.tipe).toLowerCase() !== 'setor') return false;
    if (t.keterangan && /bunga\s+bulanan/i.test(t.keterangan)) return true;
    const d = new Date(t.tanggal);
    if (Number.isNaN(d.getTime())) return false;
    const day = d.getDate();
    const last = lastDayOfMonth(d.getFullYear(), d.getMonth() + 1);
    return day === last;
  }

  async function onGenerateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const month = Number((form.elements.namedItem('month') as HTMLInputElement).value);
    const year = Number((form.elements.namedItem('year') as HTMLInputElement).value);
    if (!month || !year) return;
    setGenLoading(true);
    setGenError(null);
    setGenOk(null);
    try {
      const res = await apiRequest<{ message?: string; processed?: number; skipped?: number; details?: any[] }>(
        'POST',
        `/api/internal/interest/run`,
        { month, year, saving: id }
      );
      const msg = `${res?.message ?? 'OK'} — diproses: ${res?.processed ?? 0}${typeof res?.skipped === 'number' ? `, dilewati: ${res.skipped}` : ''}`;
      setGenOk(msg);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) {
        setTriggerAvailable(false);
        setGenError('Endpoint belum tersedia. Jalankan trigger via CLI di backend.');
      } else {
        setGenError(e?.response?.data?.message || e?.message || 'Gagal memproses');
      }
    } finally {
      setGenLoading(false);
    }
  }

  async function onAddSaldoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    const nominal = Number(addNominal);
    if (!Number.isFinite(nominal) || nominal <= 0) {
      setAddError('Nominal harus > 0');
      return;
    }
    const beforeSaldo = Number(tabungan?.saldo || 0);
    setAddLoading(true);
    try {
      // Buat transaksi setor; jika gagal, tetap lanjut update saldo
      try {
        await apiRequest('POST', '/api/transaksi-tabungans', {
          tabungan_id: id,
          tipe: 'setor',
          nominal,
          tanggal: addTanggal,
          keterangan: addKet || null,
          status: 'Aktif',
        });
      } catch {}
      // Update saldo tabungan agar konsisten dengan perubahan
      try {
        const newSaldo = beforeSaldo + nominal;
        await apiRequest('PUT', `/api/tabungans/${id}`, {
          ...tabungan,
          saldo: newSaldo,
        } as any);
      } catch {}
      // Optimistic UI update for immediate feedback
      setTabungan((prev) => (prev ? { ...prev, saldo: Number(prev.saldo || 0) + nominal } : prev));
      setAnggotaTabungan((prev) => {
        if (!prev) return prev;
        return prev.map((t) => (Number(t.id) === Number(id) ? { ...t, saldo: Number(t.saldo || 0) + nominal } as Tabungan : t));
      });
      setTrx((prev) => [
        {
          id: Math.floor(Date.now() % 2147483647),
          tabungan_id: id,
          tipe: 'setor',
          nominal: String(nominal),
          tanggal: addTanggal,
          keterangan: addKet || 'Tambah saldo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as TransaksiTabungan,
        ...prev,
      ]);
      // Append saldo change log
      setSaldoLogs((prev) => [
        {
          id: Date.now(),
          // Simpan sesuai tanggal yang dipilih di form
          tanggal: addTanggal,
          aksi: 'tambah_saldo',
          dari: beforeSaldo,
          ke: beforeSaldo + nominal,
          nominal,
          keterangan: addKet || null,
        },
        ...prev,
      ]);
      // Reload data from server to ensure consistency
      
      setAddNominal('');
      setAddKet('');
      // Re-fetch minimal: current tabungan and transaksi
      try {
        const tRes = await apiRequest<Tabungan | { data: Tabungan }>('GET', `/api/tabungans/${id}`);
        const t: Tabungan = (tRes as any)?.data ? (tRes as any).data : (tRes as any);
        setTabungan(t);
        // refresh anggota aggregation
        if (t?.anggota_id) {
          try {
            const listRes = await apiRequest<Tabungan[] | { data: Tabungan[] }>('GET', `/api/tabungans?anggota_id=${t.anggota_id}`);
            const list: Tabungan[] = Array.isArray(listRes) ? listRes : ((listRes as any)?.data ?? []);
            const own = list.filter((it) => Number(it.anggota_id) === Number(t.anggota_id));
            setAnggotaTabungan(own);
          } catch {}
        }
        const xRes = await apiRequest<ApiList<TransaksiTabungan[]>>('GET', `/api/transaksi-tabungans/tabungan/${id}`);
        const trxList = Array.isArray(xRes) ? xRes : ((xRes as any)?.data ?? (xRes as any));
        setTrx(trxList ?? []);
      } catch {}
    } catch (e: any) {
      setAddError(e?.response?.data?.message || e?.message || 'Gagal menambah saldo');
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Detail Tabungan</h1>
      {loading && <div>Memuat...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {tabungan && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Saldo</div>
                <div className="text-lg font-semibold">{formatIDR(totalSaldoAnggota ?? tabungan.saldo)}</div>
                {totalSaldoAnggota != null && (
                  <div className="text-xs text-muted-foreground">Total saldo semua tabungan anggota ini</div>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Jenis</div>
                <div className="text-lg">{String(tabungan.jenis_tabungan_id)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-lg">{Number(tabungan.status) === 1 ? 'Aktif' : 'Non Aktif'}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={showAddSaldo ? 'outline' : 'default'}
                  onClick={() => { setShowAddSaldo((v) => !v); if (!showAddSaldo) setShowSubSaldo(false); }}
                >
                  {showAddSaldo ? 'Tutup Form Tambah Saldo' : 'Tambah Saldo'}
                </Button>
                <Button
                  variant={showSubSaldo ? 'outline' : 'secondary'}
                  onClick={() => { setShowSubSaldo((v) => !v); if (!showSubSaldo) setShowAddSaldo(false); }}
                >
                  {showSubSaldo ? 'Tutup Form Kurangi Saldo' : 'Kurangi Saldo'}
                </Button>
              </div>
            </div>
            {showAddSaldo && (
              <form className="mt-4 grid gap-3 max-w-xl" onSubmit={onAddSaldoSubmit}>
                <div className="grid gap-1">
                  <label className="text-sm">Nominal</label>
                  <Input type="number" step="0.01" min="0" value={addNominal} onChange={(e) => setAddNominal(e.target.value)} placeholder="100000" />
                  {addNominal && isAddInvalid && (
                    <div className="text-xs text-red-600">Nominal harus lebih dari 0</div>
                  )}
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Tanggal</label>
                  <Input type="date" value={addTanggal} onChange={(e) => setAddTanggal(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Keterangan (opsional)</label>
                  <Input value={addKet} onChange={(e) => setAddKet(e.target.value)} placeholder="Setoran manual" />
                </div>
                {addError && <div className="text-sm text-red-600">{addError}</div>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={addLoading || isAddInvalid}>{addLoading ? 'Menyimpan...' : 'Simpan'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowAddSaldo(false); setAddError(null); }}>Batal</Button>
                </div>
              </form>
            )}
            {showSubSaldo && (
              <form className="mt-4 grid gap-3 max-w-xl" onSubmit={onSubSaldoSubmit}>
                <div className="grid gap-1">
                  <label className="text-sm">Nominal</label>
                  <Input type="number" step="0.01" min="0" value={subNominal} onChange={(e) => setSubNominal(e.target.value)} placeholder="100000" />
                  <div className="text-xs text-muted-foreground">Saldo saat ini: {formatIDR(currentSaldo)}</div>
                  {subNominal && isSubInvalid && (
                    <div className="text-xs text-red-600">Nominal harus lebih dari 0</div>
                  )}
                  {!isSubInvalid && isSubExceeds && (
                    <div className="text-xs text-red-600">Nominal melebihi saldo saat ini</div>
                  )}
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Tanggal</label>
                  <Input type="date" value={subTanggal} onChange={(e) => setSubTanggal(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Keterangan (opsional)</label>
                  <Input value={subKet} onChange={(e) => setSubKet(e.target.value)} placeholder="Penarikan manual" />
                </div>
                {subError && <div className="text-sm text-red-600">{subError}</div>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={subLoading || isSubInvalid || isSubExceeds}>{subLoading ? 'Menyimpan...' : 'Simpan'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowSubSaldo(false); setSubError(null); }}>Batal</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border p-3 bg-amber-50 text-amber-900">
        Bunga dihitung dari saldo akhir bulan dua bulan sebelumnya
      </div>

      <div className="flex items-center gap-2">
        <Button variant={activeTab === 'bunga' ? 'default' : 'outline'} onClick={() => setActiveTab('bunga')}>Bunga Bulanan</Button>
        <Button variant={activeTab === 'transaksi' ? 'default' : 'outline'} onClick={() => setActiveTab('transaksi')}>Transaksi</Button>
      </div>

      {activeTab === 'bunga' && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="grid gap-1">
                <label className="text-sm">Tahun</label>
                <input className="h-9 rounded-md border border-input bg-background px-3 text-sm w-32" type="number" min={2000} value={filterYear as any} onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : ('' as any))} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Bulan</label>
                <input className="h-9 rounded-md border border-input bg-background px-3 text-sm w-32" type="number" min={1} max={12} value={filterMonth as any} onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : ('' as any))} />
              </div>
              <Button variant="outline" onClick={() => { setFilterYear('' as any); setFilterMonth('' as any); }}>Reset</Button>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Bulan/Tahun</th>
                    <th className="px-3 py-2 text-left">Saldo Minimum</th>
                    <th className="px-3 py-2 text-left">Persentase</th>
                    <th className="px-3 py-2 text-left">Jumlah Bunga</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBunga.map(renderBungaRow)}
                  {filteredBunga.length === 0 && (
                    <tr><td className="px-3 py-4 text-muted-foreground" colSpan={6}>Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2">
              <form className="flex items-end gap-3 flex-wrap" onSubmit={onGenerateSubmit}>
                <div className="grid gap-1">
                  <label className="text-sm">Bulan</label>
                  <input name="month" type="number" min={1} max={12} className="h-9 rounded-md border border-input bg-background px-3 text-sm w-32" />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Tahun</label>
                  <input name="year" type="number" min={2000} className="h-9 rounded-md border border-input bg-background px-3 text-sm w-32" />
                </div>
                <Button type="submit" disabled={genLoading || triggerAvailable === false}>
                  {triggerAvailable === false ? 'Generate Bunga (Endpoint belum tersedia)' : (genLoading ? 'Memproses...' : 'Generate Bunga')}
                </Button>
              </form>
              {genError && <div className="text-sm text-red-600 mt-2">{genError}</div>}
              {genOk && <div className="text-sm text-emerald-700 mt-2">{genOk}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'transaksi' && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Tipe</th>
                    <th className="px-3 py-2 text-left">Nominal</th>
                    <th className="px-3 py-2 text-left">Tanggal</th>
                    <th className="px-3 py-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {trx.map((t) => (
                    <tr key={t.id} className={isBungaTrx(t) ? 'bg-emerald-50' : ''}>
                      <td className="px-3 py-2">{t.tipe}{isBungaTrx(t) ? ' • Bunga Bulanan' : ''}</td>
                      <td className="px-3 py-2">{formatIDR(t.nominal)}</td>
                      <td className="px-3 py-2">{formatDDMMYYYY(t.tanggal)}</td>
                      <td className="px-3 py-2">{t.keterangan || '-'}</td>
                    </tr>
                  ))}
                  {trx.length === 0 && (
                    <tr><td className="px-3 py-4 text-muted-foreground" colSpan={4}>Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Riwayat Saldo</h2>
                <p className="text-sm text-muted-foreground">Setiap penambahan mengikuti tanggal yang dipilih pada form Tambah Saldo.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    const key = `saldo_logs_${id}`;
                    if (typeof window !== 'undefined') localStorage.removeItem(key);
                  } catch {}
                  setSaldoLogs([]);
                }}
              >
                Hapus Riwayat Lokal
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Tanggal</th>
                  <th className="px-3 py-2 text-left">Aksi</th>
                  <th className="px-3 py-2 text-left">Dari</th>
                  <th className="px-3 py-2 text-left">Ke</th>
                  <th className="px-3 py-2 text-left">Nominal</th>
                  <th className="px-3 py-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {saldoLogs.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2">{formatDDMMYYYY(l.tanggal)}</td>
                    <td className="px-3 py-2">{l.aksi === 'tambah_saldo' ? 'Tambah Saldo' : 'Kurangi Saldo'}</td>
                    <td className="px-3 py-2">{formatIDR(l.dari)}</td>
                    <td className="px-3 py-2">{formatIDR(l.ke)}</td>
                    <td className="px-3 py-2">{formatIDR(l.nominal)}</td>
                    <td className="px-3 py-2">{l.keterangan || '-'}</td>
                  </tr>
                ))}
                {saldoLogs.length === 0 && (
                  <tr><td className="px-3 py-4 text-muted-foreground" colSpan={6}>Belum ada perubahan saldo</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

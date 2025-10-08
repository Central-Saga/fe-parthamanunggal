"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { Tabungan } from '@/types/tabungan';
import type { BungaTabungan } from '@/types/bunga_tabungan';
import type { TransaksiTabungan } from '@/types/transaksi_tabungan';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isInterestTriggerEnabled } from '@/lib/config';

type ApiList<T> = { data: T } | T;

function formatIDR(n: number | string) {
  const v = typeof n === 'string' ? Number(n) : n;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(v || 0));
}

function formatDDMMYYYY(s: string): string {
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
  const [filterYear, setFilterYear] = useState<number | ''>('' as any);
  const [filterMonth, setFilterMonth] = useState<number | ''>('' as any);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genOk, setGenOk] = useState<string | null>(null);
  const [triggerAvailable, setTriggerAvailable] = useState<boolean | null>(null);

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
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Gagal memuat');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    // probe trigger availability only if feature enabled
    if (isInterestTriggerEnabled()) {
      (async () => {
        try {
          await apiRequest('POST', '/api/internal/interest/run?month=1&year=2000', {});
          setTriggerAvailable(true);
        } catch {
          setTriggerAvailable(false);
        }
      })();
    } else {
      setTriggerAvailable(false);
    }
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

  function isBungaTrx(t: TransaksiTabungan): boolean {
    if (String(t.tipe).toLowerCase() !== 'setor') return false;
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
      const q = `?month=${month}&year=${year}&saving=${id}`;
      const res = await apiRequest<{ message?: string; processed?: number }>('POST', `/api/internal/interest/run${q}`, {});
      setGenOk(res?.message ?? `Diproses: ${res?.processed ?? 0}`);
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
                <div className="text-lg font-semibold">{formatIDR(tabungan.saldo)}</div>
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

            {isInterestTriggerEnabled() && (
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
            )}
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
    </div>
  );
}

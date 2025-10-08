"use client";

import { useMemo, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PermissionGate from '@/components/permission-gate';

export default function GenerateBungaPage() {
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [savingId, setSavingId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [summary, setSummary] = useState<{ processed?: number; skipped?: number; details?: Array<any> } | null>(null);

  function lastDayOfMonth(y: number, m: number) {
    return new Date(y, m, 0).getDate();
  }

  function fmt(d: Date) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  const acuanDate = (() => {
    const d = new Date(year, month - 1, 1);
    d.setMonth(d.getMonth() - 2);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return new Date(y, m - 1, lastDayOfMonth(y, m));
  })();

  const postingDate = new Date(year, month - 1, lastDayOfMonth(year, month));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);
    const m = Number(month);
    const y = Number(year);
    if (!m || !y) {
      setLoading(false);
      setError('Bulan dan Tahun wajib diisi');
      return;
    }
    try {
      const body: any = { month: m, year: y };
      if (savingId) body.saving = Number(savingId);
      const res = await apiRequest<{ message?: string; processed?: number; skipped?: number; details?: Array<any> }>(
        'POST',
        `/api/internal/interest/run`,
        body
      );
      setOk(res?.message ?? 'OK');
      setSummary({ processed: res?.processed, skipped: res?.skipped, details: res?.details });
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setDisabled(true);
        setError('Endpoint belum tersedia. Jalankan trigger via CLI backend.');
      } else {
        setError(e?.response?.data?.message || e?.message || 'Gagal men-trigger');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGate required={["mengelola bunga"]}>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Generate Bunga</h1>
          <p className="text-sm text-muted-foreground">Admin: jalankan perhitungan bunga untuk bulan/tahun tertentu.</p>
          <p className="text-xs text-muted-foreground mt-1">Catatan: Perhitungan memakai saldo akhir bulan dua bulan sebelumnya (M−2). Transaksi bunga akan diposting pada periode yang dipilih.</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-4 max-w-2xl" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-1">
                  <label className="text-sm">Bulan</label>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                  >
                    {[
                      'Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'
                    ].map((n, idx) => (
                      <option key={idx+1} value={idx+1}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Tahun</label>
                  <input
                    type="number"
                    min={2000}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Saving (opsional)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="ID Tabungan"
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={savingId}
                    onChange={(e) => setSavingId(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">Kosongkan untuk semua tabungan aktif.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" variant="outline" onClick={() => { const d=new Date(); setMonth(d.getMonth()+1); setYear(d.getFullYear()); }}>Bulan ini</Button>
                <Button type="button" variant="outline" onClick={() => { const d=new Date(); d.setMonth(d.getMonth()-1); setMonth(d.getMonth()+1); setYear(d.getFullYear()); }}>Bulan lalu</Button>
                <div className="text-xs text-muted-foreground ml-auto">
                  Tanggal acuan (EOM M−2): <span className="font-medium">{fmt(acuanDate)}</span> • Tanggal posting (EOM M): <span className="font-medium">{fmt(postingDate)}</span>
                </div>
              </div>
              <Button type="submit" disabled={loading || disabled}>
                {disabled ? 'Endpoint belum tersedia' : (loading ? 'Memproses...' : 'Trigger Generate')}
              </Button>
              {error && <div className="text-sm text-red-600">{error}</div>}
              {ok && (
                <div className="space-y-2">
                  <div className="text-sm text-emerald-700">{ok}{summary ? ` — diproses: ${summary.processed ?? 0}${typeof summary.skipped === 'number' ? `, dilewati: ${summary.skipped}` : ''}` : ''}</div>
                  {summary?.details && Array.isArray(summary.details) && summary.details.length > 0 && (
                    <div className="overflow-x-auto rounded-md border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left">Tabungan ID</th>
                            <th className="px-3 py-2 text-left">Status</th>
                            <th className="px-3 py-2 text-left">Saldo Minimum</th>
                            <th className="px-3 py-2 text-left">Rate</th>
                            <th className="px-3 py-2 text-left">Jumlah Bunga</th>
                            <th className="px-3 py-2 text-left">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.details.map((d: any, i: number) => (
                            <tr key={i}>
                              <td className="px-3 py-2">{d.tabungan_id ?? '-'}</td>
                              <td className="px-3 py-2">{d.status ?? '-'}</td>
                              <td className="px-3 py-2">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(d.saldo_minimum || 0))}</td>
                              <td className="px-3 py-2">{typeof d.rate === 'number' ? `${(d.rate <= 1 ? d.rate * 100 : d.rate)}%` : '-'}</td>
                              <td className="px-3 py-2">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(d.jumlah_bunga || 0))}</td>
                              <td className="px-3 py-2">{d.reason || d.tanggal_posting || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}

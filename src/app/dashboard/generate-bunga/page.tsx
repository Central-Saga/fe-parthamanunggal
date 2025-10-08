"use client";

import { useMemo, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PermissionGate from '@/components/permission-gate';
import { isInterestTriggerEnabled } from '@/lib/config';

export default function GenerateBungaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [summary, setSummary] = useState<{ processed?: number; skipped?: number; details?: Array<any> } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);
    const form = e.target as HTMLFormElement;
    const month = Number((form.elements.namedItem('month') as HTMLInputElement).value);
    const year = Number((form.elements.namedItem('year') as HTMLInputElement).value);
    const saving = (form.elements.namedItem('saving') as HTMLInputElement).value;
    if (!month || !year) {
      setLoading(false);
      setError('Bulan dan Tahun wajib diisi');
      return;
    }
    try {
      const body: any = { month, year };
      if (saving) body.saving = Number(saving);
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
        </div>
        <Card>
          <CardContent className="pt-6">
            {!isInterestTriggerEnabled() ? (
              <div className="text-sm text-muted-foreground">
                Fitur trigger generate bunga dimatikan. Aktifkan dengan mengatur env <code>NEXT_PUBLIC_ENABLE_INTEREST_TRIGGER=1</code> jika endpoint backend tersedia.
              </div>
            ) : (
            <form className="grid gap-4 max-w-lg" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-1">
                  <label className="text-sm">Bulan</label>
                  <input name="month" type="number" min={1} max={12} className="h-9 rounded-md border border-input bg-background px-3 text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Tahun</label>
                  <input name="year" type="number" min={2000} className="h-9 rounded-md border border-input bg-background px-3 text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm">Saving (opsional)</label>
                  <input name="saving" type="number" min={1} placeholder="ID Tabungan" className="h-9 rounded-md border border-input bg-background px-3 text-sm" />
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
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}

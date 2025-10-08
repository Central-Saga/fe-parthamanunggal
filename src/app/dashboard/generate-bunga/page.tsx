"use client";

import { useState } from 'react';
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
    const q = new URLSearchParams({ month: String(month), year: String(year) });
    if (saving) q.set('saving', saving);
    try {
      const res = await apiRequest<{ message?: string; processed?: number }>('POST', `/api/internal/interest/run?${q.toString()}`, {});
      setOk(res?.message ?? `Diproses: ${res?.processed ?? 0}`);
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
              {ok && <div className="text-sm text-emerald-700">{ok}</div>}
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}

"use client";

import { useMemo, useState } from 'react';
import StandardDataTable from '@/components/data/standard-data-table';
import type { BungaTabungan } from '@/types/bunga_tabungan';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bungaColumns } from './columns';
import PermissionGate from '@/components/permission-gate';

export default function BungaTabunganPage() {
  const [tabunganId, setTabunganId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const listUrl = useMemo(() => {
    const base = '/api/bunga-tabungans';
    const params = new URLSearchParams();
    if (tabunganId) params.set('tabungan_id', tabunganId);
    if (status) params.set('status', status);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [tabunganId, status]);

  return (
    <PermissionGate required={["mengelola bunga"]}>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Bunga Tabungan</h1>
          <p className="text-sm text-muted-foreground">Daftar bunga bulanan per tabungan. Gunakan filter untuk menyaring.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="grid gap-1">
                <label className="text-sm">Tabungan ID</label>
                <input
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[220px]"
                  placeholder="mis. 3"
                  value={tabunganId}
                  onChange={(e) => setTabunganId(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Status</label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[220px]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Semua</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Non Aktif">Non Aktif</option>
                </select>
              </div>
              <Button variant="outline" onClick={() => { setTabunganId(''); setStatus(''); }}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        <StandardDataTable<BungaTabungan>
          columns={bungaColumns as any}
          listUrl={listUrl}
          createHref="#"
          createLabel=""
          searchPlaceholder="Cari..."
          emptyText="Belum ada bunga"
        />
      </div>
    </PermissionGate>
  );
}


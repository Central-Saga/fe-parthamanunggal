"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { JenisTabungan } from '@/types/jenis_tabungan';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PengaturanBungaTable from './data-table';
import PermissionGate from '@/components/permission-gate';

export default function PengaturanBungaPage() {
  const [jenis, setJenis] = useState<JenisTabungan[]>([]);
  const [selected, setSelected] = useState<number | ''>('' as any);

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

  return (
    <PermissionGate required={["mengelola pengaturan"]}>
      <div className="p-6 space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">Pengaturan Bunga</h1>
            <p className="text-sm text-muted-foreground">Filter berdasarkan jenis tabungan dan atur rasio bunga (0.02 = 2%).</p>
          </div>
          <div className="ml-auto" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="grid gap-1">
                <label className="text-sm">Jenis Tabungan</label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[240px]"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : ('' as any))}
                >
                  <option value="">Semua</option>
                  {jenis.map((j) => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
              </div>
              <Button variant="outline" onClick={() => setSelected('' as any)}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        <PengaturanBungaTable jenisTabunganId={selected ? Number(selected) : null} />
      </div>
    </PermissionGate>
  );
}


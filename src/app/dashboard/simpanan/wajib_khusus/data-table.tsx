'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananWajibKhususColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';

export default function SimpananWajibKhususDataTable() {
  const [url, setUrl] = useState<string>("/api/simpanans");
  useEffect(() => {
    let mounted = true;
    async function set() {
      const envId = getJenisIdFromEnv('wajib_khusus');
      const id = envId ?? (await resolveJenisId('wajib_khusus'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) setUrl(built);
    }
    set();
    return () => { mounted = false };
  }, []);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananWajibKhususColumns}
      listUrl={url}
      createHref="/dashboard/simpanan/wajib_khusus/create"
      createLabel="Tambah Simpanan Wajib Khusus"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada simpanan wajib khusus"
    />
  );
}


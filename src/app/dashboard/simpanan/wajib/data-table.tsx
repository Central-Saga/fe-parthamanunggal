'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananWajibColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';

export default function SimpananWajibDataTable() {
  const [url, setUrl] = useState<string>("/api/simpanans");
  useEffect(() => {
    let mounted = true;
    async function set() {
      const envId = getJenisIdFromEnv('wajib');
      const id = envId ?? (await resolveJenisId('wajib'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) setUrl(built);
    }
    set();
    return () => { mounted = false };
  }, []);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananWajibColumns}
      listUrl={url}
      createHref="/dashboard/simpanan/wajib/create"
      createLabel="Tambah Simpanan Wajib"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada simpanan wajib"
    />
  );
}


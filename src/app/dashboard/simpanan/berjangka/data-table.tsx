'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananBerjangkaColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';

export default function SimpananBerjangkaDataTable() {
  const [url, setUrl] = useState<string>("/api/simpanans");
  useEffect(() => {
    let mounted = true;
    async function set() {
      const envId = getJenisIdFromEnv('berjangka');
      const id = envId ?? (await resolveJenisId('berjangka'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) setUrl(built);
    }
    set();
    return () => { mounted = false };
  }, []);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananBerjangkaColumns}
      listUrl={url}
      createHref="/dashboard/simpanan/berjangka/create"
      createLabel="Tambah Simpanan Berjangka"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada simpanan berjangka"
    />
  );
}


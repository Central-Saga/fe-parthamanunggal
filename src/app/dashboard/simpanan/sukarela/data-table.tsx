'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananSukarelaColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId, getJenisIdRuntime } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';

export default function SimpananSukarelaDataTable() {
  const envId = getJenisIdFromEnv('sukarela');
  const initial = envId ? `/api/simpanans?jenis_simpanan_id=${envId}` : '/api/simpanans';
  const [url, setUrl] = useState<string>(initial);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const envId = getJenisIdFromEnv('sukarela');
      const runtimeId = await getJenisIdRuntime('sukarela');
      const id = envId ?? runtimeId ?? (await resolveJenisId('sukarela'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) setUrl(built);
    }
    set();
    return () => { mounted = false };
  }, []);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananSukarelaColumns}
      listUrl={url}
      createHref="/dashboard/simpanan/sukarela/create"
      createLabel="Tambah Simpanan Sukarela"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada simpanan sukarela"
    />
  );
}


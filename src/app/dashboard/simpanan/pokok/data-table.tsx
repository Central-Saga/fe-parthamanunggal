'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananPokokColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId, getJenisIdRuntime } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';

export default function SimpananPokokDataTable() {
  const envId = getJenisIdFromEnv('pokok');
  const initial = envId ? `/api/simpanans?jenis_simpanan_id=${envId}` : '/api/simpanans';
  const [url, setUrl] = useState<string>(initial);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const envId = getJenisIdFromEnv('pokok');
      const runtimeId = await getJenisIdRuntime('pokok');
      const id = envId ?? runtimeId ?? (await resolveJenisId('pokok'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) setUrl(built);
    }
    set();
    return () => { mounted = false };
  }, []);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananPokokColumns}
      listUrl={url}
      createHref="/dashboard/simpanan/pokok/create"
      createLabel="Tambah Simpanan Pokok"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada simpanan pokok"
    />
  );
}


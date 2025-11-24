'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananBerjangkaColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId, getJenisIdRuntime } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';

export default function SimpananBerjangkaDataTable() {
  const envId = getJenisIdFromEnv('berjangka');
  const initial = envId ? `/api/simpanans?jenis_simpanan_id=${envId}` : '/api/simpanans';
  const [url, setUrl] = useState<string>(initial);
  const [createHref, setCreateHref] = useState<string>(`/dashboard/simpanan/berjangka/create${envId ? `?jenisId=${envId}` : ''}`);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const envId = getJenisIdFromEnv('berjangka');
      const runtimeId = await getJenisIdRuntime('berjangka');
      const id = envId ?? runtimeId ?? (await resolveJenisId('berjangka'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) {
        setUrl(built);
        setCreateHref(`/dashboard/simpanan/berjangka/create${id ? `?jenisId=${id}` : ''}`);
      }
    }
    set();
    return () => { mounted = false };
  }, []);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananBerjangkaColumns}
      listUrl={url}
      createHref={createHref}
      createLabel="Tambah SSK"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada Sertifikat Simpanan Khusus"
    />
  );
}


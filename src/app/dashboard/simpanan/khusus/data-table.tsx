'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananKhususColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId, getJenisIdRuntime } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';

export default function SimpananKhususDataTable() {
  const envId = getJenisIdFromEnv('khusus');
  const initial = envId ? `/api/simpanans?jenis_simpanan_id=${envId}` : '/api/simpanans';
  const [url, setUrl] = useState<string>(initial);
  const [createHref, setCreateHref] = useState<string>(`/dashboard/simpanan/khusus/create${envId ? `?jenisId=${envId}` : ''}`);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const envId = getJenisIdFromEnv('khusus');
      const runtimeId = await getJenisIdRuntime('khusus');
      const id = envId ?? runtimeId ?? (await resolveJenisId('khusus'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) {
        setUrl(built);
        setCreateHref(`/dashboard/simpanan/khusus/create${id ? `?jenisId=${id}` : ''}`);
      }
    }
    set();
    return () => { mounted = false };
  }, []);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananKhususColumns}
      listUrl={url}
      createHref={createHref}
      createLabel="Tambah Simpanan Khusus"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada simpanan khusus"
    />
  );
}


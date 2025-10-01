'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananWajibUsahaColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId, getJenisIdRuntime } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';

export default function SimpananWajibUsahaDataTable() {
  const envId = getJenisIdFromEnv('wajib_usaha');
  const initial = envId ? `/api/simpanans?jenis_simpanan_id=${envId}` : '/api/simpanans';
  const [url, setUrl] = useState<string>(initial);
  const [createHref, setCreateHref] = useState<string>(`/dashboard/simpanan/wajib_usaha/create${envId ? `?jenisId=${envId}` : ''}`);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const envId = getJenisIdFromEnv('wajib_usaha');
      const runtimeId = await getJenisIdRuntime('wajib_usaha');
      const id = envId ?? runtimeId ?? (await resolveJenisId('wajib_usaha'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) {
        setUrl(built);
        setCreateHref(`/dashboard/simpanan/wajib_usaha/create${id ? `?jenisId=${id}` : ''}`);
      }
    }
    set();
    return () => { mounted = false };
  }, []);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananWajibUsahaColumns}
      listUrl={url}
      createHref={createHref}
      createLabel="Tambah Simpanan Wajib Usaha"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada simpanan wajib usaha"
    />
  );
}


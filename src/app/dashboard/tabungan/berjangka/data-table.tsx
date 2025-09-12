'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Tabungan } from '@/types/tabungan';
import { tabunganBerjangkaColumns } from './columns';
import { getTabunganJenisIdFromEnv, getTabunganJenisIdRuntime, resolveTabunganJenisId } from '@/lib/jenisTabungan';
import { useEffect, useState } from 'react';

export default function TabunganBerjangkaDataTable() {
  const envId = getTabunganJenisIdFromEnv('berjangka');
  const initial = envId ? `/api/tabungans?jenis_tabungan_id=${envId}` : '/api/tabungans';
  const [url, setUrl] = useState<string>(initial);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const runtimeId = await getTabunganJenisIdRuntime('berjangka');
      const id = envId ?? runtimeId ?? (await resolveTabunganJenisId('berjangka'));
      const built = id ? `/api/tabungans?jenis_tabungan_id=${id}` : '/api/tabungans';
      if (mounted) setUrl(built);
    }
    set();
    return () => { mounted = false };
  }, [envId]);
  return (
    <StandardDataTable<Tabungan>
      columns={tabunganBerjangkaColumns}
      listUrl={url}
      createHref="/dashboard/tabungan/berjangka/create"
      createLabel="Tambah Tabungan Berjangka"
      onDeleteUrl={(id) => `/api/tabungans/${id}`}
      searchPlaceholder="Cari tabungan..."
      emptyText="Belum ada tabungan berjangka"
    />
  );
}


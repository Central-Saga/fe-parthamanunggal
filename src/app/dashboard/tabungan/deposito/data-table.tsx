'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Tabungan } from '@/types/tabungan';
import { tabunganDepositoColumns } from './columns';
import { getTabunganJenisIdFromEnv, getTabunganJenisIdRuntime, resolveTabunganJenisId } from '@/lib/jenisTabungan';
import { useEffect, useState } from 'react';

export default function TabunganDepositoDataTable() {
  const envId = getTabunganJenisIdFromEnv('deposito');
  const initial = envId ? `/api/tabungans?jenis_tabungan_id=${envId}` : '/api/tabungans';
  const [url, setUrl] = useState<string>(initial);
  const [createHref, setCreateHref] = useState<string>(`/dashboard/tabungan/deposito/create${envId ? `?jenisId=${envId}` : ''}`);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const runtimeId = await getTabunganJenisIdRuntime('deposito');
      const id = envId ?? runtimeId ?? (await resolveTabunganJenisId('deposito'));
      const built = id ? `/api/tabungans?jenis_tabungan_id=${id}` : '/api/tabungans';
      if (mounted) {
        setUrl(built);
        setCreateHref(`/dashboard/tabungan/deposito/create${id ? `?jenisId=${id}` : ''}`);
      }
    }
    set();
    return () => { mounted = false };
  }, [envId]);
  return (
    <StandardDataTable<Tabungan>
      columns={tabunganDepositoColumns}
      listUrl={url}
      createHref={createHref}
      createLabel="Tambah Tabungan Deposito"
      onDeleteUrl={(id) => `/api/tabungans/${id}`}
      searchPlaceholder="Cari tabungan..."
      emptyText="Belum ada tabungan deposito"
    />
  );
}


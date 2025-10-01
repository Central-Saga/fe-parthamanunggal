'use client';

import StandardDataTable from '@/components/data/standard-data-table';
import type { Simpanan } from '@/types/simpanan';
import { simpananWajibKhususColumns } from './columns';
import { getJenisIdFromEnv, resolveJenisId, getJenisIdRuntime } from '@/lib/jenisSimpanan';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SimpananWajibKhususDataTable() {
  const searchParams = useSearchParams();
  const qpId = Number(searchParams.get('jenisId')) || null;
  const envId = getJenisIdFromEnv('wajib_khusus');
  const initialId = qpId || envId || null;
  const initial = initialId ? `/api/simpanans?jenis_simpanan_id=${initialId}` : '/api/simpanans';
  const [url, setUrl] = useState<string>(initial);
  const [createHref, setCreateHref] = useState<string>(`/dashboard/simpanan/wajib_khusus/create${initialId ? `?jenisId=${initialId}` : ''}`);
  useEffect(() => {
    let mounted = true;
    async function set() {
      const runtimeId = await getJenisIdRuntime('wajib_khusus');
      const id = qpId ?? envId ?? runtimeId ?? (await resolveJenisId('wajib_khusus'));
      const built = id ? `/api/simpanans?jenis_simpanan_id=${id}` : '/api/simpanans';
      if (mounted) {
        setUrl(built);
        setCreateHref(`/dashboard/simpanan/wajib_khusus/create${id ? `?jenisId=${id}` : ''}`);
      }
    }
    set();
    return () => { mounted = false };
  }, [qpId, envId]);
  return (
    <StandardDataTable<Simpanan>
      columns={simpananWajibKhususColumns}
      listUrl={url}
      createHref={createHref}
      createLabel="Tambah Simpanan Wajib Khusus"
      onDeleteUrl={(id) => `/api/simpanans/${id}`}
      searchPlaceholder="Cari simpanan..."
      emptyText="Belum ada simpanan wajib khusus"
    />
  );
}


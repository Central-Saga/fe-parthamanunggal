"use client";

import type { Pengaturan } from '@/types/pengaturan';
import StandardDataTable from '@/components/data/standard-data-table';
import { pengaturanColumns } from './columns';

export default function PengaturanBungaTable({ jenisTabunganId }: { jenisTabunganId?: number | null }) {
  const base = '/api/pengaturans?jenis_setting=interest';
  const listUrl = jenisTabunganId ? `${base}&jenis_tabungan_id=${jenisTabunganId}` : base;
  return (
    <StandardDataTable<Pengaturan & { jenis_tabungan?: { id: number; nama: string } }>
      columns={pengaturanColumns}
      listUrl={listUrl}
      createHref="/dashboard/pengaturan-bunga/create"
      createLabel="Tambah Pengaturan"
      onDeleteUrl={(id) => `/api/pengaturans/${id}`}
      searchPlaceholder="Cari nama/keterangan..."
      emptyText="Belum ada pengaturan bunga"
    />
  );
}


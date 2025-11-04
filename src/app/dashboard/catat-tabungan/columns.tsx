import type { ColumnDef } from '@tanstack/react-table';
import type { Tabungan } from '@/types/tabungan';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const catatTabunganColumns: ColumnDef<Tabungan>[] = [
  { header: 'ID', accessorKey: 'id', size: 80 },
  {
    id: 'anggota',
    header: 'Anggota',
    size: 180,
    cell: ({ row }) => row.original.anggota?.nama ?? String(row.original.anggota_id),
  },
  {
    header: 'Saldo',
    accessorKey: 'saldo',
    size: 140,
    cell: ({ getValue }) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(getValue() || 0)),
  },
  {
    header: 'Tgl Buka',
    accessorKey: 'tgl_buka',
    size: 140,
    cell: ({ getValue }) => {
      const v = String(getValue() ?? '');
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString();
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    size: 180,
    cell: ({ row, table }) => {
      const meta = (table?.options?.meta as any) || {};
      const onTambah = meta.onTambah as ((row: Tabungan) => void) | undefined;
      const onKurang = meta.onKurang as ((row: Tabungan) => void) | undefined;
      return (
        <div className="flex items-center gap-2">
          {onTambah ? (
            <Button size="sm" variant="default" onClick={() => onTambah(row.original)}>Tambah</Button>
          ) : (
            <Button asChild size="sm" variant="default">
              <Link href={`/dashboard/tabungan/${row.original.id}?action=tambah`}>Tambah</Link>
            </Button>
          )}
          {onKurang ? (
            <Button size="sm" variant="secondary" onClick={() => onKurang(row.original)}>Kurang</Button>
          ) : (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/dashboard/tabungan/${row.original.id}?action=kurang`}>Kurang</Link>
            </Button>
          )}
        </div>
      );
    },
  },
];

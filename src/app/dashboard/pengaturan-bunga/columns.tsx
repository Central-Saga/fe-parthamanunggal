import type { ColumnDef } from '@tanstack/react-table';
import type { Pengaturan } from '@/types/pengaturan';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const pengaturanColumns: ColumnDef<Pengaturan & { jenis_tabungan?: { id: number; nama: string } }>[] = [
  { header: 'ID', accessorKey: 'id', size: 80 },
  { header: 'Nama', accessorKey: 'nama_setting' },
  { header: 'Jenis', accessorKey: 'jenis_setting' },
  {
    id: 'jenis_tabungan',
    header: 'Jenis Tabungan',
    cell: ({ row }) => row.original?.jenis_tabungan?.nama ?? String(row.original.jenis_tabungan_id ?? ''),
  },
  {
    header: 'Periode Berlaku',
    accessorKey: 'periode_berlaku',
    cell: ({ getValue }) => String(getValue() || '-') || '-',
  },
  {
    header: 'Rasio',
    accessorKey: 'value',
    cell: ({ getValue }) => {
      const v = Number(getValue() ?? 0);
      // Display 2% while underlying value is 0.02
      const pct = (v <= 1 ? v * 100 : v);
      return `${pct}%`;
    },
  },
  { header: 'Keterangan', accessorKey: 'keterangan' },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row, table }) => {
      const onDelete = (table?.options?.meta as any)?.onDelete as ((id: number) => void) | undefined;
      return (
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/pengaturan-bunga/${row.original.id}/edit`}>Edit</Link>
          </Button>
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original.id)}>Hapus</Button>
          )}
        </div>
      );
    },
  },
];


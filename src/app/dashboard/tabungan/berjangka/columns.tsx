import type { ColumnDef } from '@tanstack/react-table';
import type { Tabungan } from '@/types/tabungan';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const tabunganBerjangkaColumns: ColumnDef<Tabungan>[] = [
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
    size: 140,
    cell: ({ row, table }) => {
      const onDelete = (table?.options?.meta as any)?.onDelete as ((id: number) => void) | undefined;
      return (
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/tabungan/${row.original.id}`}>Detail</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/tabungan/berjangka/${row.original.id}/edit`}>Edit</Link>
          </Button>
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original.id)}>Hapus</Button>
          )}
        </div>
      );
    },
  },
];


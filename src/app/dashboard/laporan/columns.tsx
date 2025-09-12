import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Laporan = {
  id: number;
  judul: string;
  tanggal: string;
  deskripsi?: string | null;
};

export const laporanColumns: ColumnDef<Laporan>[] = [
  { header: 'ID', accessorKey: 'id', size: 80 },
  { header: 'Judul', accessorKey: 'judul' },
  {
    header: 'Tanggal',
    accessorKey: 'tanggal',
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
            <Link href={`/dashboard/laporan/${row.original.id}/edit`}>Edit</Link>
          </Button>
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original.id)}>Hapus</Button>
          )}
        </div>
      );
    },
  },
];


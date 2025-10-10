"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jurnalApi } from '@/lib/api-jurnal';

export default function JurnalShowPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await jurnalApi.show(Number(id));
        setData(res);
      } catch (e: any) {
        setError(e?.message || 'Gagal memuat');
      } finally { setLoading(false); }
    }
    load();
  }, [id]);

  async function onDelete() {
    if (!confirm('Hapus jurnal ini?')) return;
    await jurnalApi.remove(Number(id));
    router.push('/dashboard/jurnal');
  }

  if (loading) return <div className="p-4">Memuat…</div>;
  if (error) return <div className="p-4 text-red-700">{error}</div>;
  if (!data) return <div className="p-4">Tidak ada data.</div>;

  const details = data.details || [];
  const totalD = details.reduce((s: number, r: any) => s + (Number(r.debet) || 0), 0);
  const totalK = details.reduce((s: number, r: any) => s + (Number(r.kredit) || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Jurnal #{data.id}</h1>
        <button className="rounded-md bg-red-600 text-white px-3 py-2 text-sm" onClick={onDelete}>Hapus</button>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-3xl">
        <Field label="Tanggal" value={data.tanggal} />
        <Field label="No Bukti" value={data.no_bukti || '-'} />
        <Field label="Sumber" value={data.sumber || '-'} />
        <Field label="Sumber ID" value={data.sumber_id ?? '-'} />
        <Field label="Keterangan" value={data.keterangan || '-'} full />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Akun ID</th>
              <th className="px-3 py-2 text-right">Debet</th>
              <th className="px-3 py-2 text-right">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{d.akun_id}</td>
                <td className="px-3 py-2 text-right">{Number(d.debet || 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{Number(d.kredit || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t">
            <tr>
              <td className="px-3 py-2 text-right font-medium">Total</td>
              <td className="px-3 py-2 text-right font-medium">{totalD.toLocaleString()}</td>
              <td className="px-3 py-2 text-right font-medium">{totalK.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: any; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{String(value)}</div>
    </div>
  );
}


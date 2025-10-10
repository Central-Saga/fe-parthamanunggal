"use client";

import { useMemo } from 'react';
import AccountSelect from '@/components/account/account-select';
import type { JurnalDetail } from '@/types/jurnal';

type Props = {
  rows: JurnalDetail[];
  onChange: (rows: JurnalDetail[]) => void;
};

export default function JournalDetailsTable({ rows, onChange }: Props) {
  const totals = useMemo(() => {
    const d = rows.reduce((s, r) => s + (Number(r.debet) || 0), 0);
    const k = rows.reduce((s, r) => s + (Number(r.kredit) || 0), 0);
    return { d, k, balanced: Math.round((d - k) * 100) / 100 === 0 };
  }, [rows]);

  function update(idx: number, patch: Partial<JurnalDetail>) {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch };
    // enforce XOR: if debet > 0 → kredit = 0, vice versa
    const r = copy[idx];
    if (patch.debet !== undefined && Number(patch.debet) > 0) r.kredit = 0;
    if (patch.kredit !== undefined && Number(patch.kredit) > 0) r.debet = 0;
    onChange(copy);
  }

  function addRow() {
    onChange([...(rows || []), { akun_id: 0, debet: 0, kredit: 0 }]);
  }

  function removeRow(i: number) {
    const copy = [...rows];
    copy.splice(i, 1);
    onChange(copy);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Akun</th>
              <th className="px-3 py-2 text-right">Debet</th>
              <th className="px-3 py-2 text-right">Kredit</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((r, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2 w-[380px]">
                  <AccountSelect value={r.akun_id || null} onChange={(v) => update(i, { akun_id: v || 0 })} />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    className="w-full rounded-md border px-3 py-2 text-right"
                    value={r.debet ?? 0}
                    onChange={(e) => update(i, { debet: Number(e.target.value) })}
                    step="0.01"
                    min={0}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    className="w-full rounded-md border px-3 py-2 text-right"
                    value={r.kredit ?? 0}
                    onChange={(e) => update(i, { kredit: Number(e.target.value) })}
                    step="0.01"
                    min={0}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => removeRow(i)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t">
            <tr>
              <td className="px-3 py-2 text-right font-medium">Total</td>
              <td className="px-3 py-2 text-right font-medium">{totals.d.toLocaleString()}</td>
              <td className="px-3 py-2 text-right font-medium">{totals.k.toLocaleString()}</td>
              <td className="px-3 py-2 text-right">
                <button type="button" onClick={addRow} className="text-emerald-700 hover:underline">Tambah baris</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!totals.balanced && (
        <div className="text-sm text-amber-700">Total debet dan kredit harus seimbang untuk dapat disimpan.</div>
      )}
    </div>
  );
}


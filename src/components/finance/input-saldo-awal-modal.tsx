"use client";

import { useEffect, useState } from 'react';
import AccountSelect from '@/components/account/account-select';
import { akunApi } from '@/lib/api-akun';

type Props = {
  tanggal: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function InputSaldoAwalModal({ tanggal, onClose, onSaved }: Props) {
  const [akunId, setAkunId] = useState<number | null>(null);
  const [current, setCurrent] = useState<{ d: number; k: number }>({ d: 0, k: 0 });
  const [debet, setDebet] = useState<string>('');
  const [kredit, setKredit] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!akunId) return;
      try {
        const res = await akunApi.saldoAwal(akunId, tanggal);
        if (!cancelled) {
          const d = Number(res?.debet || 0);
          const k = Number(res?.kredit || 0);
          setCurrent({ d, k });
          setDebet(d ? String(d) : '');
          setKredit(k ? String(k) : '');
        }
      } catch {}
    }
    load();
    return () => { setTimeout(() => { cancelled = true; }, 0); };
  }, [akunId, tanggal]);

  async function submit() {
    setError(null);
    if (!akunId) { setError('Pilih akun terlebih dahulu'); return; }
    const d = parseFloat(debet) || 0;
    const k = parseFloat(kredit) || 0;
    if (d > 0 && k > 0) { setError('Isi salah satu sisi saja'); return; }
    if (d === current.d && k === current.k) { onClose(); return; }
    setSaving(true);
    try {
      await akunApi.setSaldoAwal(akunId, tanggal, { debet: d, kredit: k });
      onSaved();
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <h2 className="font-medium">Input Saldo Awal</h2>
          <button onClick={onClose} className="rounded-md bg-muted px-2 py-1 text-xs">Tutup</button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="text-sm text-red-700">{error}</div>}

          <div className="grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Akun</span>
              <AccountSelect value={akunId} onChange={setAkunId} />
            </label>
          </div>

          <section className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Saldo Awal (s/d H-1)</div>
            <div className="overflow-x-auto">
              <table className="min-w-[420px] w-full text-sm table-fixed">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="px-3 py-2 text-center text-emerald-700">Debet</th>
                    <th className="px-3 py-2 text-center text-rose-700">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        className="w-full rounded-md border px-3 py-2 text-right text-emerald-700"
                        value={debet}
                        placeholder="0"
                        min={0}
                        step={0.01}
                        onChange={(e) => { const v = e.target.value; setDebet(v); if (parseFloat(v) > 0) setKredit(''); }}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        className="w-full rounded-md border px-3 py-2 text-right text-rose-700"
                        value={kredit}
                        placeholder="0"
                        min={0}
                        step={0.01}
                        onChange={(e) => { const v = e.target.value; setKredit(v); if (parseFloat(v) > 0) setDebet(''); }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Isi salah satu sisi saja untuk saldo awal (Debet atau Kredit).</p>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
          <button onClick={onClose} className="rounded-md bg-muted px-3 py-2 text-sm">Batal</button>
          <button onClick={submit} disabled={saving} className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm disabled:opacity-50">{saving ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  );
}
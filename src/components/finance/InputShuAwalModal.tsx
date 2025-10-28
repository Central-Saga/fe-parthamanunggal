"use client";

import { useEffect, useMemo, useState } from 'react';
import { financeApi } from '@/lib/api/finance';
import { akunApi } from '@/lib/api-akun';
import AccountSelect from '@/components/account/account-select';
import { formatRupiah } from '@/utils/number';

export type InputShuAwalModalProps = {
  tanggal: string;
  onClose: () => void;
  onSuccess?: (tanggal: string) => void;
};

export default function InputShuAwalModal({ tanggal, onClose, onSuccess }: InputShuAwalModalProps) {
  const [nilai, setNilai] = useState<string>('');
  const [akunShuId, setAkunShuId] = useState<number | null>(null);
  const [akunLawanId, setAkunLawanId] = useState<number | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    setIdempotencyKey(`shu-awal-${tanggal}`);
  }, [tanggal]);

  const nilaiNumber = useMemo(() => parseFloat(nilai) || 0, [nilai]);

  // Otomatis pilih default akun SHU dan akun lawan dari COA yang tersedia
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await akunApi.list({ per_page: 500 });
        const rows: any[] = Array.isArray(res) ? res : (res?.data || []);
        if (!Array.isArray(rows) || rows.length === 0) return;

        const modalKeywords = [
          'SISA HASIL USAHA', 'SHU',
          'LABA DITAHAN', 'SALDO LABA',
          'TAHUN BERJALAN', 'LABA RUGI',
          'SURPLUS', 'DEFISIT'
        ];
        const cashKeywords = ['KAS', 'BANK', 'SETARA KAS'];

        const scoreBy = (name: string, keys: string[]) => {
          const upper = String(name || '').toUpperCase();
          let s = 0;
          for (const k of keys) if (upper.includes(k)) s += 1;
          return s;
        };

        const candidates = rows.filter((a) => !a?.is_header);
        const shuCandidate = candidates
          .map((a) => ({ a, s: scoreBy(a?.nama_akun, modalKeywords) + (String(a?.tipe).toLowerCase() === 'modal' ? 1 : 0) }))
          .sort((x, y) => y.s - x.s)[0]?.a;

        const lawanCandidate = candidates
          .map((a) => ({ a, s: scoreBy(a?.nama_akun, cashKeywords) + (String(a?.tipe).toLowerCase() === 'aset' ? 1 : 0) }))
          .sort((x, y) => y.s - x.s)[0]?.a;

        if (mounted) {
          if (shuCandidate && !akunShuId) setAkunShuId(shuCandidate.id);
          if (lawanCandidate && !akunLawanId) setAkunLawanId(lawanCandidate.id);
        }
      } catch {
        // abaikan, user masih bisa input manual
      }
    })();
    return () => { mounted = false };
  }, [akunShuId, akunLawanId]);

  async function submit() {
    setError(null);
    setInfo(null);
    if (!tanggal) { setError('Tanggal tidak valid'); return; }
    if (isNaN(nilaiNumber)) { setError('Nilai tidak valid'); return; }
    setSaving(true);
    try {
      if (!akunShuId) {
        setError('Akun SHU wajib dipilih (tidak ditemukan default).');
        setSaving(false);
        return;
      }
      await financeApi.postShuAwal({
        tanggal,
        nilai: nilaiNumber,
        akun_shu_id: akunShuId || undefined,
        akun_lawan_id: akunLawanId || undefined,
        idempotency_key: idempotencyKey || `shu-awal-${tanggal}`,
      });
      setInfo('Berhasil menyimpan SHU Awal');
      if (onSuccess) onSuccess(tanggal);
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal menyimpan SHU Awal';
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <h2 className="font-medium">Set SHU Awal</h2>
          <button onClick={onClose} className="rounded-md bg-muted px-2 py-1 text-xs">Tutup</button>
        </div>

        <div className="p-4 space-y-4">
          {error && <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-3 py-2 text-sm">{error}</div>}
          {info && <div className="rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">{info}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Tanggal</span>
              <input type="date" className="w-full rounded-md border px-3 py-2 text-sm" value={tanggal} onChange={() => {}} disabled />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">SHU Awal (bisa negatif)</span>
              <input type="number" step={0.01} className="w-full rounded-md border px-3 py-2 text-right" value={nilai} onChange={(e) => setNilai(e.target.value)} placeholder="0.00" />
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs underline text-muted-foreground hover:text-foreground"
            >
              {showAdvanced ? 'Sembunyikan pengaturan lanjutan' : 'Tampilkan pengaturan lanjutan'}
            </button>

            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Akun SHU</span>
                  <AccountSelect value={akunShuId} onChange={setAkunShuId} placeholder="Pilih akun SHU…" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Akun Lawan</span>
                  <AccountSelect value={akunLawanId} onChange={setAkunLawanId} placeholder="Pilih akun lawan…" />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs text-muted-foreground">Idempotency Key</span>
                  <input type="text" className="w-full rounded-md border px-3 py-2 text-sm" value={idempotencyKey} onChange={(e) => setIdempotencyKey(e.target.value)} placeholder={`shu-awal-${tanggal}`} />
                  <span className="text-[11px] text-muted-foreground">Gunakan key yang sama untuk mencegah duplikasi.</span>
                </label>
              </div>
            )}
          </div>

          <div className="rounded-md border p-3 bg-muted/30 text-sm">
            <div className="text-muted-foreground">Pratinjau Nilai</div>
            <div className="font-semibold">{formatRupiah(nilaiNumber)}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
          <button onClick={onClose} className="rounded-md bg-muted px-3 py-2 text-sm">Batal</button>
          <button onClick={submit} disabled={saving} className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm disabled:opacity-50">{saving ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  );
}

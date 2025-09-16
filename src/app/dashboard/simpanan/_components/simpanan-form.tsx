"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import type { Anggota } from "@/types/anggota";
import type { Simpanan } from "@/types/simpanan";
import type { JenisKey } from "@/lib/jenisSimpanan";
import { getJenisIdFromEnv, resolveJenisId, getJenisIdRuntime } from "@/lib/jenisSimpanan";

export type SimpananFormProps = {
  jenisKey: JenisKey; // e.g., 'wajib', 'pokok', 'sukarela', ...
  mode: "create" | "edit";
  id?: string | number; // required for edit
  backHref: string; // href to go back after submit/cancel
  title: string; // page title for display
  subtitle?: string;
};

type FormState = {
  anggota_id: number | "";
  nominal: string; // keep as string for input control; convert to number on submit
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
  status: "Aktif" | "Non Aktif";
};

export default function SimpananForm({ jenisKey, mode, id, backHref, title, subtitle }: SimpananFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anggotas, setAnggotas] = useState<Anggota[]>([]);
  const [form, setForm] = useState<FormState>(() => ({
    anggota_id: "",
    nominal: "",
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: "",
    status: "Aktif",
  }));

  useEffect(() => {
    let mounted = true;
    async function loadInitial() {
      try {
        setError(null);
        // Fetch anggota list for selection
        const anggotaRes = await apiRequest<Anggota[] | { data: Anggota[] }>("GET", "/api/anggotas").catch(() => [] as any);
        const anggotaList = Array.isArray(anggotaRes) ? anggotaRes : ((anggotaRes as any)?.data ?? []);
        if (mounted) setAnggotas(anggotaList);

        // Ensure jenis id exists for submit
        // Try runtime mapping from server first, then env, then BE listing
        let jId = await getJenisIdRuntime(jenisKey);
        if (!jId) jId = getJenisIdFromEnv(jenisKey);
        if (!jId) jId = await resolveJenisId(jenisKey);
        if (!jId && process.env.NODE_ENV !== 'production') {
          console.warn(`[simpanan-form] Jenis ID for '${jenisKey}' not found. Consider setting NEXT_PUBLIC_JENIS_${jenisKey.toUpperCase()} in .env.local`);
        }

        if (mode === "edit" && id != null) {
          setLoading(true);
          const res = await apiRequest<Simpanan | { data: Simpanan }>("GET", `/api/simpanans/${id}`);
          const data = (res as any)?.data ? (res as any).data : res;
          if (mounted && data) {
            setForm({
              anggota_id: data.anggota_id ?? "",
              nominal: String(data.nominal ?? ""),
              tanggal: (data.tanggal || "").slice(0, 10),
              keterangan: data.keterangan ?? "",
              status: (data.status as any) === "Non Aktif" ? "Non Aktif" : "Aktif",
            });
          }
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Gagal memuat data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadInitial();
    return () => { mounted = false; };
  }, [mode, id]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const basePayload: Record<string, unknown> = {
        anggota_id: form.anggota_id === "" ? null : Number(form.anggota_id),
        // Kirim sebagai string agar kompatibel dengan decimal di backend
        nominal: form.nominal || "0",
        tanggal: form.tanggal,
        keterangan: form.keterangan || null,
        status: form.status,
      };

      if (mode === "create") {
        // Prefer runtime-resolved ID (server reads env) then fallback to env/endpoint
        let jenisId = await getJenisIdRuntime(jenisKey);
        if (!jenisId) jenisId = getJenisIdFromEnv(jenisKey);
        if (!jenisId) jenisId = await resolveJenisId(jenisKey);
        if (!jenisId) throw new Error("Jenis simpanan tidak ditemukan. Mohon set env NEXT_PUBLIC_JENIS_... atau pastikan endpoint jenis tersedia.");
        await apiRequest("POST", "/api/simpanans", { ...basePayload, jenis_simpanan_id: jenisId });
      } else {
        // Pada update, hindari mengirim jenis_simpanan_id jika backend tidak mengizinkan ubah jenis
        await apiRequest("PUT", `/api/simpanans/${id}`, basePayload);
      }
      router.push(backHref);
    } catch (err: any) {
      // Tampilkan pesan validasi jika ada
      const msg = err?.response?.data?.message || err?.message;
      const errors = err?.response?.data?.errors;
      const detail = errors ? Object.values(errors).flat().join("; ") : "";
      setError((msg || "Gagal menyimpan data simpanan") + (detail ? ` — ${detail}` : ""));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      {loading && <div className="text-muted-foreground">Memuat...</div>}
      {error && !loading && <div className="text-sm text-red-600">{error}</div>}
      {!loading && (
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
          <Field label="Anggota">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.anggota_id}
              onChange={(e) => set("anggota_id", e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">— Pilih Anggota —</option>
              {anggotas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama} (ID: {a.id})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Nominal" required>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={form.nominal}
                onChange={(e) => set("nominal", e.target.value)}
                required
              />
            </Field>

            <Field label="Tanggal" required>
              <input
                type="date"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={form.tanggal}
                onChange={(e) => set("tanggal", e.target.value)}
                required
              />
            </Field>

            <Field label="Status" required>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={form.status}
                onChange={(e) => set("status", e.target.value as FormState["status"])}
                required
              >
                <option value="Aktif">Aktif</option>
                <option value="Non Aktif">Non Aktif</option>
              </select>
            </Field>
          </div>

          <Field label="Keterangan">
            <textarea
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.keterangan}
              onChange={(e) => set("keterangan", e.target.value)}
              placeholder="Opsional"
            />
          </Field>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push(backHref)}>Batal</Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1">
      <div className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-600">*</span>}
      </div>
      {children}
    </label>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import type { Anggota } from "@/types/anggota";
import type { Tabungan } from "@/types/tabungan";
import type { TabunganKey } from "@/lib/jenisTabungan";
import { getTabunganJenisIdFromEnv, resolveTabunganJenisId, getTabunganJenisIdRuntime } from "@/lib/jenisTabungan";

export type TabunganFormProps = {
  jenisKey: TabunganKey; // 'harian' | 'berjangka' | 'deposito'
  mode: "create" | "edit";
  id?: string | number;
  backHref: string;
  title: string;
  subtitle?: string;
};

type FormState = {
  anggota_id: number | "";
  saldo: string; // manage as string in input
  tgl_buka: string; // YYYY-MM-DD
  status: number; // 1 aktif, 0 non aktif
};

export default function TabunganForm({ jenisKey, mode, id, backHref, title, subtitle }: TabunganFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anggotas, setAnggotas] = useState<Anggota[]>([]);
  const [form, setForm] = useState<FormState>({
    anggota_id: "",
    saldo: "",
    tgl_buka: new Date().toISOString().slice(0, 10),
    status: 1,
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setError(null);
        const anggotaRes = await apiRequest<Anggota[] | { data: Anggota[] }>("GET", "/api/anggotas").catch(() => [] as any);
        const anggotaList = Array.isArray(anggotaRes) ? anggotaRes : ((anggotaRes as any)?.data ?? []);
        if (mounted) setAnggotas(anggotaList);

        if (mode === "edit" && id != null) {
          setLoading(true);
          const res = await apiRequest<Tabungan | { data: Tabungan }>("GET", `/api/tabungans/${id}`);
          const data = (res as any)?.data ? (res as any).data : res;
          if (mounted && data) {
            setForm({
              anggota_id: data.anggota_id ?? "",
              saldo: String(data.saldo ?? ""),
              tgl_buka: (data.tgl_buka || "").slice(0, 10),
              status: Number(data.status ?? 1),
            });
          }
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Gagal memuat data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
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
        saldo: form.saldo || "0",
        tgl_buka: form.tgl_buka,
        status: Number(form.status),
      };
      if (mode === "create") {
        // Prefer runtime-resolved ID (server reads env); then fallback
        let jenisId = await getTabunganJenisIdRuntime(jenisKey);
        if (!jenisId) jenisId = getTabunganJenisIdFromEnv(jenisKey);
        if (!jenisId) jenisId = await resolveTabunganJenisId(jenisKey);
        if (!jenisId) throw new Error("Jenis tabungan tidak ditemukan. Set env NEXT_PUBLIC_JENIS_TABUNGAN_... atau pastikan endpoint jenis tersedia.");
        await apiRequest("POST", "/api/tabungans", { ...basePayload, jenis_tabungan_id: jenisId });
      } else {
        await apiRequest("PUT", `/api/tabungans/${id}`, basePayload);
      }
      router.push(backHref);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      const errors = err?.response?.data?.errors;
      const detail = errors ? Object.values(errors).flat().join("; ") : "";
      setError((msg || "Gagal menyimpan tabungan") + (detail ? ` — ${detail}` : ""));
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
            <Field label="Saldo" required>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={form.saldo}
                onChange={(e) => set("saldo", e.target.value)}
                required
              />
            </Field>

            <Field label="Tgl Buka" required>
              <input
                type="date"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={form.tgl_buka}
                onChange={(e) => set("tgl_buka", e.target.value)}
                required
              />
            </Field>

            <Field label="Status" required>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={form.status}
                onChange={(e) => set("status", Number(e.target.value))}
                required
              >
                <option value={1}>Aktif</option>
                <option value={0}>Non Aktif</option>
              </select>
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push(backHref)}>Batal</Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
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

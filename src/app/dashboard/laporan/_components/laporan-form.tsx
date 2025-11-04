"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

type Laporan = {
  id: number;
  judul: string;
  tanggal: string;
  deskripsi?: string | null;
};

export default function LaporanForm({ mode, id, backHref, title, subtitle }: { mode: "create" | "edit"; id?: string | number; backHref: string; title: string; subtitle?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ judul: string; tanggal: string; deskripsi: string }>(() => ({
    judul: "",
    tanggal: new Date().toISOString().slice(0, 10),
    deskripsi: "",
  }));
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (mode !== "edit" || id == null) return setLoading(false);
      try {
        setError(null);
        const res = await apiRequest<Laporan | { data: Laporan }>("GET", `/api/laporan/${id}`);
        const data = (res as any)?.data ? (res as any).data : res;
        if (mounted && data) {
          setForm({
            judul: data.judul ?? "",
            tanggal: (data.tanggal || "").slice(0, 10),
            deskripsi: data.deskripsi ?? "",
          });
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

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let useFormData = true; // always send as multipart to support optional file
      if (useFormData) {
        const fd = new FormData();
        fd.append('judul', form.judul);
        fd.append('tanggal', form.tanggal);
        if (form.deskripsi) fd.append('deskripsi', form.deskripsi);
        if (file) {
          fd.append('file', file); // common name
          fd.append('pdf', file);  // compatibility
        }
        if (mode === "create") await apiRequest("POST", "/api/laporan", fd);
        else await apiRequest("PUT", `/api/laporan/${id}`, fd);
      }
      router.push(backHref);
    } catch (err: any) {
      setError(err?.message ?? "Gagal menyimpan laporan");
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
          <Field label="Judul" required>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.judul}
              onChange={(e) => set("judul", e.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Tanggal" required>
              <input
                type="date"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={form.tanggal}
                onChange={(e) => set("tanggal", e.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Deskripsi">
            <textarea
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.deskripsi}
              onChange={(e) => set("deskripsi", e.target.value)}
              placeholder="Opsional"
            />
          </Field>

          <Field label="File Laporan (PDF)">
            <input
              type="file"
              accept="application/pdf"
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && <div className="text-xs text-muted-foreground mt-1">Terpilih: {file.name}</div>}
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

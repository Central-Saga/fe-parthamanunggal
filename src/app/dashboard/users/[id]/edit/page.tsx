"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/users";
import type { Anggota } from "@/types/anggota";

type FormState = {
  email: string;
  password: string; // optional on update (empty = unchanged)
  anggota_id: number | "";
};

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [anggotas, setAnggotas] = useState<Anggota[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Load user detail
        const userRes = await apiRequest<User | { data: User }>("GET", `/api/users/${id}`);
        const userData = (userRes as any)?.data ? (userRes as any).data : userRes;

        // Load anggota list for selection (best-effort)
        let anggotaList: Anggota[] = [];
        try {
          const anggotaRes = await apiRequest<Anggota[] | { data: Anggota[] }>("GET", "/api/anggotas");
          anggotaList = Array.isArray(anggotaRes) ? anggotaRes : ((anggotaRes as any)?.data ?? []);
        } catch (e) {
          // Ignore anggota error; keep list empty but still allow edit email/password
        }

        if (mounted && userData) {
          setForm({
            email: userData.email,
            password: "",
            anggota_id: userData.anggota_id ?? "",
          });
          setAnggotas(anggotaList);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Gagal memuat data user");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: val } : f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        email: form.email,
        anggota_id: form.anggota_id === "" ? null : form.anggota_id,
      };
      const trimmedPass = form.password.trim();
      if (trimmedPass) payload.password = trimmedPass;

      await apiRequest("PUT", `/api/users/${id}`, payload);
      router.push("/dashboard/users");
    } catch (err: any) {
      setError(err?.message ?? "Gagal menyimpan user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit User</h1>
        <p className="text-sm text-muted-foreground">Perbarui data user</p>
      </div>

      {loading && <div className="text-muted-foreground">Memuat...</div>}
      {error && !loading && <div className="text-sm text-red-600">{error}</div>}
      {!loading && form && (
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
          <Field label="Email" required>
            <input
              type="email"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </Field>

          <Field label="Password (opsional)">
            <input
              type="password"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Biarkan kosong jika tidak diubah"
            />
          </Field>

          <Field label="Anggota">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.anggota_id}
              onChange={(e) => set("anggota_id", e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">— Tanpa Anggota —</option>
              {anggotas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama} (ID: {a.id})
                </option>
              ))}
            </select>
          </Field>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/users')}>Batal</Button>
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


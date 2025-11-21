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
  password_confirmation: string; // required if password is set
  anggota_id: number | "";
  status?: "Aktif" | "Non Aktif"; // optional; only sent if present
  role?: string | ""; // optional; only sent if present
};

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [anggotas, setAnggotas] = useState<Anggota[]>([]);
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);

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

        // Also load roles (best-effort)
        let roleList: Array<{ id: number; name: string }> = [];
        try {
          const roleRes = await apiRequest<Array<{ id: number; name: string }> | { data: Array<{ id: number; name: string }> }>("GET", "/api/roles");
          roleList = Array.isArray(roleRes) ? roleRes : ((roleRes as any)?.data ?? []);
        } catch {}

        if (mounted && userData) {
          setForm({
            email: userData.email,
            password: "",
            password_confirmation: "",
            anggota_id: userData.anggota_id ?? "",
            status: (userData as any)?.status as any,
            role: "",
          });
          setAnggotas(anggotaList);
          setRoles(roleList);
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
      if (trimmedPass) {
        payload.password = trimmedPass;
        payload.password_confirmation = form.password_confirmation;
      }
      if (form.status) payload.status = form.status;
      if (form.role) payload.role = form.role;

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

          {form.password && (
            <Field label="Konfirmasi Password">
              <input
                type="password"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={form.password_confirmation}
                onChange={(e) => set("password_confirmation", e.target.value)}
                placeholder="Ulangi password baru"
              />
            </Field>
          )}

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

          <Field label="Status">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.status || ""}
              onChange={(e) => set("status", (e.target.value || undefined) as any)}
            >
              <option value="">- Biarkan Tidak Diubah -</option>
              <option value="Aktif">Aktif</option>
              <option value="Non Aktif">Non Aktif</option>
            </select>
          </Field>

          <Field label="Role (opsional)">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.role || ""}
              onChange={(e) => set("role", e.target.value)}
            >
              <option value="">- Tidak Diubah -</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
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


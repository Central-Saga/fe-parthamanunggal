"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import type { Anggota } from "@/types/anggota";

type FormState = {
  email: string;
  password: string;
  password_confirmation: string;
  anggota_id: number | "";
  status: "Aktif" | "Non Aktif";
  role: string | "";
};

export default function UserCreatePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [anggotas, setAnggotas] = useState<Anggota[]>([]);
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    password_confirmation: "",
    anggota_id: "",
    status: "Aktif",
    role: "",
  });

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      // Load roles (best-effort)
      try {
        const res = await apiRequest<Array<{ id: number; name: string }> | { data: Array<{ id: number; name: string }> }>("GET", "/api/roles");
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? []);
        if (mounted) setRoles(list);
      } catch {}

      // Load anggota list (best-effort)
      try {
        const res = await apiRequest<Anggota[] | { data: Anggota[] }>("GET", "/api/anggotas");
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? []);
        if (mounted) setAnggotas(list);
      } catch {}
    }
    bootstrap();
    return () => { mounted = false; };
  }, []);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        status: form.status,
        anggota_id: form.anggota_id === "" ? null : form.anggota_id,
      };
      if (form.role) payload.role = form.role;

      await apiRequest("POST", "/api/users", payload);
      router.push("/dashboard/users");
    } catch (err: any) {
      // Show validation messages if present
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors && Object.values(err.response.data.errors).flat().join("; ")
        || err?.message
        || "Gagal membuat user";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Buat User</h1>
        <p className="text-sm text-muted-foreground">Isi form berikut untuk menambah user.</p>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

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

        <Field label="Password" required>
          <input
            type="password"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
          />
        </Field>

        <Field label="Konfirmasi Password" required>
          <input
            type="password"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={form.password_confirmation}
            onChange={(e) => set("password_confirmation", e.target.value)}
            required
          />
        </Field>

        <Field label="Status" required>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={form.status}
            onChange={(e) => set("status", e.target.value as FormState["status"])}
          >
            <option value="Aktif">Aktif</option>
            <option value="Non Aktif">Non Aktif</option>
          </select>
        </Field>

        <Field label="Anggota (opsional)">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={form.anggota_id}
            onChange={(e) => set("anggota_id", e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">- Tanpa Anggota -</option>
            {anggotas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama} (ID: {a.id})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Role (opsional)">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          >
            <option value="">- Tanpa Role -</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </Field>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/users')}>Batal</Button>
        </div>
      </form>
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


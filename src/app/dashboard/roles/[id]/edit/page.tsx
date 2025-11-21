"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import type { Role } from '@/types/role';

export default function RolesEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [allPerms, setAllPerms] = useState<Array<{ id: number; name: string }>>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Load role detail with permissions
        const res = await apiRequest<any>('GET', `/api/roles/${id}`);
        const data = (res as any)?.data ? (res as any).data : res;
        if (mounted && data) {
          setName(data.name);
          const perms: string[] = Array.isArray((data as any).permissions) ? (data as any).permissions : [];
          setSelected(perms);
        }

        // Load all permissions for checkbox list
        try {
          const pres = await apiRequest<Array<{ id: number; name: string }> | { data: Array<{ id: number; name: string }> }>('GET', '/api/permissions');
          const list = Array.isArray(pres) ? pres : ((pres as any)?.data ?? []);
          if (mounted) setAllPerms(list);
        } catch {}
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Gagal memuat data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  function togglePerm(name?: string) {
    if (!name) return;
    setSelected((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(name) ? arr.filter((x) => x !== name) : [...arr, name];
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name };
      // Always send permissions if we have the list (even empty to clear)
      if (allPerms.length >= 0) payload.permissions = selected;
      await apiRequest('PUT', `/api/roles/${id}`, payload);
      router.push('/dashboard/roles');
    } catch (err: any) {
      setError(err?.message ?? 'Gagal menyimpan role');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Role</h1>
        <p className="text-sm text-muted-foreground">Perbarui nama role</p>
      </div>

      {loading && <div className="text-muted-foreground">Memuat...</div>}
      {error && !loading && <div className="text-sm text-red-600">{error}</div>}
      {!loading && (
        <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
          <label className="block space-y-1">
            <div className="text-sm font-medium text-foreground">Nama Role<span className="text-red-600">*</span></div>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          {allPerms.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Permissions</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allPerms.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.name)}
                      onChange={() => togglePerm(p.name)}
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/roles')}>Batal</Button>
          </div>
        </form>
      )}
    </div>
  );
}

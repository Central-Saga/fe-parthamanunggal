"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';

export default function RolesCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [allPerms, setAllPerms] = useState<Array<{ id: number; name: string }>>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadPerms() {
      try {
        const res = await apiRequest<Array<{ id: number; name: string }> | { data: Array<{ id: number; name: string }> }>('GET', '/api/permissions');
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? []);
        if (mounted) setAllPerms(list);
      } catch {
        // ignore; form will still work without permission assignment
      }
    }
    loadPerms();
    return () => { mounted = false; };
  }, []);

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
      if (selected.length) payload.permissions = selected;
      await apiRequest('POST', '/api/roles', payload);
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
        <h1 className="text-2xl font-semibold">Buat Role</h1>
        <p className="text-sm text-muted-foreground">Tambahkan role baru</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
        {error && <div className="text-sm text-red-600">{error}</div>}
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
          <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/roles')}>Batal</Button>
        </div>
      </form>
    </div>
  );
}


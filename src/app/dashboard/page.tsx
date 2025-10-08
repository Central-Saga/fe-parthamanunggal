"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Wallet, BookMarked } from "lucide-react";
import { getJenisIdRuntime, getJenisIdFromEnv, resolveJenisId } from "@/lib/jenisSimpanan";
import { ChartContainer, type ChartConfig, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, CartesianGrid } from "recharts";

// Keep it simple: start with anggota count only
type Summary = {
  anggota_count?: number;
};

export default function DashboardHome() {
  const [anggotaCount, setAnggotaCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simpananByJenis, setSimpananByJenis] = useState<Array<{ key: string; label: string; total: number; anggotaCount: number }>>([]);
  const [loadingSimpanan, setLoadingSimpanan] = useState(false);
  const [metric, setMetric] = useState<'nominal' | 'anggota'>('nominal');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Try multiple strategies/endpoints to get the total count reliably
        const extractTotal = (r: any): number | null => {
          const n =
            Number(r?.data?.total) ??
            Number(r?.meta?.total) ??
            Number(r?.total) ??
            Number(r?.pagination?.total) ??
            Number(r?.data?.meta?.total) ??
            null;
          if (Number.isFinite(n)) return Number(n);
          if (Array.isArray(r?.data)) return r.data.length;
          if (Array.isArray(r)) return r.length;
          return null;
        };

        async function tryCount(): Promise<number | null> {
          // 1) Dedicated count endpoints (if available)
          for (const ep of [
            "/api/anggotas/count",
            "/api/anggota/count",
          ]) {
            try {
              const r: any = await apiRequest("GET", ep);
              const val = Number(r?.count ?? r?.total ?? r?.data?.count);
              if (Number.isFinite(val)) return val;
            } catch {}
          }
          // 2) Paginated endpoints, different param names
          const bases = ["/api/anggotas", "/api/anggota"];
          const queries = [
            "?page=1&per_page=1",
            "?page=1&perPage=1",
            "?page=1&limit=1",
            "?page=1&page_size=1",
            "?per_page=1",
          ];
          for (const b of bases) {
            for (const q of queries) {
              try {
                const r: any = await apiRequest("GET", `${b}${q}`);
                const t = extractTotal(r);
                if (t != null) return t;
              } catch {}
            }
          }
          // 3) Fallback: first page length (not accurate for total, but better than 0)
          for (const b of bases) {
            try {
              const r: any = await apiRequest("GET", `${b}?page=1`);
              const t = extractTotal(r);
              if (t != null) return t;
            } catch {}
          }
          return null;
        }

        const total = await tryCount();
        if (mounted) setAnggotaCount(total ?? 0);
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || "Gagal memuat jumlah anggota");
          setAnggotaCount(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadSimpanan() {
      setLoadingSimpanan(true);
      try {
        const jenisKeys = [
          "sukarela",
          "wajib_usaha",
          "berjangka",
          "pokok",
          "wajib",
          "wajib_khusus",
          "khusus",
          "modal",
        ] as const;

        const labelForKey: Record<typeof jenisKeys[number], string> = {
          sukarela: "Sukarela",
          wajib_usaha: "Wajib Usaha",
          berjangka: "Berjangka",
          pokok: "Pokok",
          wajib: "Wajib",
          wajib_khusus: "Wajib Khusus",
          khusus: "Khusus",
          modal: "Modal",
        };

        // Build mapping of available jenis from env ids
        const entries = await Promise.all(
          jenisKeys.map(async (key) => {
            // Prefer runtime mapping from server env, then client env, then resolve by name list
            let id = await getJenisIdRuntime(key);
            if (!id) id = getJenisIdFromEnv(key);
            if (!id) id = await resolveJenisId(key);
            if (!id) return null;
            // Use fixed label matching sidebar so UI stays consistent
            // regardless of backend seed names (which may be lorem ipsum).
            const label = labelForKey[key];
            // Sum all nominal and count unique anggota for this jenis
            const total = await sumSimpananForJenis(id);
            const anggotaCount = await countAnggotaForJenis(id);
            return { key, label, total, anggotaCount } as { key: string; label: string; total: number; anggotaCount: number };
          })
        );
        const filtered = entries.filter(Boolean) as Array<{ key: string; label: string; total: number; anggotaCount: number }>;
        if (mounted) setSimpananByJenis(filtered);
      } finally {
        if (mounted) setLoadingSimpanan(false);
      }
    }
    loadSimpanan();
    return () => { mounted = false };
  }, []);

  const valueFormatter = (n: number) => metric === 'nominal' ? formatCurrency(n) : new Intl.NumberFormat('id-ID').format(n);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Ringkasan koperasi Partha Manunggal</p>
        </div>
      </div>

      {error && (
        <Card className="border">
          <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Users className="size-4" />} title="Anggota" value={loading ? "-" : String(anggotaCount ?? "-")} href="/dashboard/anggota" />
      </div>

      <Card className="border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Simpanan per Jenis</div>
            {loadingSimpanan && <div className="text-xs text-muted-foreground">Memuat…</div>}
          </div>
          {!loadingSimpanan && simpananByJenis.length === 0 && (
            <div className="text-sm text-muted-foreground">Belum ada data.</div>
          )}
          {!loadingSimpanan && simpananByJenis.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Button size="sm" variant={metric === 'nominal' ? 'default' : 'outline'} onClick={() => setMetric('nominal')}>Nominal</Button>
                <Button size="sm" variant={metric === 'anggota' ? 'default' : 'outline'} onClick={() => setMetric('anggota')}>Anggota</Button>
              </div>
              <div className="h-[360px]">
                <ChartContainer
                  config={{ bar: { label: metric === 'nominal' ? 'Nominal' : 'Anggota', color: '#10B981' }, label: { label: 'Label', color: 'var(--background)' } } satisfies ChartConfig}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      accessibilityLayer
                      data={simpananByJenis.map((d) => ({ label: d.label, value: metric === 'nominal' ? Number(d.total || 0) : Number(d.anggotaCount || 0) }))}
                      layout="vertical"
                      margin={{ right: 16 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis dataKey="label" type="category" hide tickLine={false} tickMargin={10} axisLine={false} />
                      <XAxis dataKey="value" type="number" hide />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" valueFormatter={(v) => valueFormatter(v)} />} />
                      <Bar dataKey="value" layout="vertical" fill="var(--color-bar)" radius={4}>
                        <LabelList dataKey="label" position="insideLeft" offset={8} className="fill-[var(--color-label)]" fontSize={12} />
                        <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} formatter={(v: number) => valueFormatter(v)} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, title, value, href }: { icon: React.ReactNode; title: string; value: string; href: string }) {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {icon}
            <span>{title}</span>
          </div>
          <Button asChild size="sm" variant="outline"><Link href={href}>Detail</Link></Button>
        </div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(n?: number) {
  return typeof n === 'number'
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n)
    : '-';
}

async function sumSimpananForJenis(jenisId: number): Promise<number> {
  // Iterate pages to sum all nominal
  let page = 1;
  const perPageVariants = [100, 50, 25, 10];
  let total = 0;
  let lastPage = 1;
  const pickArray = (r: any): any[] | null => {
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.data?.data)) return r.data.data;
    if (Array.isArray(r?.data)) return r.data;
    return null;
  };
  const pickLast = (r: any): number | null => (
    Number(r?.data?.last_page) || Number(r?.meta?.last_page) || Number(r?.last_page) || Number(r?.pagination?.last_page) || null
  );
  for (const per of perPageVariants) {
    try {
      const first: any = await apiRequest('GET', `/api/simpanans?jenis_simpanan_id=${jenisId}&page=1&per_page=${per}`);
      const items1 = pickArray(first) ?? [];
      lastPage = pickLast(first) || 1;
      for (const it of items1) {
        const v = Number.parseFloat(String(it?.nominal ?? '0'));
        if (!Number.isNaN(v)) total += v;
      }
      break;
    } catch {
      // try next per_page variant
    }
  }
  if (lastPage > 1) {
    for (page = 2; page <= lastPage; page++) {
      try {
        const r: any = await apiRequest('GET', `/api/simpanans?jenis_simpanan_id=${jenisId}&page=${page}&per_page=100`);
        const items = pickArray(r) ?? [];
        for (const it of items) {
          const v = Number.parseFloat(String(it?.nominal ?? '0'));
          if (!Number.isNaN(v)) total += v;
        }
      } catch {
        break;
      }
    }
  }
  return total;
}

async function countAnggotaForJenis(jenisId: number): Promise<number> {
  let page = 1;
  const perPage = 100;
  const seen = new Set<number>();
  const pickArray = (r: any): any[] | null => {
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.data?.data)) return r.data.data;
    if (Array.isArray(r?.data)) return r.data;
    return null;
  };
  const pickLast = (r: any): number | null => (
    Number(r?.data?.last_page) || Number(r?.meta?.last_page) || Number(r?.last_page) || Number(r?.pagination?.last_page) || null
  );
  let lastPage = 1;
  try {
    const first: any = await apiRequest('GET', `/api/simpanans?jenis_simpanan_id=${jenisId}&page=1&per_page=${perPage}`);
    const items1 = pickArray(first) ?? [];
    lastPage = pickLast(first) || 1;
    for (const it of items1) {
      const id = Number(it?.anggota_id);
      if (Number.isFinite(id)) seen.add(id);
    }
  } catch {}
  if (lastPage > 1) {
    for (page = 2; page <= lastPage; page++) {
      try {
        const r: any = await apiRequest('GET', `/api/simpanans?jenis_simpanan_id=${jenisId}&page=${page}&per_page=${perPage}`);
        const items = pickArray(r) ?? [];
        for (const it of items) {
          const id = Number(it?.anggota_id);
          if (Number.isFinite(id)) seen.add(id);
        }
      } catch {
        break;
      }
    }
  }
  return seen.size;
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react"; // ⬅️ tambahkan useEffect
import { getJenisIdFromEnv, fetchJenisById } from "@/lib/jenisSimpanan";
import {
  LayoutDashboard,
  Wallet,
  BookMarked,
  FileText,
  Users,
  BadgeCheck,
  UserPlus,
  ChevronDown,
  Bell,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { logout } from "@/lib/auth";
import PermissionGate from "@/components/permission-gate";

type Item = {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: Item[];
};

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  // Match full segment to avoid '/wajib' matching '/wajib_usaha'
  return pathname === href || pathname.startsWith(href + "/");
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  const menu = useMemo<Item[]>(
    () => [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Simpanan",
        icon: Wallet,
        children: [
          { label: "Sukarela", href: "/dashboard/simpanan/sukarela" },
          { label: "Wajib Usaha", href: "/dashboard/simpanan/wajib_usaha" },
          { label: "Berjangka", href: "/dashboard/simpanan/berjangka" },
          { label: "Pokok", href: "/dashboard/simpanan/pokok" },
          { label: "Wajib", href: "/dashboard/simpanan/wajib" },
          { label: "Wajib Khusus", href: "/dashboard/simpanan/wajib_khusus" },
          { label: "Khusus", href: "/dashboard/simpanan/khusus" },
          { label: "Modal", href: "/dashboard/simpanan/modal" },
        ],
      },
      {
        label: "Tabungan",
        icon: BookMarked,
        children: [
          { label: "Harian", href: "/dashboard/tabungan/harian" },
          { label: "Berjangka", href: "/dashboard/tabungan/berjangka" },
          { label: "Deposito", href: "/dashboard/tabungan/deposito" },
          { label: "Bunga Tabungan", href: "/dashboard/bunga-tabungan" },
        ],
      },
      { label: "Pengaturan Bunga", href: "/dashboard/pengaturan-bunga", icon: FileText },
      { label: "Laporan", href: "/dashboard/laporan", icon: FileText },
    ],
    []
  );

  // Dynamically update Simpanan submenu labels from backend by ID, if provided in env
  useEffect(() => {
    const keys: Array<{ key: string; index: number; fallback: string }> = [
      { key: 'sukarela', index: 0, fallback: 'Sukarela' },
      { key: 'wajib_usaha', index: 1, fallback: 'Wajib Usaha' },
      { key: 'berjangka', index: 2, fallback: 'Berjangka' },
      { key: 'pokok', index: 3, fallback: 'Pokok' },
      { key: 'wajib', index: 4, fallback: 'Wajib' },
      { key: 'wajib_khusus', index: 5, fallback: 'Wajib Khusus' },
      { key: 'khusus', index: 6, fallback: 'Khusus' },
      { key: 'modal', index: 7, fallback: 'Modal' },
    ];
    let mounted = true;
    async function load() {
      const cloned = structuredClone(menu) as Item[];
      const simpanan = cloned.find((m) => m.label === 'Simpanan');
      if (!simpanan || !simpanan.children) return;
      await Promise.all(keys.map(async ({ key, index, fallback }) => {
        const id = getJenisIdFromEnv(key as any);
        if (!id) return; // keep fallback
        const jenis = await fetchJenisById(id);
        if (mounted && jenis?.nama) {
          simpanan.children![index].label = jenis.nama || fallback;
        }
      }));
      if (mounted) {
        // Force re-render by updating open state; menu is memoized, but children references updated
        setOpen((o) => ({ ...o }));
      }
    }
    load();
    return () => { mounted = false };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const admin = useMemo<Item[]>(
    () => [
      { label: "Users", href: "/dashboard/users", icon: Users },
      { label: "Roles", href: "/dashboard/roles", icon: BadgeCheck },
      { label: "Anggota", href: "/dashboard/anggota", icon: UserPlus },
      { label: "Generate Bunga", href: "/dashboard/generate-bunga", icon: FileText },
    ],
    []
  );

  // ⬇️ Tutup semua grup di awal, tapi buka otomatis kalau ada child yang aktif
  const initialOpen = useMemo(() => {
    const state: Record<string, boolean> = {};
    for (const item of menu) {
      if (item.children) {
        state[item.label] = item.children.some((c) => isActive(pathname, c.href)) || false;
      }
    }
    return state;
  }, [menu, pathname]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  // ⬇️ Saat route berubah, pastikan grup yang aktif otomatis terbuka (tanpa memaksa grup lain menutup)
  useEffect(() => {
    setOpen((o) => {
      const next = { ...o };
      for (const item of menu) {
        if (item.children && item.children.some((c) => isActive(pathname, c.href))) {
          next[item.label] = true;
        }
      }
      return next;
    });
  }, [pathname, menu]);

  return (
    <aside className="h-screen sticky top-0 w-[248px] shrink-0 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 flex h-full flex-col gap-6">
        <div className="flex items-center justify-center pt-2">
          <Image src="/logo_koperasi.png" alt="logo koperasi" width={128} height={128} className="rounded" />
        </div>

        <nav className="flex flex-col gap-6 flex-1">
          <div>
            <div className="px-3 pb-2 text-xs font-medium tracking-wide text-muted-foreground">Menu</div>
            <ul className="space-y-1">
              {menu.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    <Collapsible
                      label={item.label}
                      icon={item.icon}
                      active={item.children.some((c) => isActive(pathname, c.href))}
                      open={open[item.label]}
                      onToggle={() => setOpen((o) => ({ ...o, [item.label]: !o[item.label] }))}
                    >
                      {item.children.map((c) => {
                        const link = (
                          <SidebarLink key={c.label} href={c.href!} active={isActive(pathname, c.href)}>
                            {c.label}
                          </SidebarLink>
                        );
                        if (c.label === 'Bunga Tabungan') {
                          return (
                            <PermissionGate key={c.label} required={["mengelola bunga"]}>
                              {link}
                            </PermissionGate>
                          );
                        }
                        return link;
                      })}
                    </Collapsible>
                  ) : item.label === 'Pengaturan Bunga' ? (
                    <PermissionGate required={["mengelola pengaturan"]}>
                      <SidebarItem href={item.href!} icon={item.icon} active={isActive(pathname, item.href)}>
                        {item.label}
                      </SidebarItem>
                    </PermissionGate>
                  ) : (
                    <SidebarItem href={item.href!} icon={item.icon} active={isActive(pathname, item.href)}>
                      {item.label}
                    </SidebarItem>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="px-3 pb-2 text-xs font-medium tracking-wide text-muted-foreground">Admin</div>
            <ul className="space-y-1">
              {admin.map((item) => {
                if (item.label === 'Generate Bunga') {
                  return (
                    <li key={item.label}>
                      <PermissionGate required={["mengelola bunga"]}>
                        <SidebarItem href={item.href!} icon={item.icon} active={isActive(pathname, item.href)}>
                          {item.label}
                        </SidebarItem>
                      </PermissionGate>
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <SidebarItem href={item.href!} icon={item.icon} active={isActive(pathname, item.href)}>
                      {item.label}
                    </SidebarItem>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <ProfileMenu />
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  active,
  children,
}: {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        "mx-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors " +
        (active ? "bg-emerald-400/70 text-emerald-950 hover:bg-emerald-400" : "hover:bg-muted text-foreground")
      }
    >
      {Icon ? <Icon className="size-4" /> : null}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div className="mt-auto" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted text-foreground"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300">
          <UserIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium leading-none">Profil</div>
          <div className="text-xs text-muted-foreground">Akun & notifikasi</div>
        </div>
        <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="mt-2 mx-2 rounded-xl border bg-popover text-popover-foreground shadow-md overflow-hidden"
        >
          <a
            href="/dashboard/notifikasi"
            className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/80"
            role="menuitem"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span>Notifikasi</span>
          </a>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-red-50 text-foreground"
            role="menuitem"
          >
            <LogOut className="h-4 w-4 text-red-600" />
            <span className="text-red-700">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Collapsible({
  label,
  icon: Icon,
  active,
  open,
  onToggle,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  open?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-2">
      <button
        type="button"
        onClick={onToggle}
        className={
          "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors " +
          (active ? "bg-emerald-400/70 text-emerald-950 hover:bg-emerald-400" : "hover:bg-muted text-foreground")
        }
        aria-expanded={open}
        aria-controls={`section-${label}`}
      >
        <span className="flex items-center gap-3">
          {Icon ? <Icon className="size-4" /> : null}
          <span className="font-medium">{label}</span>
        </span>
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
      </button>
      {open && (
        <div id={`section-${label}`} className="mt-1 rounded-xl border bg-background shadow-sm">
          <div className="p-2 space-y-1">{children}</div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        "block rounded-lg px-3 py-2 text-sm transition-colors " +
        (active ? "bg-emerald-100 text-emerald-900" : "hover:bg-muted text-foreground")
      }
    >
      {children}
    </Link>
  );
}

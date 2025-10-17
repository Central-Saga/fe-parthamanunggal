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

  // Custom icon for "Pengaturan Bunga" to match requested SVG
  const PengaturanIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
      />
    </svg>
  );

  // Custom icon for "Neraca"
  const NeracaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v7.5m2.25-6.466a9.016 9.016 0 0 0-3.461-.203c-.536.072-.974.478-1.021 1.017a4.559 4.559 0 0 0-.018.402c0 .464.336.844.775.994l2.95 1.012c.44.15.775.53.775.994 0 .136-.006.27-.018.402-.047.539-.485.945-1.021 1.017a9.077 9.077 0 0 1-3.461-.203M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );

  // Custom icon for "Akun (COA)"
  const AkunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );

  // Custom icon for "Generate Bunga"
  const GenerateBungaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );

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
          { label: "Catat Tabungan", href: "/dashboard/catat-tabungan" },
          { label: "Harian", href: "/dashboard/tabungan/harian" },
          { label: "Berjangka", href: "/dashboard/tabungan/berjangka" },
          { label: "Deposito", href: "/dashboard/tabungan/deposito" },
          { label: "Bunga Tabungan", href: "/dashboard/bunga-tabungan" },
        ],
      },
      { label: "Pengaturan Bunga", href: "/dashboard/pengaturan-bunga", icon: PengaturanIcon },
      // { label: "Laporan", href: "/dashboard/laporan", icon: FileText },
      { label: "Neraca", href: "/dashboard/laporan/neraca-harian", icon: NeracaIcon },
      { label: "Jurnal Umum", href: "/dashboard/jurnal", icon: FileText },
      { label: "Akun (COA)", href: "/dashboard/akun", icon: AkunIcon },
    ],
    []
  );

  // Determine which hrefs should only match exactly (to avoid parent prefix being active, e.g. '/dashboard/laporan' vs '/dashboard/laporan/neraca-harian')
  const exactOnlyHrefs = useMemo(() => {
    const hrefs: string[] = [];
    for (const it of menu) {
      if (it.href) hrefs.push(it.href);
      if (it.children) for (const c of it.children) if (c.href) hrefs.push(c.href);
    }
    // Include admin links too
    const adminList: Item[] = [
      { label: "Users", href: "/dashboard/users" },
      { label: "Roles", href: "/dashboard/roles" },
      { label: "Anggota", href: "/dashboard/anggota" },
      { label: "Generate Bunga", href: "/dashboard/generate-bunga" },
    ];
    for (const it of adminList) if (it.href) hrefs.push(it.href);

    const set = new Set<string>();
    for (const h of hrefs) {
      for (const other of hrefs) {
        if (h !== other && other.startsWith(h + "/")) {
          set.add(h);
          break;
        }
      }
    }
    return set;
  }, [menu]);

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
      { label: "Generate Bunga", href: "/dashboard/generate-bunga", icon: GenerateBungaIcon },
      { label: "Pengaturan Bunga", href: "/dashboard/pengaturan-bunga", icon: PengaturanIcon },
    ],
    []
  );

  // ⬇️ Tutup semua grup di awal, tapi buka otomatis kalau ada child yang aktif
  const initialOpen = useMemo(() => {
    const state: Record<string, boolean> = {};
    let openedOnce = false;
    for (const item of menu) {
      if (item.children) {
        const shouldOpen = !openedOnce && item.children.some((c) => isActive(pathname, c.href));
        state[item.label] = shouldOpen;
        if (shouldOpen) openedOnce = true;
      }
    }
    return state;
  }, [menu, pathname]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  // ⬇️ Saat route berubah, pastikan grup yang aktif otomatis terbuka (tanpa memaksa grup lain menutup)
  useEffect(() => {
    const next: Record<string, boolean> = {};
    let openedOnce = false;
    for (const item of menu) {
      if (item.children) {
        const shouldOpen = !openedOnce && item.children.some((c) => isActive(pathname, c.href));
        next[item.label] = shouldOpen;
        if (shouldOpen) openedOnce = true;
      }
    }
    setOpen(next);
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
                      onToggle={() =>
                        setOpen((prev) => {
                          const isCurrentlyOpen = !!prev[item.label];
                          const next: Record<string, boolean> = {};
                          for (const k of Object.keys(prev)) next[k] = false;
                          if (!isCurrentlyOpen) next[item.label] = true;
                          return next;
                        })
                      }
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
                      <SidebarItem
                        href={item.href!}
                        icon={item.icon}
                        active={exactOnlyHrefs.has(item.href!) ? pathname === item.href : isActive(pathname, item.href)}
                      >
                        {item.label}
                      </SidebarItem>
                    </PermissionGate>
                  ) : (
                    <SidebarItem
                      href={item.href!}
                      icon={item.icon}
                      active={exactOnlyHrefs.has(item.href!) ? pathname === item.href : isActive(pathname, item.href)}
                    >
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
                    <SidebarItem
                      href={item.href!}
                      icon={item.icon}
                      active={exactOnlyHrefs.has(item.href!) ? pathname === item.href : isActive(pathname, item.href)}
                    >
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
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="mt-auto relative mx-2" ref={ref}>
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
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full mb-2 left-0 right-0 z-50 rounded-xl border bg-popover text-popover-foreground shadow-md overflow-hidden"
        >
          <Link
            href="/dashboard/notifikasi"
            className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/80"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span>Notifikasi</span>
          </Link>
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

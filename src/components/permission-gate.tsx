"use client";

import { useEffect, useState } from 'react';

export function usePermissions(): string[] {
  const [perms, setPerms] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('permissions');
      const arr = raw ? JSON.parse(raw) : [];
      setPerms(Array.isArray(arr) ? arr : []);
    } catch {
      setPerms([]);
    }
  }, []);
  return perms;
}

export default function PermissionGate({
  required,
  children,
  fallback = null,
}: {
  required: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const perms = usePermissions();
  const needs = Array.isArray(required) ? required : [required];
  const ok = needs.every((p) => perms.includes(p));
  if (!ok) return <>{fallback}</>;
  return <>{children}</>;
}


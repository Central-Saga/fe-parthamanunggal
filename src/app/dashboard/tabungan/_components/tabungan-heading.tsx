"use client";

import { useEffect, useState } from "react";
import type { TabunganKey } from "@/lib/jenisTabungan";
import { fetchTabunganJenisById, getTabunganJenisIdFromEnv, getTabunganJenisIdRuntime, resolveTabunganJenisId } from "@/lib/jenisTabungan";

export default function TabunganHeading({ jenisKey, fallback }: { jenisKey: TabunganKey; fallback: string }) {
  const [name, setName] = useState<string>(fallback);

  useEffect(() => {
    let mounted = true;
    async function load() {
      let id = getTabunganJenisIdFromEnv(jenisKey) ?? (await getTabunganJenisIdRuntime(jenisKey)) ?? (await resolveTabunganJenisId(jenisKey));
      if (!id) return; // keep fallback
      const jenis = await fetchTabunganJenisById(id);
      if (mounted && jenis?.nama) setName(jenis.nama);
    }
    load();
    return () => { mounted = false };
  }, [jenisKey]);

  return <h1 className="text-2xl font-semibold">Tabungan - {name}</h1>;
}


"use client";

import { useEffect, useState } from "react";
import type { JenisKey } from "@/lib/jenisSimpanan";
import { fetchJenisById, getJenisIdFromEnv, resolveJenisId } from "@/lib/jenisSimpanan";

export default function JenisHeading({ jenisKey, fallback }: { jenisKey: JenisKey; fallback: string }) {
  const [name, setName] = useState<string>(fallback);

  useEffect(() => {
    let mounted = true;
    async function load() {
      let id = getJenisIdFromEnv(jenisKey) ?? (await resolveJenisId(jenisKey));
      if (!id) return; // keep fallback
      const jenis = await fetchJenisById(id);
      if (mounted && jenis?.nama) setName(jenis.nama);
    }
    load();
    return () => { mounted = false };
  }, [jenisKey]);

  return <h1 className="text-2xl font-semibold">Simpanan - {name}</h1>;
}


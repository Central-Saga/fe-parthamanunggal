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
      if (!id) return; // keep fallback (already customized by caller)
      const jenis = await fetchJenisById(id);
      if (!mounted) return;

      // Gunakan nama override untuk jenis tertentu,
      // agar tidak kembali ke label lama dari backend.
      let displayName: string = jenis?.nama ?? fallback;
      if (jenisKey === "berjangka") {
        displayName = "SSK (Sertifikat Simpanan Khusus)";
      } else if (jenisKey === "modal") {
        displayName = "Ekuitas";
      }

      setName(displayName);
    }
    load();
    return () => { mounted = false };
  }, [jenisKey, fallback]);

  return <h1 className="text-2xl font-semibold">Simpanan - {name}</h1>;
}


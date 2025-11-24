"use client";
import { useParams } from "next/navigation";
import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananBerjangkaEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <SimpananForm
      jenisKey="berjangka"
      mode="edit"
      id={id}
      backHref="/dashboard/simpanan/berjangka"
      title="Edit SSK (Sertifikat Simpanan Khusus)"
      subtitle="Perbarui data Sertifikat Simpanan Khusus"
    />
  );
}


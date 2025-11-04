"use client";
import { useParams } from "next/navigation";
import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananWajibEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <SimpananForm
      jenisKey="wajib"
      mode="edit"
      id={id}
      backHref="/dashboard/simpanan/wajib"
      title="Edit Simpanan Wajib"
      subtitle="Perbarui data simpanan wajib"
    />
  );
}


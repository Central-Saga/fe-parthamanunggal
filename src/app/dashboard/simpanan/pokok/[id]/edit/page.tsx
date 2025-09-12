"use client";
import { useParams } from "next/navigation";
import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananPokokEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <SimpananForm
      jenisKey="pokok"
      mode="edit"
      id={id}
      backHref="/dashboard/simpanan/pokok"
      title="Edit Simpanan Pokok"
      subtitle="Perbarui data simpanan pokok"
    />
  );
}


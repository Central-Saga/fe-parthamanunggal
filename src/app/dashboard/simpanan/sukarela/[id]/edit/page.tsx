"use client";
import { useParams } from "next/navigation";
import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananSukarelaEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <SimpananForm
      jenisKey="sukarela"
      mode="edit"
      id={id}
      backHref="/dashboard/simpanan/sukarela"
      title="Edit Simpanan Sukarela"
      subtitle="Perbarui data simpanan sukarela"
    />
  );
}


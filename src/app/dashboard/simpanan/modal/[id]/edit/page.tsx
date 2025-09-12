"use client";
import { useParams } from "next/navigation";
import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananModalEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <SimpananForm
      jenisKey="modal"
      mode="edit"
      id={id}
      backHref="/dashboard/simpanan/modal"
      title="Edit Simpanan Modal"
      subtitle="Perbarui data simpanan modal"
    />
  );
}


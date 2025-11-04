"use client";
import { useParams } from "next/navigation";
import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananKhususEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <SimpananForm
      jenisKey="khusus"
      mode="edit"
      id={id}
      backHref="/dashboard/simpanan/khusus"
      title="Edit Simpanan Khusus"
      subtitle="Perbarui data simpanan khusus"
    />
  );
}


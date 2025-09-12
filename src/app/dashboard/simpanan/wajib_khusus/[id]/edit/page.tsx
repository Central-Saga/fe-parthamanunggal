"use client";
import { useParams } from "next/navigation";
import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananWajibKhususEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <SimpananForm
      jenisKey="wajib_khusus"
      mode="edit"
      id={id}
      backHref="/dashboard/simpanan/wajib_khusus"
      title="Edit Simpanan Wajib Khusus"
      subtitle="Perbarui data simpanan wajib khusus"
    />
  );
}


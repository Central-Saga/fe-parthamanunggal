"use client";
import { useParams } from "next/navigation";
import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananWajibUsahaEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <SimpananForm
      jenisKey="wajib_usaha"
      mode="edit"
      id={id}
      backHref="/dashboard/simpanan/wajib_usaha"
      title="Edit Simpanan Wajib Usaha"
      subtitle="Perbarui data simpanan wajib usaha"
    />
  );
}


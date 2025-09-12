"use client";
import { useParams } from "next/navigation";
import TabunganForm from "@/app/dashboard/tabungan/_components/tabungan-form";

export default function TabunganBerjangkaEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <TabunganForm
      jenisKey="berjangka"
      mode="edit"
      id={id}
      backHref="/dashboard/tabungan/berjangka"
      title="Edit Tabungan Berjangka"
      subtitle="Perbarui data tabungan berjangka"
    />
  );
}


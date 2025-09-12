"use client";
import { useParams } from "next/navigation";
import TabunganForm from "@/app/dashboard/tabungan/_components/tabungan-form";

export default function TabunganHarianEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <TabunganForm
      jenisKey="harian"
      mode="edit"
      id={id}
      backHref="/dashboard/tabungan/harian"
      title="Edit Tabungan Harian"
      subtitle="Perbarui data tabungan harian"
    />
  );
}


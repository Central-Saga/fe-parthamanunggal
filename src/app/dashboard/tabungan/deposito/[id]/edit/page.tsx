"use client";
import { useParams } from "next/navigation";
import TabunganForm from "@/app/dashboard/tabungan/_components/tabungan-form";

export default function TabunganDepositoEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <TabunganForm
      jenisKey="deposito"
      mode="edit"
      id={id}
      backHref="/dashboard/tabungan/deposito"
      title="Edit Tabungan Deposito"
      subtitle="Perbarui data tabungan deposito"
    />
  );
}


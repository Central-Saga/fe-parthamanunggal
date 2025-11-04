import TabunganForm from "@/app/dashboard/tabungan/_components/tabungan-form";

export default function TabunganDepositoCreatePage() {
  return (
    <TabunganForm
      jenisKey="deposito"
      mode="create"
      backHref="/dashboard/tabungan/deposito"
      title="Buat Tabungan Deposito"
      subtitle="Isi data tabungan deposito"
    />
  );
}


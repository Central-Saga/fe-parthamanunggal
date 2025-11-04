import TabunganForm from "@/app/dashboard/tabungan/_components/tabungan-form";

export default function TabunganBerjangkaCreatePage() {
  return (
    <TabunganForm
      jenisKey="berjangka"
      mode="create"
      backHref="/dashboard/tabungan/berjangka"
      title="Buat Tabungan Berjangka"
      subtitle="Isi data tabungan berjangka"
    />
  );
}


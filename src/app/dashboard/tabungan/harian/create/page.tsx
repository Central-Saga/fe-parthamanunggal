import TabunganForm from "@/app/dashboard/tabungan/_components/tabungan-form";

export default function TabunganHarianCreatePage() {
  return (
    <TabunganForm
      jenisKey="harian"
      mode="create"
      backHref="/dashboard/tabungan/harian"
      title="Buat Tabungan Harian"
      subtitle="Isi data tabungan harian"
    />
  );
}


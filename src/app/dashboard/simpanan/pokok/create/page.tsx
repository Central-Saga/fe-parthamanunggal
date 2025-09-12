import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananPokokCreatePage() {
  return (
    <SimpananForm
      jenisKey="pokok"
      mode="create"
      backHref="/dashboard/simpanan/pokok"
      title="Buat Simpanan Pokok"
      subtitle="Isi data simpanan pokok"
    />
  );
}


import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananBerjangkaCreatePage() {
  return (
    <SimpananForm
      jenisKey="berjangka"
      mode="create"
      backHref="/dashboard/simpanan/berjangka"
      title="Buat Simpanan Berjangka"
      subtitle="Isi data simpanan berjangka"
    />
  );
}


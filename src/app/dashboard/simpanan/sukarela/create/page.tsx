import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananSukarelaCreatePage() {
  return (
    <SimpananForm
      jenisKey="sukarela"
      mode="create"
      backHref="/dashboard/simpanan/sukarela"
      title="Buat Simpanan Sukarela"
      subtitle="Isi data simpanan sukarela"
    />
  );
}


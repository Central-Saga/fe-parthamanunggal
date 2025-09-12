import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananModalCreatePage() {
  return (
    <SimpananForm
      jenisKey="modal"
      mode="create"
      backHref="/dashboard/simpanan/modal"
      title="Buat Simpanan Modal"
      subtitle="Isi data simpanan modal"
    />
  );
}


import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananWajibCreatePage() {
  return (
    <SimpananForm
      jenisKey="wajib"
      mode="create"
      backHref="/dashboard/simpanan/wajib"
      title="Buat Simpanan Wajib"
      subtitle="Isi data simpanan wajib"
    />
  );
}


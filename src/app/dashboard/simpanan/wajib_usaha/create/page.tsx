import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananWajibUsahaCreatePage() {
  return (
    <SimpananForm
      jenisKey="wajib_usaha"
      mode="create"
      backHref="/dashboard/simpanan/wajib_usaha"
      title="Buat Simpanan Wajib Usaha"
      subtitle="Isi data simpanan wajib usaha"
    />
  );
}


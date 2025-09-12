import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananWajibKhususCreatePage() {
  return (
    <SimpananForm
      jenisKey="wajib_khusus"
      mode="create"
      backHref="/dashboard/simpanan/wajib_khusus"
      title="Buat Simpanan Wajib Khusus"
      subtitle="Isi data simpanan wajib khusus"
    />
  );
}


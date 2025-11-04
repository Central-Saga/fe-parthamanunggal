import SimpananForm from "@/app/dashboard/simpanan/_components/simpanan-form";

export default function SimpananKhususCreatePage() {
  return (
    <SimpananForm
      jenisKey="khusus"
      mode="create"
      backHref="/dashboard/simpanan/khusus"
      title="Buat Simpanan Khusus"
      subtitle="Isi data simpanan khusus"
    />
  );
}


import LaporanForm from "@/app/dashboard/laporan/_components/laporan-form";

export default function LaporanCreatePage() {
  return (
    <LaporanForm mode="create" backHref="/dashboard/laporan" title="Buat Laporan" subtitle="Isi data laporan" />
  );
}


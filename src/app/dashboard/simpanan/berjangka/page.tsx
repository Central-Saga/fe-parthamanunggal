import SimpananBerjangkaDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananBerjangkaPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="berjangka" fallback="SSK (Sertifikat Simpanan Khusus)" />
        <p className="text-sm text-muted-foreground">Daftar Sertifikat Simpanan Khusus dari backend.</p>
      </div>

      <SimpananBerjangkaDataTable />
    </div>
  );
}


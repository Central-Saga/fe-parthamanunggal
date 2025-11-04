import SimpananWajibDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananWajibPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="wajib" fallback="Wajib" />
        <p className="text-sm text-muted-foreground">Daftar simpanan wajib dari backend.</p>
      </div>

      <SimpananWajibDataTable />
    </div>
  );
}


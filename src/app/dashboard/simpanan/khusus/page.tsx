import SimpananKhususDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananKhususPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="khusus" fallback="Khusus" />
        <p className="text-sm text-muted-foreground">Daftar simpanan khusus dari backend.</p>
      </div>

      <SimpananKhususDataTable />
    </div>
  );
}


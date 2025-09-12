import SimpananWajibKhususDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananWajibKhususPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="wajib_khusus" fallback="Wajib Khusus" />
        <p className="text-sm text-muted-foreground">Daftar simpanan wajib khusus dari backend.</p>
      </div>

      <SimpananWajibKhususDataTable />
    </div>
  );
}


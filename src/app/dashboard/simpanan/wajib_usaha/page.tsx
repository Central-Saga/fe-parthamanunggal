import SimpananWajibUsahaDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananWajibUsahaPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="wajib_usaha" fallback="Wajib Usaha" />
        <p className="text-sm text-muted-foreground">Daftar simpanan wajib usaha dari backend.</p>
      </div>

      <SimpananWajibUsahaDataTable />
    </div>
  );
}


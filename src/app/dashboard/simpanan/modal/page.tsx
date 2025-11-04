import SimpananModalDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananModalPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="modal" fallback="Modal" />
        <p className="text-sm text-muted-foreground">Daftar simpanan modal dari backend.</p>
      </div>

      <SimpananModalDataTable />
    </div>
  );
}


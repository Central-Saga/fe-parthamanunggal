import SimpananBerjangkaDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananBerjangkaPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="berjangka" fallback="Berjangka" />
        <p className="text-sm text-muted-foreground">Daftar simpanan berjangka dari backend.</p>
      </div>

      <SimpananBerjangkaDataTable />
    </div>
  );
}


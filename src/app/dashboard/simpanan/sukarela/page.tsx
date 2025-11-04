import SimpananSukarelaDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananSukarelaPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="sukarela" fallback="Sukarela" />
        <p className="text-sm text-muted-foreground">Daftar simpanan sukarela dari backend.</p>
      </div>

      <SimpananSukarelaDataTable />
    </div>
  );
}


import SimpananPokokDataTable from './data-table';
import JenisHeading from "@/app/dashboard/simpanan/_components/jenis-heading";

export default function SimpananPokokPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <JenisHeading jenisKey="pokok" fallback="Pokok" />
        <p className="text-sm text-muted-foreground">Daftar simpanan pokok dari backend.</p>
      </div>

      <SimpananPokokDataTable />
    </div>
  );
}


import TabunganHarianDataTable from './data-table';
import TabunganHeading from "@/app/dashboard/tabungan/_components/tabungan-heading";

export default function TabunganHarianPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <TabunganHeading jenisKey="harian" fallback="Harian" />
        <p className="text-sm text-muted-foreground">Daftar tabungan harian dari backend.</p>
      </div>

      <TabunganHarianDataTable />
    </div>
  );
}


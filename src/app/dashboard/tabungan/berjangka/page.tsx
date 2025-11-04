import TabunganBerjangkaDataTable from './data-table';
import TabunganHeading from "@/app/dashboard/tabungan/_components/tabungan-heading";

export default function TabunganBerjangkaPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <TabunganHeading jenisKey="berjangka" fallback="Berjangka" />
        <p className="text-sm text-muted-foreground">Daftar tabungan berjangka dari backend.</p>
      </div>

      <TabunganBerjangkaDataTable />
    </div>
  );
}


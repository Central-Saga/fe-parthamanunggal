import TabunganDepositoDataTable from './data-table';
import TabunganHeading from "@/app/dashboard/tabungan/_components/tabungan-heading";

export default function TabunganDepositoPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <TabunganHeading jenisKey="deposito" fallback="Deposito" />
        <p className="text-sm text-muted-foreground">Daftar tabungan deposito dari backend.</p>
      </div>

      <TabunganDepositoDataTable />
    </div>
  );
}


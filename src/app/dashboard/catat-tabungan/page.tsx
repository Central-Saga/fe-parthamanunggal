import CatatTabunganDataTable from './data-table';

export default function CatatTabunganPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Catat Tabungan</h1>
        <p className="text-sm text-muted-foreground">Akses cepat untuk menambah atau mengurangi saldo tabungan harian.</p>
      </div>

      <CatatTabunganDataTable />
    </div>
  );
}


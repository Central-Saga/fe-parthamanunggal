export type NeracaRow = {
  kode_akun: string;
  nama_akun: string;
  saldo_awal: number;
  mutasi_debet: number;
  mutasi_kredit: number;
  saldo_akhir: number;
};

export type NeracaResponse = {
  tanggal: string;
  data: NeracaRow[];
  ringkasan: {
    total_debet: number;
    total_kredit: number;
    // Harian fields
    shu_awal?: number;
    shu_harian?: number;
    shu_kumulatif?: number;
    // Bulanan fields (from backend aggregation)
    pendapatan_bulan?: number;
    biaya_bulan?: number;
    shu_bulanan?: number;
    // Tahunan fields (aggregated by backend)
    pendapatan_tahun?: number;
    biaya_tahun?: number;
    shu_tahunan?: number;
    // Flexible aliases
    pendapatan?: number;
    biaya?: number;
    laba_rugi?: number; // SHU bulanan
    source?: 'snapshot' | 'jurnal';
  };
};

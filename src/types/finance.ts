export type NeracaRow = { kode_akun: string; nama_akun: string; saldo_awal: number; mutasi_debet: number; mutasi_kredit: number; saldo_akhir: number };
export type NeracaHarianResponse = {
  tanggal: string;
  data: NeracaRow[];
  ringkasan: {
    total_debet: number;
    total_kredit: number;
    // Harian
    shu_awal?: number;
    shu_harian?: number;
    shu_kumulatif?: number;
    // Bulanan
    pendapatan_bulan?: number;
    biaya_bulan?: number;
    shu_bulanan?: number;
    // Tahunan
    pendapatan_tahun?: number;
    biaya_tahun?: number;
    shu_tahunan?: number;
    // Aliases for flexibility
    pendapatan?: number;
    biaya?: number;
    laba_rugi?: number;
    source?: 'snapshot'|'jurnal';
  }
};
export type ShuAwalPayload = { tanggal: string; nilai: number; akun_shu_id?: number; akun_lawan_id?: number; idempotency_key?: string };

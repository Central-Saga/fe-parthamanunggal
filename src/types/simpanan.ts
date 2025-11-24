export interface Simpanan {
  id: number; // bigint
  anggota_id: number; // unsignedBigInteger (FK to anggota.id)
  jenis_simpanan_id: number; // unsignedBigInteger (FK to jenis_simpanan.id)
  nominal: number; // decimal(18,2)
  tanggal: string; // date (YYYY-MM-DD)
  keterangan?: string | null; // text, nullable
  status: string; // enum('Aktif','Non Aktif') in DB
  created_at: string; // timestamp (ISO string)
  updated_at: string; // timestamp (ISO string)
  // Optional eager-loaded relations from backend
  anggota?: {
    id: number;
    nama: string;
    // Relasi ke user (jika di-load di backend)
    user?: {
      id: number;
      email: string;
      status: string;
    } | null;
  } | null;
  jenis_simpanan?: {
    id: number;
    nama: string;
  } | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export type Akun = {
  id: number;
  kode_akun: string;
  nama_akun: string;
  tipe?: 'aset' | 'kewajiban' | 'modal' | 'pendapatan' | 'biaya' | null;
  saldo_normal?: 'debit' | 'kredit' | null;
  parent_id?: number | null;
  is_header: boolean;
  level: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};


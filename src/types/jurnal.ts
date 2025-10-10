export type JurnalDetail = {
  id?: number;
  akun_id: number;
  debet?: number;
  kredit?: number;
};

export type Jurnal = {
  id: number;
  tanggal: string;
  no_bukti?: string | null;
  sumber?: string | null;
  sumber_id?: number | null;
  keterangan?: string | null;
  details: JurnalDetail[];
};


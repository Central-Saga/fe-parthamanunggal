import { apiRequest } from './api';
import type { NeracaResponse } from '@/types/laporan';

export const laporanApi = {
  getNeracaHarian: (tanggal: string) =>
    apiRequest<NeracaResponse>('GET', '/api/laporan/neraca-harian', undefined, { params: { tanggal } }),
};


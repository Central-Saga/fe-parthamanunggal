import { apiRequest } from '@/lib/api';
import type { NeracaHarianResponse, ShuAwalPayload } from '@/types/finance';

export const financeApi = {
  // Neraca Harian (snapshot/jurnal-aware)
  async getNeracaHarian(tanggal: string): Promise<NeracaHarianResponse> {
    return apiRequest<NeracaHarianResponse>('GET', '/api/laporan/neraca-harian', undefined, { params: { tanggal } });
  },

  // Input SHU Awal (idempotent by backend key)
  async postShuAwal(payload: ShuAwalPayload): Promise<{ tanggal: string; result: any }> {
    const res = await apiRequest<any>('POST', '/api/laporan/shu-awal', payload);
    return { tanggal: payload.tanggal, result: res };
  },

  // Placeholders for future endpoints
  async getShuBulanan(tahun: number, bulan: number): Promise<{ tahun: number; bulan: number; shu_bulanan: number; days: number }> {
    // To be replaced when backend available
    return apiRequest('GET', '/api/laporan/shu-bulanan', undefined, { params: { tahun, bulan } });
  },

  async getShuTahunan(tahun: number): Promise<{ tahun: number; shu_tahunan: number; days: number }> {
    // To be replaced when backend available
    return apiRequest('GET', '/api/laporan/shu-tahunan', undefined, { params: { tahun } });
  },
};
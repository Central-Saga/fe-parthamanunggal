import { apiRequest } from './api';
import type { Akun, Paginated } from '@/types/akun';

export const akunApi = {
  list: (params?: Record<string, any>) =>
    apiRequest<Paginated<Akun> | Akun[]>('GET', '/api/akuns', undefined, { params }),
  show: (id: number) => apiRequest<Akun>('GET', `/api/akuns/${id}`),
  saldoAwal: (id: number, tanggal: string) =>
    apiRequest<{ debet: number; kredit: number }>('GET', `/api/akuns/${id}/saldo-awal`, undefined, { params: { tanggal } }),
  setSaldoAwal: (id: number, tanggal: string, payload: { debet: number; kredit: number }) =>
    apiRequest<{ message: string }>('PUT', `/api/akuns/${id}/saldo-awal`, { tanggal, ...payload }),
  create: (payload: Partial<Akun>) => apiRequest<Akun>('POST', '/api/akuns', payload),
  update: (id: number, payload: Partial<Akun>) => apiRequest<Akun>('PUT', `/api/akuns/${id}`, payload),
  remove: (id: number) => apiRequest<{ message: string }>('DELETE', `/api/akuns/${id}`),
};

import { apiRequest } from './api';
import type { Akun, Paginated } from '@/types/akun';

const SALDO_AWAL_PATH_TMPL = (process.env.NEXT_PUBLIC_SALDO_AWAL_PATH || '/api/akuns/:id/saldo-awal').trim();
const SALDO_AWAL_METHOD = ((process.env.NEXT_PUBLIC_SALDO_AWAL_METHOD || 'PUT').toUpperCase()) as 'PUT'|'POST'|'PATCH';

function pathSaldoAwal(id: number) {
  return SALDO_AWAL_PATH_TMPL.replace(':id', String(id));
}

export const akunApi = {
  list: (params?: Record<string, any>) =>
    apiRequest<Paginated<Akun> | Akun[]>('GET', '/api/akuns', undefined, { params }),
  show: (id: number) => apiRequest<Akun>('GET', `/api/akuns/${id}`),
  saldoAwal: (id: number, tanggal: string) =>
    apiRequest<{ debet: number; kredit: number }>('GET', pathSaldoAwal(id), undefined, { params: { tanggal } }),
  // Set saldo awal. Coba PUT terlebih dahulu; fallback ke POST jika backend hanya mendukung POST.
  setSaldoAwal: async (id: number, tanggal: string, payload: { debet: number; kredit: number }) => {
    const template = SALDO_AWAL_PATH_TMPL;
    const includeIdInBody = !template.includes(':id');
    const body = { tanggal, ...(includeIdInBody ? { akun_id: id } : {}), ...payload } as const;
    const url = pathSaldoAwal(id);
    const tryOrder: Array<'PUT'|'PATCH'|'POST'> = [SALDO_AWAL_METHOD, ...(['PUT','PATCH','POST'] as const).filter(m => m !== SALDO_AWAL_METHOD)];
    let lastErr: any;
    for (const method of tryOrder) {
      try {
        return await apiRequest<{ message: string }>(method, url, body);
      } catch (e: any) {
        lastErr = e;
        const status = e?.response?.status || e?.status;
        if (status && status !== 405 && status !== 404) break;
      }
    }
    throw lastErr;
  },
  create: (payload: Partial<Akun>) => apiRequest<Akun>('POST', '/api/akuns', payload),
  update: (id: number, payload: Partial<Akun>) => apiRequest<Akun>('PUT', `/api/akuns/${id}`, payload),
  remove: (id: number) => apiRequest<{ message: string }>('DELETE', `/api/akuns/${id}`),
};

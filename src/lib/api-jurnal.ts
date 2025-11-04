import { apiRequest } from './api';
import type { Jurnal } from '@/types/jurnal';

export const jurnalApi = {
  list: (params?: Record<string, any>) =>
    apiRequest<any>('GET', '/api/jurnals', undefined, { params }),
  show: (id: number) => apiRequest<Jurnal>('GET', `/api/jurnals/${id}`),
  create: (payload: any) => apiRequest<Jurnal>('POST', '/api/jurnals', payload),
  update: (id: number, payload: any) => apiRequest<Jurnal>('PUT', `/api/jurnals/${id}`, payload),
  remove: (id: number) => apiRequest<{ message: string }>('DELETE', `/api/jurnals/${id}`),
};


import { api } from '@/shared/api';
import type {
  AccountResponse,
  AccountsResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from './accounts.types';

export const accountsApi = {
  create: async (data: CreateAccountRequest): Promise<AccountResponse> => {
    const response = await api.post<AccountResponse>('/accounts', data);
    return response.data;
  },

  getAll: async (): Promise<AccountsResponse> => {
    const response = await api.get<AccountsResponse>('/accounts');
    return response.data;
  },

  getById: async (id: number): Promise<AccountResponse> => {
    const response = await api.get<AccountResponse>(`/accounts/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateAccountRequest,
  ): Promise<AccountResponse> => {
    const response = await api.put<AccountResponse>(`/accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },
};

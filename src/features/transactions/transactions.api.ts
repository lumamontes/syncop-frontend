import { api } from '@/shared/api';
import type {
  CreateTransactionRequest,
  TransactionResponse,
  TransactionsResponse,
  UpdateTransactionRequest,
} from './transactions.types';

export const transactionsApi = {
  create: async (
    data: CreateTransactionRequest,
  ): Promise<TransactionResponse> => {
    const response = await api.post<TransactionResponse>('/transactions', data);
    return response.data;
  },

  getAll: async (accountId?: number): Promise<TransactionsResponse> => {
    const url = accountId
      ? `/transactions?accountId=${accountId}`
      : '/transactions';
    const response = await api.get<TransactionsResponse>(url);
    return response.data;
  },

  getById: async (id: number): Promise<TransactionResponse> => {
    const response = await api.get<TransactionResponse>(`/transactions/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateTransactionRequest,
  ): Promise<TransactionResponse> => {
    const response = await api.put<TransactionResponse>(
      `/transactions/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

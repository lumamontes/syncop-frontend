import { api } from '@/shared/api';
import type {
  CreateRecurringTransactionRequest,
  RecurringTransactionResponse,
  RecurringTransactionsResponse,
} from './recurring-transactions.types';

export const recurringTransactionsApi = {
  create: async (
    data: CreateRecurringTransactionRequest,
  ): Promise<RecurringTransactionResponse> => {
    const response = await api.post<RecurringTransactionResponse>(
      '/recurring-transactions',
      data,
    );
    return response.data;
  },

  getAll: async (
    activeOnly?: boolean,
  ): Promise<RecurringTransactionsResponse> => {
    const url = activeOnly
      ? `/recurring-transactions?activeOnly=${activeOnly}`
      : '/recurring-transactions';
    const response = await api.get<RecurringTransactionsResponse>(url);
    return response.data;
  },

  getById: async (id: number): Promise<RecurringTransactionResponse> => {
    const response = await api.get<RecurringTransactionResponse>(
      `/recurring-transactions/${id}`,
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreateRecurringTransactionRequest>,
  ): Promise<RecurringTransactionResponse> => {
    const response = await api.put<RecurringTransactionResponse>(
      `/recurring-transactions/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/recurring-transactions/${id}`);
  },
};

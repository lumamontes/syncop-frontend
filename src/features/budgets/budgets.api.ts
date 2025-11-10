import { api } from '@/shared/api';
import type {
  BudgetResponse,
  BudgetsResponse,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from './budgets.types';

export const budgetsApi = {
  create: async (data: CreateBudgetRequest): Promise<BudgetResponse> => {
    const response = await api.post<BudgetResponse>('/budgets', data);
    return response.data;
  },

  getAll: async (activeOnly?: boolean): Promise<BudgetsResponse> => {
    const url = activeOnly ? `/budgets?activeOnly=${activeOnly}` : '/budgets';
    const response = await api.get<BudgetsResponse>(url);
    return response.data;
  },

  getById: async (id: number): Promise<BudgetResponse> => {
    const response = await api.get<BudgetResponse>(`/budgets/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateBudgetRequest,
  ): Promise<BudgetResponse> => {
    const response = await api.put<BudgetResponse>(`/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
};

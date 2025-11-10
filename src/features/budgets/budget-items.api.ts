import { api } from '@/shared/api';
import type {
  BudgetItemResponse,
  BudgetItemsResponse,
  CreateBudgetItemRequest,
  UpdateBudgetItemRequest,
} from './budget-items.types';

export const budgetItemsApi = {
  create: async (
    budgetId: number,
    data: CreateBudgetItemRequest,
  ): Promise<BudgetItemResponse> => {
    const response = await api.post<BudgetItemResponse>(
      `/budgets/${budgetId}/items`,
      data,
    );
    return response.data;
  },

  getAll: async (budgetId: number): Promise<BudgetItemsResponse> => {
    const response = await api.get<BudgetItemsResponse>(
      `/budgets/${budgetId}/items`,
    );
    return response.data;
  },

  getById: async (
    budgetId: number,
    id: number,
  ): Promise<BudgetItemResponse> => {
    const response = await api.get<BudgetItemResponse>(
      `/budgets/${budgetId}/items/${id}`,
    );
    return response.data;
  },

  update: async (
    budgetId: number,
    id: number,
    data: UpdateBudgetItemRequest,
  ): Promise<BudgetItemResponse> => {
    const response = await api.put<BudgetItemResponse>(
      `/budgets/${budgetId}/items/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (budgetId: number, id: number): Promise<void> => {
    await api.delete(`/budgets/${budgetId}/items/${id}`);
  },
};

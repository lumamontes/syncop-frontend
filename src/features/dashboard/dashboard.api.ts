import type { Account } from '@/features/accounts';
import type { Budget } from '@/features/budgets';
import type { Category } from '@/features/categories';
import type { RecurringTransaction } from '@/features/recurring-transactions';
import type { Transaction } from '@/features/transactions';
import { api } from '@/shared/api';

export interface DashboardData {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  accounts: Account[];
  recurringTransactions: RecurringTransaction[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/dashboard');
    return response.data;
  },
};

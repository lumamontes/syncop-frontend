import type { Account } from '@/features/accounts';
import type { Category } from '@/features/categories';
import { api } from '@/shared/api';

export interface SeedResponse {
  success: boolean;
  data: {
    accounts: Account[];
    categories: Category[];
  };
  message?: string;
}

export const seedApi = {
  generateDefaults: async (): Promise<SeedResponse> => {
    const response = await api.post<SeedResponse>('/seed', {});
    return response.data;
  },
};

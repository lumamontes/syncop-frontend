import { api } from '@/shared/api';

export interface AccountType {
  id: number;
  typeCode: string;
  typeName: string;
  description?: string;
  isActive: boolean;
}

export interface AccountTypesResponse {
  success: boolean;
  data: AccountType[];
  message?: string;
}

export const accountTypesApi = {
  getAll: async (activeOnly?: boolean): Promise<AccountTypesResponse> => {
    const url = activeOnly
      ? `/account-types?activeOnly=${activeOnly}`
      : '/account-types';
    const response = await api.get<AccountTypesResponse>(url);
    return response.data;
  },
};

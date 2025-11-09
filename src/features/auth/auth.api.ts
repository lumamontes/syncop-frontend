import { api } from '@/shared/api';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from './auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (
    credentials: RegisterCredentials,
  ): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/users', credentials);
    return response.data;
  },
};

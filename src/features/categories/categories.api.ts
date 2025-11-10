import { api } from '@/shared/api';
import type {
  CategoriesResponse,
  CategoryResponse,
  CategoryType,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './categories.types';

export const categoriesApi = {
  create: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>('/categories', data);
    return response.data;
  },

  getAll: async (type?: CategoryType): Promise<CategoriesResponse> => {
    const url = type ? `/categories?type=${type}` : '/categories';
    const response = await api.get<CategoriesResponse>(url);
    return response.data;
  },

  getById: async (id: number): Promise<CategoryResponse> => {
    const response = await api.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateCategoryRequest,
  ): Promise<CategoryResponse> => {
    const response = await api.put<CategoryResponse>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

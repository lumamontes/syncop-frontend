export type CategoryType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Category {
  id: number;
  categoryName: string;
  categoryType: CategoryType;
  description?: string;
  icon?: string;
  color?: string;
  isSystem: boolean;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  categoryType: CategoryType;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

export interface BudgetItem {
  id: number;
  budgetId: number;
  categoryId: number;
  allocatedAmount: number;
  spentAmount?: number;
  currencyCode: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetItemRequest {
  categoryId: number;
  allocatedAmount: number;
  currencyCode: string;
}

export interface UpdateBudgetItemRequest
  extends Partial<CreateBudgetItemRequest> {}

export interface BudgetItemResponse {
  success: boolean;
  data: BudgetItem;
  message?: string;
}

export interface BudgetItemsResponse {
  success: boolean;
  data: BudgetItem[];
  message?: string;
}

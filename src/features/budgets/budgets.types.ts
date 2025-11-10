export type PeriodType = 'MONTHLY' | 'ANNUAL';

export interface Budget {
  id: number;
  budgetName: string;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currencyCode: string;
  isActive: boolean;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetRequest {
  budgetName: string;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currencyCode: string;
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {
  isActive?: boolean;
}

export interface BudgetResponse {
  success: boolean;
  data: Budget;
  message?: string;
}

export interface BudgetsResponse {
  success: boolean;
  data: Budget[];
  message?: string;
}

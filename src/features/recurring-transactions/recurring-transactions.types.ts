export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: number;
  accountId: number;
  categoryId: number;
  transactionType: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
  merchantName?: string;
  recurrenceType: RecurrenceType;
  recurrenceDay?: number; // Day of month for monthly, day of week for weekly
  startDate: string;
  endDate?: string; // Optional end date
  isActive: boolean;
  nextDueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecurringTransactionRequest {
  accountId: number;
  categoryId: number;
  transactionType: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
  merchantName?: string;
  recurrenceType: RecurrenceType;
  recurrenceDay?: number;
  startDate: string;
  endDate?: string;
}

export interface RecurringTransactionResponse {
  success: boolean;
  data: RecurringTransaction;
  message?: string;
}

export interface RecurringTransactionsResponse {
  success: boolean;
  data: RecurringTransaction[];
  message?: string;
}

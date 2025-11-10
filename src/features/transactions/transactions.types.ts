export type TransactionType = 'DEBIT' | 'CREDIT' | 'TRANSFER';
export type TransactionNature = 'FIXED' | 'VARIABLE';

export interface Transaction {
  id: number;
  accountId: number;
  categoryId: number;
  transactionType: TransactionType;
  transactionNature?: TransactionNature;
  amount: number;
  transactionDate: string;
  description?: string;
  merchantName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionRequest {
  accountId: number;
  categoryId: number;
  transactionType: TransactionType;
  transactionNature?: TransactionNature;
  amount: number;
  transactionDate: string;
  description?: string;
  merchantName?: string;
}

export interface UpdateTransactionRequest
  extends Partial<CreateTransactionRequest> {}

export interface TransactionResponse {
  success: boolean;
  data: Transaction;
  message?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  message?: string;
}

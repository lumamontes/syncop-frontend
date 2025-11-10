export interface Account {
  id: number;
  accountTypeId: number;
  accountName: string;
  currencyCode: string;
  currentBalance: number;
  availableBalance: number;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAccountRequest {
  accountTypeId: number;
  accountName: string;
  currencyCode: string;
  currentBalance: number;
  availableBalance: number;
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {}

export interface AccountResponse {
  success: boolean;
  data: Account;
  message?: string;
}

export interface AccountsResponse {
  success: boolean;
  data: Account[];
  message?: string;
}

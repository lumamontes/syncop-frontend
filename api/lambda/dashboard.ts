const BACKEND_URL = 'http://localhost:8081/api';

function getAuthHeaders(headers?: Record<string, string>): HeadersInit {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (headers?.authorization || headers?.Authorization) {
    defaultHeaders.Authorization =
      headers.authorization || headers.Authorization;
  }
  return defaultHeaders;
}

export async function get({
  headers,
}: {
  headers?: Record<string, string>;
}): Promise<unknown> {
  const requestHeaders = getAuthHeaders(headers);

  // Make all backend calls in parallel
  const [
    transactionsRes,
    budgetsRes,
    categoriesRes,
    accountsRes,
    recurringTransactionsRes,
  ] = await Promise.all([
    fetch(`${BACKEND_URL}/transactions`, {
      method: 'GET',
      headers: requestHeaders,
    }),
    fetch(`${BACKEND_URL}/budgets?activeOnly=true`, {
      method: 'GET',
      headers: requestHeaders,
    }),
    fetch(`${BACKEND_URL}/categories`, {
      method: 'GET',
      headers: requestHeaders,
    }),
    fetch(`${BACKEND_URL}/accounts`, {
      method: 'GET',
      headers: requestHeaders,
    }),
    fetch(`${BACKEND_URL}/recurring-transactions?activeOnly=true`, {
      method: 'GET',
      headers: requestHeaders,
    }),
  ]);

  // Check for errors
  if (!transactionsRes.ok) {
    throw new Error(`Failed to fetch transactions: ${transactionsRes.status}`);
  }
  if (!budgetsRes.ok) {
    throw new Error(`Failed to fetch budgets: ${budgetsRes.status}`);
  }
  if (!categoriesRes.ok) {
    throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
  }
  if (!accountsRes.ok) {
    throw new Error(`Failed to fetch accounts: ${accountsRes.status}`);
  }
  if (!recurringTransactionsRes.ok) {
    throw new Error(
      `Failed to fetch recurring transactions: ${recurringTransactionsRes.status}`,
    );
  }

  // Parse all responses
  const transactionsData = await transactionsRes.json();
  const budgetsData = await budgetsRes.json();
  const categoriesData = await categoriesRes.json();
  const accountsData = await accountsRes.json();
  const recurringTransactionsData = await recurringTransactionsRes.json();

  // Aggregate all data into a single response
  return {
    success: true,
    data: {
      transactions: transactionsData.data || [],
      budgets: budgetsData.data || [],
      categories: categoriesData.data || [],
      accounts: accountsData.data || [],
      recurringTransactions: recurringTransactionsData.data || [],
    },
  };
}

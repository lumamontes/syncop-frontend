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

export async function post({
  data,
  params,
  headers,
}: {
  data: Promise<unknown>;
  params: Promise<{ budgetId: string }>;
  headers?: Record<string, string>;
}): Promise<unknown> {
  const { budgetId } = await params;
  const itemData = await data;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/budgets/${budgetId}/items`, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function get({
  params,
  headers,
}: {
  params: Promise<{ budgetId: string }>;
  headers?: Record<string, string>;
}): Promise<unknown> {
  const { budgetId } = await params;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/budgets/${budgetId}/items`, {
    method: 'GET',
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

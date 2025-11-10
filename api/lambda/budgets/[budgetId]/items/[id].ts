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
  params,
  headers,
}: {
  params: Promise<{ budgetId: string; id: string }>;
  headers?: Record<string, string>;
}): Promise<unknown> {
  const { budgetId, id } = await params;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(
    `${BACKEND_URL}/budgets/${budgetId}/items/${id}`,
    {
      method: 'GET',
      headers: requestHeaders,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function put(
  id: string,
  {
    data,
    params,
    headers,
  }: {
    data: Promise<unknown>;
    params: Promise<{ budgetId: string; id: string }>;
    headers?: Record<string, string>;
  },
): Promise<unknown> {
  const { budgetId } = await params;
  const itemData = await data;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(
    `${BACKEND_URL}/budgets/${budgetId}/items/${id}`,
    {
      method: 'PUT',
      headers: requestHeaders,
      body: JSON.stringify(itemData),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function del(
  id: string,
  {
    params,
    headers,
  }: {
    params: Promise<{ budgetId: string; id: string }>;
    headers?: Record<string, string>;
  },
): Promise<unknown> {
  const { budgetId } = await params;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(
    `${BACKEND_URL}/budgets/${budgetId}/items/${id}`,
    {
      method: 'DELETE',
      headers: requestHeaders,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

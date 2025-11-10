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
  headers,
}: {
  data: Promise<unknown>;
  headers?: Record<string, string>;
}): Promise<unknown> {
  const transactionData = await data;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/transactions`, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(transactionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function get({
  query,
  headers,
}: {
  query?: { accountId?: string };
  headers?: Record<string, string>;
}): Promise<unknown> {
  const requestHeaders = getAuthHeaders(headers);
  const accountId = query?.accountId;

  const url = accountId
    ? `${BACKEND_URL}/transactions?accountId=${accountId}`
    : `${BACKEND_URL}/transactions`;

  const response = await fetch(url, {
    method: 'GET',
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

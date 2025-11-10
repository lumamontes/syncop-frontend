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
  const accountData = await data;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/accounts`, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function get({
  headers,
}: {
  headers?: Record<string, string>;
}): Promise<unknown> {
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/accounts`, {
    method: 'GET',
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

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
  const goalData = await data;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/goals`, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(goalData),
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
  query?: { activeOnly?: string };
  headers?: Record<string, string>;
}): Promise<unknown> {
  const requestHeaders = getAuthHeaders(headers);
  const activeOnly = query?.activeOnly;

  const url = activeOnly
    ? `${BACKEND_URL}/goals?activeOnly=${activeOnly}`
    : `${BACKEND_URL}/goals`;

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

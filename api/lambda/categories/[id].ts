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
  params: Promise<{ id: string }>;
  headers?: Record<string, string>;
}): Promise<unknown> {
  const { id } = await params;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/categories/${id}`, {
    method: 'GET',
    headers: requestHeaders,
  });

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
    params: Promise<{ id: string }>;
    headers?: Record<string, string>;
  },
): Promise<unknown> {
  const categoryData = await data;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/categories/${id}`, {
    method: 'PUT',
    headers: requestHeaders,
    body: JSON.stringify(categoryData),
  });

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
    params: Promise<{ id: string }>;
    headers?: Record<string, string>;
  },
): Promise<unknown> {
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

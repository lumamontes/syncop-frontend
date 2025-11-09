import type { LoginCredentials, LoginResponse } from '@/entities/user';
import type { RequestOption } from '@modern-js/runtime/server';

export async function post({
  data,
}: RequestOption<
  Record<string, string>,
  Record<string, string>
>): Promise<LoginResponse> {
  const { username, password } = data;
  const response = await fetch('http://localhost:8081/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  return await response.json();
}

export const get = async () => ({
  message: 'Hello Modern.js',
});

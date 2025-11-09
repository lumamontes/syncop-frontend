import type { LoginCredentials, LoginResponse } from '@/entities/user';

export const post = async ({
  data,
}: {
  data: Promise<LoginCredentials>;
}): Promise<LoginResponse> => {
  const credentials: LoginCredentials = await data;
  console.log('Received login credentials:', credentials);
  const response = await fetch('http://localhost:8081/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  console.log('response json', JSON.stringify(await response.clone().json()));

  if (!response.ok) {
    console.error(
      'Login request failed with status:',
      JSON.stringify(response),
    );
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

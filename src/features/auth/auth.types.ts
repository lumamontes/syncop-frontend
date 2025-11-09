export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthTokens {
  token: string;
  type: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    type: string;
    userId: number;
    username: string;
    email: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    id: number;
    username: string;
    email: string;
  };
  message?: string;
}

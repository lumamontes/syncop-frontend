import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, User } from './auth.types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, tokens) => {
        localStorage.setItem('authToken', tokens.token);
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: loading => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      partialize: state => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

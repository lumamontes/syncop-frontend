import { useAuthStore } from '@/features/auth/auth.store';
import { useLocation, useNavigate } from '@modern-js/runtime/router';
import { Spin } from 'antd';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, tokens, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user has valid authentication
    const hasValidAuth = isAuthenticated && tokens?.token;

    if (!hasValidAuth) {
      // Store the current location to redirect back after login
      const currentPath = location.pathname + location.search;

      // Don't store login/signup paths
      if (currentPath !== '/login' && currentPath !== '/signup') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }

      setLoading(false);
      navigate(redirectTo);
      return;
    }

    setLoading(false);
  }, [isAuthenticated, tokens, navigate, redirectTo, location, setLoading]);

  // Show loading spinner while checking authentication
  if (!isAuthenticated || !tokens?.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

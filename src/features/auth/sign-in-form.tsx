import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from '@modern-js/runtime/router';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Input } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import usePersistForm from 'react-hook-form-persist';
import { authApi } from './auth.api';
import { useAuthStore } from './auth.store';
import type { LoginCredentials } from './auth.types';

interface LoginFormData extends LoginCredentials {}

export const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();
  const [searchParams] = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  usePersistForm('loginForm', {
    watch,
    setValue,
    storage: window.sessionStorage,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: response => {
      if (response.success) {
        const { data } = response;
        setAuth(
          {
            id: data.userId,
            username: data.username,
            email: data.email,
          },
          {
            token: data.token,
            type: data.type,
          },
        );
      }
    },
    onError: error => {
      setLoading(false);
      console.error('Login failed:', error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="w-full max-w-md mx-auto p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bem vindo(a) :))
              </h1>
              <p className="text-gray-600">Entre na sua conta</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Controller
                  name="username"
                  control={control}
                  rules={{
                    required: 'Nome de usuário ou e-mail é obrigatório',
                    minLength: {
                      value: 3,
                      message:
                        'O nome de usuário deve ter pelo menos 3 caracteres',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      placeholder="Nome de usuário ou e-mail"
                      prefix={<UserOutlined className="text-gray-400" />}
                      status={errors.username ? 'error' : ''}
                      className={errors.username ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'A senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'A senha deve ter pelo menos 6 caracteres',
                    },
                  }}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      size="large"
                      placeholder="Password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      status={errors.password ? 'error' : ''}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {isRegistered && (
                <Alert
                  message="Registro bem-sucedido!"
                  description="Sua conta foi criada. Por favor, faça login com suas credenciais."
                  type="success"
                  showIcon
                  className="mb-4"
                />
              )}

              {loginMutation.isError && (
                <Alert
                  message="Login Falhou"
                  description={
                    loginMutation.error?.message ||
                    'Nome de usuário ou senha inválidos'
                  }
                  type="error"
                  showIcon
                  className="mb-4"
                />
              )}

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loginMutation.isPending}
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Fazendo login...' : 'Entrar'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Não tem uma conta?{' '}
                <a
                  href="/signup"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Cadastre-se
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

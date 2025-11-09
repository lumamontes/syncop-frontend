import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Input } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import usePersistForm from 'react-hook-form-persist';
import { authApi } from './auth.api';
import type { RegisterCredentials } from './auth.types';

interface SignUpFormData extends RegisterCredentials {
  confirmPassword: string;
}

export const SignUpForm: React.FC = () => {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  usePersistForm('signUpForm', {
    watch,
    setValue,
    storage: window.sessionStorage,
  });

  const signUpMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: response => {
      if (response.success) {
        sessionStorage.removeItem('signUpForm');
        navigate('/login?registered=true');
      }
    },
    onError: error => {
      console.error('Registration failed:', error);
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    const { confirmPassword, ...registerData } = data;
    signUpMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="w-full max-w-md mx-auto p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">Sign up for a new account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      placeholder="Email address"
                      prefix={<MailOutlined className="text-gray-400" />}
                      status={errors.email ? 'error' : ''}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  name="username"
                  control={control}
                  rules={{
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                    maxLength: {
                      value: 20,
                      message: 'Username must be less than 20 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        'Username can only contain letters, numbers, and underscores',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      placeholder="Username"
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
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
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

              <div>
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: 'Please confirm your password',
                    validate: value =>
                      value === password || 'Passwords do not match',
                  }}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      size="large"
                      placeholder="Confirm Password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      status={errors.confirmPassword ? 'error' : ''}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {signUpMutation.isError && (
                <Alert
                  message="Registration Failed"
                  description={
                    signUpMutation.error?.message ||
                    'An error occurred during registration'
                  }
                  type="error"
                  showIcon
                  className="mb-4"
                />
              )}

              {signUpMutation.isSuccess && (
                <Alert
                  message="Registration Successful"
                  description="Your account has been created successfully!"
                  type="success"
                  showIcon
                  className="mb-4"
                />
              )}

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={signUpMutation.isPending}
                className="w-full"
                disabled={signUpMutation.isPending}
              >
                {signUpMutation.isPending
                  ? 'Creating Account...'
                  : 'Create Account'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

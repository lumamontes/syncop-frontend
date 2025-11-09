import { useAuthStore } from '@/features/auth/auth.store';
import {
  DashboardOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import { Avatar, Button, Card, Space, Typography } from 'antd';

const { Title, Text } = Typography;

export const DashboardComponent: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar
                size={64}
                icon={<UserOutlined />}
                className="bg-blue-500"
              />
              <div>
                <Title level={2} className="mb-1">
                  Olá, {user?.username}! 👋
                </Title>
                <Text type="secondary" className="text-lg">
                  {user?.email}
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              size="large"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card
            title="Bem-vindo ao Dashboard"
            extra={<DashboardOutlined />}
            className="hover:shadow-md transition-shadow"
          >
            <p>
              Esta é uma página protegida que só pode ser acessada por usuários
              autenticados.
            </p>
          </Card>

          <Card
            title="Suas Informações"
            extra={<UserOutlined />}
            className="hover:shadow-md transition-shadow"
          >
            <Space direction="vertical">
              <Text>
                <strong>ID:</strong> {user?.id}
              </Text>
              <Text>
                <strong>Usuário:</strong> {user?.username}
              </Text>
              <Text>
                <strong>Email:</strong> {user?.email}
              </Text>
            </Space>
          </Card>

          <Card
            title="Navegação Rápida"
            className="hover:shadow-md transition-shadow"
          >
            <Space direction="vertical" className="w-full">
              <Button type="link" className="p-0" onClick={() => navigate('/')}>
                Página Inicial
              </Button>
              <Button
                type="link"
                className="p-0"
                onClick={() => navigate('/profile')}
              >
                Perfil (Protegido)
              </Button>
              <Button
                type="link"
                className="p-0"
                onClick={() => navigate('/settings')}
              >
                Configurações (Protegido)
              </Button>
            </Space>
          </Card>
        </div>

        {/* Protected Route Demo */}
        <Card title="Demonstração de Rotas Protegidas" className="mb-6">
          <div className="space-y-4">
            <p>
              <strong>🔒 Rotas Protegidas:</strong> Estas rotas redirecionam
              para login se não autenticado:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <code>/dashboard</code> - Esta página
              </li>
              <li>
                <code>/profile</code> - Página de perfil do usuário
              </li>
              <li>
                <code>/settings</code> - Configurações da conta
              </li>
            </ul>
            <p>
              <strong>🔓 Rotas Públicas:</strong> Acessíveis sem autenticação:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <code>/</code> - Página inicial
              </li>
              <li>
                <code>/login</code> - Página de login
              </li>
              <li>
                <code>/signup</code> - Página de registro
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

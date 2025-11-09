import { useAuthStore } from '@/features/auth/auth.store';
import { AuthGuard } from '@/shared/ui/auth-guard';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import { Avatar, Button, Card, Typography } from 'antd';

const { Title, Text } = Typography;

function ProfileContent() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          Voltar ao Dashboard
        </Button>

        <Card title="Perfil do Usuário" className="shadow-md">
          <div className="text-center mb-6">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              className="bg-blue-500 mb-4"
            />
            <Title level={2}>{user?.username}</Title>
            <Text type="secondary" className="text-lg">
              {user?.email}
            </Text>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <Text strong>ID do Usuário:</Text>
              <Text>{user?.id}</Text>
            </div>
            <div className="flex justify-between border-b pb-2">
              <Text strong>Nome de Usuário:</Text>
              <Text>{user?.username}</Text>
            </div>
            <div className="flex justify-between border-b pb-2">
              <Text strong>Email:</Text>
              <Text>{user?.email}</Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

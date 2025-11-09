import { useAuthStore } from '@/features/auth/auth.store';
import { AuthGuard } from '@/shared/ui/auth-guard';
import { ArrowLeftOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import { Button, Card, Form, Switch, Typography } from 'antd';

const { Title, Text } = Typography;

function SettingsContent() {
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

        <Card
          title={
            <div className="flex items-center space-x-2">
              <SettingOutlined />
              <span>Configurações da Conta</span>
            </div>
          }
          className="shadow-md"
        >
          <div className="mb-6">
            <Title level={4}>Usuário: {user?.username}</Title>
            <Text type="secondary">{user?.email}</Text>
          </div>

          <Form layout="vertical">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <Text strong>Notificações por Email</Text>
                  <br />
                  <Text type="secondary">
                    Receber notificações importantes por email
                  </Text>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <Text strong>Modo Escuro</Text>
                  <br />
                  <Text type="secondary">Usar tema escuro na interface</Text>
                </div>
                <Switch />
              </div>

              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <Text strong>Autenticação de Dois Fatores</Text>
                  <br />
                  <Text type="secondary">
                    Adicionar camada extra de segurança
                  </Text>
                </div>
                <Switch />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Text strong>Notificações Push</Text>
                  <br />
                  <Text type="secondary">
                    Receber notificações no navegador
                  </Text>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t">
              <Button type="primary" size="large">
                Salvar Configurações
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

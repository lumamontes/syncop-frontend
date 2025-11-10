import { accountsApi } from '@/features/accounts';
import {
  type CreateGoalRequest,
  type Goal,
  type GoalType,
  type UpdateGoalRequest,
  goalsApi,
} from '@/features/goals';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

const { Title, Text } = Typography;

export const GoalsManager: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const queryClient = useQueryClient();

  // Fetch goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await goalsApi.getAll(false);
      return response.data || [];
    },
  });

  // Fetch accounts for linking
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await accountsApi.getAll();
      return response.data || [];
    },
  });

  const goals: Goal[] = goalsData || [];
  const accounts = accountsData || [];

  // Create goal
  const createGoal = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return await goalsApi.create({
        goalName: values.goalName as string,
        goalType: values.goalType as CreateGoalRequest['goalType'],
        targetAmount: values.targetAmount as number,
        currentAmount: (values.currentAmount as number) || 0,
        currencyCode: (values.currencyCode as string) || 'BRL',
        targetDate: values.targetDate
          ? (
              values.targetDate as { format: (format: string) => string }
            ).format('YYYY-MM-DD')
          : undefined,
        priority: (values.priority as number) || 1,
        linkedAccountId: values.linkedAccountId as number | undefined,
        autoContribute: (values.autoContribute as boolean) || false,
        contributionAmount: values.contributionAmount as number | undefined,
        contributionFrequency:
          values.contributionFrequency as CreateGoalRequest['contributionFrequency'],
        notes: values.notes as string | undefined,
      } as CreateGoalRequest);
    },
    onSuccess: () => {
      message.success('Meta criada com sucesso!');
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao criar meta');
    },
  });

  // Update goal
  const updateGoal = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number;
      values: Record<string, unknown>;
    }) => {
      return await goalsApi.update(id, {
        goalName: values.goalName as string,
        goalType: values.goalType as UpdateGoalRequest['goalType'],
        targetAmount: values.targetAmount as number,
        currentAmount: values.currentAmount as number,
        currencyCode: values.currencyCode as string,
        targetDate: values.targetDate
          ? (
              values.targetDate as { format: (format: string) => string }
            ).format('YYYY-MM-DD')
          : undefined,
        priority: values.priority as number,
        linkedAccountId: values.linkedAccountId as number | undefined,
        autoContribute: values.autoContribute as boolean,
        contributionAmount: values.contributionAmount as number | undefined,
        contributionFrequency:
          values.contributionFrequency as UpdateGoalRequest['contributionFrequency'],
        notes: values.notes as string | undefined,
        isActive: values.isActive as boolean,
        isAchieved: values.isAchieved as boolean,
      } as UpdateGoalRequest);
    },
    onSuccess: () => {
      message.success('Meta atualizada com sucesso!');
      form.resetFields();
      setIsModalVisible(false);
      setEditingGoal(null);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao atualizar meta');
    },
  });

  // Delete goal
  const deleteGoal = useMutation({
    mutationFn: async (id: number) => {
      await goalsApi.delete(id);
    },
    onSuccess: () => {
      message.success('Meta excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao excluir meta');
    },
  });

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    form.setFieldsValue({
      goalName: goal.goalName,
      goalType: goal.goalType,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      currencyCode: goal.currencyCode,
      targetDate: goal.targetDate ? dayjs(goal.targetDate) : undefined,
      priority: goal.priority,
      linkedAccountId: goal.linkedAccountId,
      autoContribute: goal.autoContribute,
      contributionAmount: goal.contributionAmount,
      contributionFrequency: goal.contributionFrequency,
      notes: goal.notes,
      isActive: goal.isActive,
      isAchieved: goal.isAchieved,
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingGoal(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingGoal) {
        await updateGoal.mutateAsync({ id: editingGoal.id, values });
      } else {
        await createGoal.mutateAsync(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const goalTypeLabels: Record<GoalType, string> = {
    SAVINGS: 'Poupança',
    DEBT_PAYOFF: 'Quitar Dívida',
    INVESTMENT: 'Investimento',
    PURCHASE: 'Compra',
    EMERGENCY_FUND: 'Fundo de Emergência',
    OTHER: 'Outro',
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'goalName',
      key: 'goalName',
    },
    {
      title: 'Tipo',
      dataIndex: 'goalType',
      key: 'goalType',
      render: (type: GoalType) => goalTypeLabels[type] || type,
    },
    {
      title: 'Meta',
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      render: (amount: number, record: Goal) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: record.currencyCode || 'BRL',
        }).format(amount),
    },
    {
      title: 'Atual',
      dataIndex: 'currentAmount',
      key: 'currentAmount',
      render: (amount: number, record: Goal) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: record.currencyCode || 'BRL',
        }).format(amount),
    },
    {
      title: 'Progresso',
      dataIndex: 'progressPercentage',
      key: 'progressPercentage',
      render: (percentage: number, record: Goal) => (
        <Progress
          percent={Math.round(percentage)}
          status={
            record.isAchieved
              ? 'success'
              : percentage >= 100
                ? 'exception'
                : 'active'
          }
          strokeColor={
            record.isAchieved
              ? '#52c41a'
              : percentage >= 100
                ? '#ff4d4f'
                : '#1890ff'
          }
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: Goal) => (
        <Space>
          {record.isAchieved && (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Concluída
            </Tag>
          )}
          {record.isActive ? (
            <Tag color="processing">Ativa</Tag>
          ) : (
            <Tag color="default">Inativa</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: Goal) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir esta meta?"
            onConfirm={() => deleteGoal.mutate(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeGoals = goals.filter(g => g.isActive && !g.isAchieved);
  const achievedGoals = goals.filter(g => g.isAchieved);

  return (
    <>
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Metas Financeiras
            </Title>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Nova Meta
          </Button>
        }
      >
        <div className="mb-4">
          <Space size="large">
            <div>
              <Text type="secondary">Metas Ativas: </Text>
              <Text strong>{activeGoals.length}</Text>
            </div>
            <div>
              <Text type="secondary">Metas Concluídas: </Text>
              <Text strong style={{ color: '#52c41a' }}>
                {achievedGoals.length}
              </Text>
            </div>
            <div>
              <Text type="secondary">Total: </Text>
              <Text strong>{goals.length}</Text>
            </div>
          </Space>
        </div>

        <Table
          dataSource={goals}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, responsive: true }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingGoal(null);
        }}
        confirmLoading={createGoal.isPending || updateGoal.isPending}
        okText="Salvar"
        cancelText="Cancelar"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="goalName"
            label="Nome da Meta"
            rules={[{ required: true, message: 'Informe o nome da meta' }]}
          >
            <Input placeholder="Ex: Reserva de Emergência" />
          </Form.Item>

          <Form.Item
            name="goalType"
            label="Tipo de Meta"
            rules={[{ required: true, message: 'Selecione o tipo de meta' }]}
          >
            <Select placeholder="Selecione o tipo">
              {Object.entries(goalTypeLabels).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="targetAmount"
            label="Valor da Meta"
            rules={[
              { required: true, message: 'Informe o valor da meta' },
              {
                type: 'number',
                min: 0.01,
                message: 'Valor deve ser maior que zero',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="R$"
              decimalSeparator=","
              thousandSeparator="."
              precision={2}
              placeholder="0,00"
            />
          </Form.Item>

          <Form.Item
            name="currentAmount"
            label="Valor Atual"
            rules={[
              {
                type: 'number',
                min: 0,
                message: 'Valor deve ser positivo ou zero',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="R$"
              decimalSeparator=","
              thousandSeparator="."
              precision={2}
              placeholder="0,00"
            />
          </Form.Item>

          <Form.Item name="targetDate" label="Data Alvo (Opcional)">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="currencyCode" label="Moeda" initialValue="BRL">
            <Select>
              <Select.Option value="BRL">BRL - Real Brasileiro</Select.Option>
              <Select.Option value="USD">USD - Dólar Americano</Select.Option>
              <Select.Option value="EUR">EUR - Euro</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="linkedAccountId" label="Conta Vinculada (Opcional)">
            <Select placeholder="Selecione uma conta" allowClear>
              {accounts.map(account => (
                <Select.Option key={account.id} value={account.id}>
                  {account.accountName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="priority" label="Prioridade" initialValue={1}>
            <Select>
              <Select.Option value={1}>Baixa</Select.Option>
              <Select.Option value={2}>Média</Select.Option>
              <Select.Option value={3}>Alta</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="autoContribute"
            label="Contribuição Automática"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.autoContribute !== currentValues.autoContribute
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('autoContribute') ? (
                <>
                  <Form.Item
                    name="contributionAmount"
                    label="Valor da Contribuição"
                    rules={[{ type: 'number', min: 0.01 }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      prefix="R$"
                      decimalSeparator=","
                      thousandSeparator="."
                      precision={2}
                      placeholder="0,00"
                    />
                  </Form.Item>
                  <Form.Item name="contributionFrequency" label="Frequência">
                    <Select>
                      <Select.Option value="WEEKLY">Semanal</Select.Option>
                      <Select.Option value="BIWEEKLY">Quinzenal</Select.Option>
                      <Select.Option value="MONTHLY">Mensal</Select.Option>
                      <Select.Option value="QUARTERLY">
                        Trimestral
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>

          <Form.Item name="notes" label="Notas (Opcional)">
            <Input.TextArea
              rows={3}
              placeholder="Adicione observações sobre esta meta"
            />
          </Form.Item>

          {editingGoal && (
            <>
              <Form.Item name="isActive" label="Ativa" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item
                name="isAchieved"
                label="Concluída"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

import {
  type CreateAccountRequest,
  type UpdateAccountRequest,
  accountsApi,
} from '@/features/accounts';
import { accountTypesApi } from '@/features/accounts/account-types.api';
import type { AccountType } from '@/features/accounts/account-types.api';
import type { Account } from '@/features/accounts/accounts.types';
import {
  type CreateBudgetRequest,
  type UpdateBudgetRequest,
  budgetsApi,
} from '@/features/budgets';
import { BudgetItemsManager } from '@/features/budgets/budget-items-manager';
import type { Budget } from '@/features/budgets/budgets.types';
import {
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  categoriesApi,
} from '@/features/categories';
import type { Category } from '@/features/categories/categories.types';
import { GoalsManager } from '@/features/goals';
import {
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  TrophyOutlined,
  UnorderedListOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

const { Title } = Typography;

export const DataManagementTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [accountForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [budgetForm] = Form.useForm();
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [isBudgetItemsDrawerVisible, setIsBudgetItemsDrawerVisible] =
    useState(false);
  const [selectedBudgetForItems, setSelectedBudgetForItems] =
    useState<Budget | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Accounts queries
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await accountsApi.getAll();
      return response.data || [];
    },
  });

  const { data: accountTypesData, isLoading: accountTypesLoading } = useQuery({
    queryKey: ['accountTypes'],
    queryFn: async () => {
      const response = await accountTypesApi.getAll(false); // Get all, not just active
      return response.data || [];
    },
  });

  // Categories queries
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data || [];
    },
  });

  // Budgets queries
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await budgetsApi.getAll(false); // Get all, not just active
      return response.data || [];
    },
  });

  // Account mutations
  const createAccount = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return await accountsApi.create({
        accountTypeId: values.accountTypeId as number,
        accountName: values.accountName as string,
        currencyCode: values.currencyCode as string,
        currentBalance: (values.currentBalance as number) || 0,
        availableBalance: (values.availableBalance as number) || 0,
      } as CreateAccountRequest);
    },
    onSuccess: () => {
      message.success('Conta criada com sucesso!');
      accountForm.resetFields();
      setIsAccountModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao criar conta');
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number;
      values: Record<string, unknown>;
    }) => {
      return await accountsApi.update(id, {
        accountTypeId: values.accountTypeId as number,
        accountName: values.accountName as string,
        currencyCode: values.currencyCode as string,
        currentBalance: values.currentBalance as number,
        availableBalance: values.availableBalance as number,
      } as UpdateAccountRequest);
    },
    onSuccess: () => {
      message.success('Conta atualizada com sucesso!');
      accountForm.resetFields();
      setIsAccountModalVisible(false);
      setEditingAccount(null);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao atualizar conta');
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: number) => {
      await accountsApi.delete(id);
    },
    onSuccess: () => {
      message.success('Conta excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao excluir conta');
    },
  });

  // Category mutations
  const createCategory = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return await categoriesApi.create({
        categoryName: values.categoryName as string,
        categoryType:
          values.categoryType as CreateCategoryRequest['categoryType'],
        description: values.description as string | undefined,
      } as CreateCategoryRequest);
    },
    onSuccess: () => {
      message.success('Categoria criada com sucesso!');
      categoryForm.resetFields();
      setIsCategoryModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao criar categoria');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number;
      values: Record<string, unknown>;
    }) => {
      return await categoriesApi.update(id, {
        categoryName: values.categoryName as string,
        categoryType:
          values.categoryType as UpdateCategoryRequest['categoryType'],
        description: values.description as string | undefined,
      } as UpdateCategoryRequest);
    },
    onSuccess: () => {
      message.success('Categoria atualizada com sucesso!');
      categoryForm.resetFields();
      setIsCategoryModalVisible(false);
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao atualizar categoria');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      await categoriesApi.delete(id);
    },
    onSuccess: () => {
      message.success('Categoria excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao excluir categoria');
    },
  });

  // Account handlers
  const handleAccountEdit = (account: Account) => {
    setEditingAccount(account);
    accountForm.setFieldsValue({
      accountTypeId: account.accountTypeId,
      accountName: account.accountName,
      currencyCode: account.currencyCode,
      currentBalance: account.currentBalance,
      availableBalance: account.availableBalance,
    });
    setIsAccountModalVisible(true);
  };

  const handleAccountSubmit = async () => {
    try {
      const values = await accountForm.validateFields();
      if (editingAccount) {
        await updateAccount.mutateAsync({
          id: editingAccount.id,
          values,
        });
      } else {
        await createAccount.mutateAsync(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleAccountAdd = () => {
    setEditingAccount(null);
    accountForm.resetFields();
    setIsAccountModalVisible(true);
  };

  // Category handlers
  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({
      categoryName: category.categoryName,
      categoryType: category.categoryType,
      description: category.description,
    });
    setIsCategoryModalVisible(true);
  };

  const handleCategorySubmit = async () => {
    try {
      const values = await categoryForm.validateFields();
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          values,
        });
      } else {
        await createCategory.mutateAsync(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCategoryAdd = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setIsCategoryModalVisible(true);
  };

  // Budget mutations
  const createBudget = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return await budgetsApi.create({
        budgetName: values.budgetName as string,
        periodType: values.periodType as CreateBudgetRequest['periodType'],
        startDate: (
          values.startDate as { format: (format: string) => string }
        ).format('YYYY-MM-DD'),
        endDate: (
          values.endDate as { format: (format: string) => string }
        ).format('YYYY-MM-DD'),
        totalAmount: values.totalAmount as number,
        currencyCode: values.currencyCode as string,
      } as CreateBudgetRequest);
    },
    onSuccess: () => {
      message.success('Orçamento criado com sucesso!');
      budgetForm.resetFields();
      setIsBudgetModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao criar orçamento');
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number;
      values: Record<string, unknown>;
    }) => {
      return await budgetsApi.update(id, {
        budgetName: values.budgetName as string,
        periodType: values.periodType as UpdateBudgetRequest['periodType'],
        startDate: (
          values.startDate as { format: (format: string) => string }
        ).format('YYYY-MM-DD'),
        endDate: (
          values.endDate as { format: (format: string) => string }
        ).format('YYYY-MM-DD'),
        totalAmount: values.totalAmount as number,
        currencyCode: values.currencyCode as string,
        isActive: values.isActive as boolean,
      } as UpdateBudgetRequest);
    },
    onSuccess: () => {
      message.success('Orçamento atualizado com sucesso!');
      budgetForm.resetFields();
      setIsBudgetModalVisible(false);
      setEditingBudget(null);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao atualizar orçamento');
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: number) => {
      await budgetsApi.delete(id);
    },
    onSuccess: () => {
      message.success('Orçamento excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao excluir orçamento');
    },
  });

  // Budget handlers
  const handleBudgetEdit = (budget: Budget) => {
    setEditingBudget(budget);
    budgetForm.setFieldsValue({
      budgetName: budget.budgetName,
      periodType: budget.periodType,
      startDate: dayjs(budget.startDate),
      endDate: dayjs(budget.endDate),
      totalAmount: budget.totalAmount,
      currencyCode: budget.currencyCode,
      isActive: budget.isActive,
    });
    setIsBudgetModalVisible(true);
  };

  const handleBudgetSubmit = async () => {
    try {
      const values = await budgetForm.validateFields();
      if (editingBudget) {
        await updateBudget.mutateAsync({
          id: editingBudget.id,
          values,
        });
      } else {
        await createBudget.mutateAsync(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleBudgetAdd = () => {
    setEditingBudget(null);
    budgetForm.resetFields();
    setIsBudgetModalVisible(true);
  };

  const handleManageBudgetItems = (budget: Budget) => {
    setSelectedBudgetForItems(budget);
    setIsBudgetItemsDrawerVisible(true);
  };

  // Account columns
  const accountColumns = [
    {
      title: 'Nome',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Tipo',
      dataIndex: 'accountTypeId',
      key: 'accountTypeId',
      render: (typeId: number) => {
        const type = accountTypesData?.find(
          (t: AccountType) => t.id === typeId,
        );
        return type?.typeName || '-';
      },
    },
    {
      title: 'Moeda',
      dataIndex: 'currencyCode',
      key: 'currencyCode',
    },
    {
      title: 'Saldo Atual',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      render: (value: number, record: Account) => (
        <span
          style={{
            color: value >= 0 ? '#52c41a' : '#ff4d4f',
          }}
        >
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: record.currencyCode,
          }).format(value)}
        </span>
      ),
    },
    {
      title: 'Saldo Disponível',
      dataIndex: 'availableBalance',
      key: 'availableBalance',
      render: (value: number, record: Account) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: record.currencyCode,
        }).format(value),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: Account) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleAccountEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir esta conta?"
            onConfirm={() => deleteAccount.mutate(record.id)}
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

  // Category columns
  const categoryColumns = [
    {
      title: 'Nome',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Tipo',
      dataIndex: 'categoryType',
      key: 'categoryType',
      render: (type: string) => {
        const colors: Record<string, string> = {
          INCOME: 'green',
          EXPENSE: 'red',
          TRANSFER: 'blue',
        };
        const labels: Record<string, string> = {
          INCOME: 'Receita',
          EXPENSE: 'Despesa',
          TRANSFER: 'Transferência',
        };
        return (
          <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>
        );
      },
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: Category) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleCategoryEdit(record)}
            disabled={record.isSystem}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir esta categoria?"
            onConfirm={() => deleteCategory.mutate(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isSystem}
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Budget columns
  const budgetColumns = [
    {
      title: 'Nome',
      dataIndex: 'budgetName',
      key: 'budgetName',
    },
    {
      title: 'Tipo de Período',
      dataIndex: 'periodType',
      key: 'periodType',
      render: (type: string) => {
        const labels: Record<string, string> = {
          MONTHLY: 'Mensal',
          ANNUAL: 'Anual',
        };
        return labels[type] || type;
      },
    },
    {
      title: 'Data Inicial',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Data Final',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Valor Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value: number, record: Budget) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: record.currencyCode,
        }).format(value),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: Budget) => (
        <Space>
          <Button
            type="link"
            icon={<UnorderedListOutlined />}
            onClick={() => handleManageBudgetItems(record)}
          >
            Itens
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleBudgetEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir este orçamento?"
            onConfirm={() => deleteBudget.mutate(record.id)}
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

  // Account Type columns (view-only)
  const accountTypeColumns = [
    {
      title: 'Código',
      dataIndex: 'typeCode',
      key: 'typeCode',
    },
    {
      title: 'Nome',
      dataIndex: 'typeName',
      key: 'typeName',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
  ];

  const accounts = accountsData || [];
  const categories = categoriesData || [];
  const accountTypes = accountTypesData || [];
  const budgets = budgetsData || [];

  return (
    <div className="space-y-6">
      <Tabs
        defaultActiveKey="accounts"
        items={[
          {
            key: 'accounts',
            label: (
              <Space>
                <WalletOutlined />
                <span>Contas ({accounts.length})</span>
              </Space>
            ),
            children: (
              <Card
                title="Gerenciar Contas"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAccountAdd}
                  >
                    Nova Conta
                  </Button>
                }
              >
                <div className="overflow-x-auto">
                  <Table
                    dataSource={accounts}
                    columns={accountColumns}
                    rowKey="id"
                    loading={accountsLoading}
                    pagination={{ pageSize: 10, responsive: true }}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              </Card>
            ),
          },
          {
            key: 'categories',
            label: (
              <Space>
                <FolderOutlined />
                <span>Categorias ({categories.length})</span>
              </Space>
            ),
            children: (
              <Card
                title="Gerenciar Categorias"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCategoryAdd}
                  >
                    Nova Categoria
                  </Button>
                }
              >
                <div className="overflow-x-auto">
                  <Table
                    dataSource={categories}
                    columns={categoryColumns}
                    rowKey="id"
                    loading={categoriesLoading}
                    pagination={{ pageSize: 10, responsive: true }}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              </Card>
            ),
          },
          {
            key: 'budgets',
            label: (
              <Space>
                <DollarOutlined />
                <span>Orçamentos ({budgets.length})</span>
              </Space>
            ),
            children: (
              <Card
                title="Gerenciar Orçamentos"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleBudgetAdd}
                  >
                    Novo Orçamento
                  </Button>
                }
              >
                <div className="overflow-x-auto">
                  <Table
                    dataSource={budgets}
                    columns={budgetColumns}
                    rowKey="id"
                    loading={budgetsLoading}
                    pagination={{ pageSize: 10, responsive: true }}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              </Card>
            ),
          },
          {
            key: 'goals',
            label: (
              <Space>
                <TrophyOutlined />
                <span>Metas</span>
              </Space>
            ),
            children: <GoalsManager />,
          },
          {
            key: 'accountTypes',
            label: (
              <Space>
                <InfoCircleOutlined />
                <span>Tipos de Conta ({accountTypes.length})</span>
              </Space>
            ),
            children: (
              <Card title="Tipos de Conta (Referência - Somente Leitura)">
                <Alert
                  message="Informação"
                  description="Os tipos de conta são dados de referência do sistema e não podem ser editados ou excluídos."
                  type="info"
                  showIcon
                  className="mb-4"
                />
                <div className="overflow-x-auto">
                  <Table
                    dataSource={accountTypes}
                    columns={accountTypeColumns}
                    rowKey="id"
                    loading={accountTypesLoading}
                    pagination={{ pageSize: 10, responsive: true }}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* Account Modal */}
      <Modal
        title={editingAccount ? 'Editar Conta' : 'Nova Conta'}
        open={isAccountModalVisible}
        onOk={handleAccountSubmit}
        onCancel={() => {
          setIsAccountModalVisible(false);
          accountForm.resetFields();
          setEditingAccount(null);
        }}
        confirmLoading={createAccount.isPending || updateAccount.isPending}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={accountForm} layout="vertical">
          <Form.Item
            name="accountTypeId"
            label="Tipo de Conta"
            rules={[{ required: true, message: 'Selecione o tipo de conta' }]}
          >
            <Select placeholder="Selecione o tipo de conta" showSearch>
              {accountTypes.map((type: AccountType) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.typeName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="accountName"
            label="Nome da Conta"
            rules={[{ required: true, message: 'Informe o nome da conta' }]}
          >
            <Input placeholder="Ex: Conta Corrente, Poupança, etc." />
          </Form.Item>

          <Form.Item
            name="currencyCode"
            label="Moeda"
            rules={[{ required: true, message: 'Selecione a moeda' }]}
            initialValue="BRL"
          >
            <Select>
              <Select.Option value="BRL">BRL - Real Brasileiro</Select.Option>
              <Select.Option value="USD">USD - Dólar Americano</Select.Option>
              <Select.Option value="EUR">EUR - Euro</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="currentBalance" label="Saldo Atual" initialValue={0}>
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
            name="availableBalance"
            label="Saldo Disponível"
            initialValue={0}
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
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        open={isCategoryModalVisible}
        onOk={handleCategorySubmit}
        onCancel={() => {
          setIsCategoryModalVisible(false);
          categoryForm.resetFields();
          setEditingCategory(null);
        }}
        confirmLoading={createCategory.isPending || updateCategory.isPending}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="categoryName"
            label="Nome da Categoria"
            rules={[{ required: true, message: 'Informe o nome da categoria' }]}
          >
            <Input placeholder="Ex: Alimentação, Transporte, Salário, etc." />
          </Form.Item>

          <Form.Item
            name="categoryType"
            label="Tipo"
            rules={[{ required: true, message: 'Selecione o tipo' }]}
          >
            <Select placeholder="Selecione o tipo">
              <Select.Option value="INCOME">Receita</Select.Option>
              <Select.Option value="EXPENSE">Despesa</Select.Option>
              <Select.Option value="TRANSFER">Transferência</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} placeholder="Descrição da categoria" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Budget Modal */}
      <Modal
        title={editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
        open={isBudgetModalVisible}
        onOk={handleBudgetSubmit}
        onCancel={() => {
          setIsBudgetModalVisible(false);
          budgetForm.resetFields();
          setEditingBudget(null);
        }}
        confirmLoading={createBudget.isPending || updateBudget.isPending}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={budgetForm} layout="vertical">
          <Form.Item
            name="budgetName"
            label="Nome do Orçamento"
            rules={[{ required: true, message: 'Informe o nome do orçamento' }]}
          >
            <Input placeholder="Ex: Orçamento Janeiro 2024" />
          </Form.Item>

          <Form.Item
            name="periodType"
            label="Tipo de Período"
            rules={[{ required: true, message: 'Selecione o tipo de período' }]}
          >
            <Select placeholder="Selecione o tipo">
              <Select.Option value="MONTHLY">Mensal</Select.Option>
              <Select.Option value="ANNUAL">Anual</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Data Inicial"
            rules={[{ required: true, message: 'Selecione a data inicial' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Data Final"
            rules={[{ required: true, message: 'Selecione a data final' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="totalAmount"
            label="Valor Total"
            rules={[
              { required: true, message: 'Informe o valor total' },
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
            name="currencyCode"
            label="Moeda"
            rules={[{ required: true, message: 'Selecione a moeda' }]}
            initialValue="BRL"
          >
            <Select>
              <Select.Option value="BRL">BRL - Real Brasileiro</Select.Option>
              <Select.Option value="USD">USD - Dólar Americano</Select.Option>
              <Select.Option value="EUR">EUR - Euro</Select.Option>
            </Select>
          </Form.Item>

          {editingBudget && (
            <Form.Item name="isActive" label="Ativo" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Budget Items Drawer */}
      <Drawer
        title="Gerenciar Itens do Orçamento"
        placement="right"
        width={800}
        open={isBudgetItemsDrawerVisible}
        onClose={() => {
          setIsBudgetItemsDrawerVisible(false);
          setSelectedBudgetForItems(null);
        }}
      >
        {selectedBudgetForItems && (
          <BudgetItemsManager
            budget={selectedBudgetForItems}
            onClose={() => {
              setIsBudgetItemsDrawerVisible(false);
              setSelectedBudgetForItems(null);
            }}
          />
        )}
      </Drawer>
    </div>
  );
};

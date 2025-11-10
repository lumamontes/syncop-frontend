import { AccountForm } from '@/features/accounts/account-form';
import { BudgetForm } from '@/features/budgets/budget-form';
import { BudgetSummary } from '@/features/budgets/budget-summary';
import { CategoryForm } from '@/features/categories/category-form';
import { dashboardApi } from '@/features/dashboard/dashboard.api';
import { DataManagementTab } from '@/features/dashboard/data-management-tab';
import { ImportDataTab } from '@/features/dashboard/import-data-tab';
import { ReportsTab } from '@/features/dashboard/reports-tab';
import { GoalsSummary } from '@/features/goals/goals-summary';
import type { RecurringTransaction } from '@/features/recurring-transactions';
import { recurringTransactionsApi } from '@/features/recurring-transactions';
import { SeedButton } from '@/features/seed/seed-button';
import type { Transaction } from '@/features/transactions';
import { TransactionForm } from '@/features/transactions/transaction-form';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DollarOutlined,
  FileTextOutlined,
  ImportOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Col,
  List,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { useMemo, useState } from 'react';

const { Title } = Typography;

export const FinancialDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [transactionsPageSize, setTransactionsPageSize] = useState<number>(10);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getDashboardData();
      return response.data;
    },
  });

  const { data: recurringTransactionsData } = useQuery({
    queryKey: ['recurring-transactions', true],
    queryFn: async () => {
      const response = await recurringTransactionsApi.getAll(true);
      return response.data || [];
    },
  });

  const deleteRecurringTransaction = useMutation({
    mutationFn: async (id: number) => {
      await recurringTransactionsApi.delete(id);
    },
    onSuccess: () => {
      message.success('Transação recorrente excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao excluir transação recorrente');
    },
  });

  const transactions = dashboardData?.transactions || [];
  const accounts = dashboardData?.accounts || [];
  const recurringTransactions = recurringTransactionsData || [];

  const financialSummary = useMemo(() => {
    // Transaction-based calculations (flow of money)
    const incomes = transactions
      .filter(t => t.transactionType === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.transactionType === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const transactionBalance = incomes - expenses;

    // Account-based calculations (actual balances stored in accounts)
    const totalAccountBalance = accounts.reduce(
      (sum, account) => sum + (Number(account.currentBalance) || 0),
      0,
    );

    const totalAvailableBalance = accounts.reduce(
      (sum, account) => sum + (Number(account.availableBalance) || 0),
      0,
    );

    return {
      // Transaction flows
      incomes,
      expenses,
      transactionBalance,
      // Account balances
      totalAccountBalance,
      totalAvailableBalance,
      // Combined view - use account balance as primary, but show both
      balance: totalAccountBalance, // Primary balance from accounts
      transactionCount: transactions.length,
    };
  }, [transactions, accounts]);

  const recentTransactions = useMemo(() => {
    return transactions.sort((a, b) => {
      const dateA = new Date(a.transactionDate).getTime();
      const dateB = new Date(b.transactionDate).getTime();
      return dateB - dateA;
    });
  }, [transactions]);

  const transactionColumns = [
    {
      title: 'Data',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Tipo',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: string, record: Transaction) => (
        <Space>
          <Tag color={type === 'CREDIT' ? 'green' : 'red'}>
            {type === 'CREDIT' ? 'Receita' : 'Despesa'}
          </Tag>
          {record.transactionNature && (
            <Tag
              color={record.transactionNature === 'FIXED' ? 'blue' : 'orange'}
            >
              {record.transactionNature === 'FIXED' ? 'Fixa' : 'Variável'}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <span
          style={{
            color: record.transactionType === 'CREDIT' ? '#52c41a' : '#ff4d4f',
          }}
        >
          {record.transactionType === 'CREDIT' ? '+' : '-'}
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(amount)}
        </span>
      ),
    },
  ];

  const recurringColumns = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Tipo',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: string) => (
        <Tag color={type === 'CREDIT' ? 'green' : 'red'}>
          {type === 'CREDIT' ? 'Receita' : 'Despesa'}
        </Tag>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(amount),
    },
    {
      title: 'Frequência',
      dataIndex: 'recurrenceType',
      key: 'recurrenceType',
      render: (type: string) => {
        const labels: Record<string, string> = {
          DAILY: 'Diária',
          WEEKLY: 'Semanal',
          MONTHLY: 'Mensal',
          YEARLY: 'Anual',
        };
        return labels[type] || type;
      },
    },
    {
      title: 'Próxima Data',
      dataIndex: 'nextDueDate',
      key: 'nextDueDate',
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString('pt-BR') : '-',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: RecurringTransaction) => (
        <Popconfirm
          title="Tem certeza que deseja excluir esta transação recorrente?"
          onConfirm={() => deleteRecurringTransaction.mutate(record.id)}
          okText="Sim"
          cancelText="Não"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            loading={deleteRecurringTransaction.isPending}
          >
            Excluir
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Action Buttons */}
        <Card className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <Title level={2} className="mb-0 text-xl sm:text-2xl md:text-3xl">
              syncop
            </Title>
            <Space wrap className="w-full sm:w-auto">
              <SeedButton />
              <AccountForm />
              <CategoryForm />
              <BudgetForm />
            </Space>
          </div>
          <Space wrap className="w-full sm:w-auto">
            <TransactionForm type="CREDIT" />
            <TransactionForm type="DEBIT" />
          </Space>
        </Card>

        {/* Financial Summary Cards */}
        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          {/* Account Balances Section */}
          <Col xs={24} sm={12} lg={8}>
            <Card className="h-full">
              <Statistic
                title="Saldo Total das Contas"
                value={financialSummary.totalAccountBalance}
                prefix={<WalletOutlined />}
                valueStyle={{
                  color:
                    financialSummary.totalAccountBalance >= 0
                      ? '#52c41a'
                      : '#ff4d4f',
                }}
                formatter={value =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(value))
                }
              />
              <div className="mt-2 text-xs text-gray-500">
                Saldo disponível:{' '}
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(financialSummary.totalAvailableBalance)}
              </div>
            </Card>
          </Col>

          {/* Transaction Flows Section */}
          <Col xs={24} sm={12} lg={8}>
            <Card className="h-full">
              <Statistic
                title="Receitas (Transações)"
                value={financialSummary.incomes}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={value =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(value))
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="h-full">
              <Statistic
                title="Despesas (Transações)"
                value={financialSummary.expenses}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
                formatter={value =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(value))
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Additional Info Row */}
        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          <Col xs={24} sm={12} lg={8}>
            <Card className="h-full">
              <Statistic
                title="Saldo Calculado (Receitas - Despesas)"
                value={financialSummary.transactionBalance}
                prefix={<DollarOutlined />}
                valueStyle={{
                  color:
                    financialSummary.transactionBalance >= 0
                      ? '#52c41a'
                      : '#ff4d4f',
                }}
                formatter={value =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(value))
                }
              />
              <div className="mt-2 text-xs text-gray-500">
                Baseado apenas nas transações registradas
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="h-full">
              <Statistic
                title="Total de Transações"
                value={financialSummary.transactionCount}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="h-full">
              <Statistic
                title="Total de Contas"
                value={accounts.length}
                prefix={<WalletOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Budget Summaries */}
        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          <Col xs={24} lg={12}>
            <BudgetSummary periodType="MONTHLY" />
          </Col>
          <Col xs={24} lg={12}>
            <BudgetSummary periodType="ANNUAL" />
          </Col>
        </Row>

        {/* Goals Summary */}
        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          <Col xs={24}>
            <GoalsSummary />
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Card className="mb-4 sm:mb-6">
          <Tabs
            defaultActiveKey="transactions"
            type="card"
            size="small"
            items={[
              {
                key: 'transactions',
                label: 'Transações Recentes',
                children: (
                  <div className="overflow-x-auto">
                    <Table
                      dataSource={recentTransactions}
                      columns={transactionColumns}
                      rowKey="id"
                      loading={isLoading}
                      pagination={{
                        pageSize: transactionsPageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100'],
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} de ${total} transações`,
                        onShowSizeChange: (current, size) => {
                          setTransactionsPageSize(size);
                        },
                        responsive: true,
                      }}
                      size="middle"
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                ),
              },
              {
                key: 'recurring',
                label: (
                  <span>
                    Transações Recorrentes{' '}
                    <Badge count={recurringTransactions.length} />
                  </span>
                ),
                children: (
                  <div className="overflow-x-auto">
                    <Table
                      dataSource={recurringTransactions}
                      columns={recurringColumns}
                      rowKey="id"
                      loading={isLoading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        responsive: true,
                      }}
                      size="middle"
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                ),
              },
              {
                key: 'reports',
                label: (
                  <Space size="small">
                    <FileTextOutlined />
                    <span>Relatórios</span>
                  </Space>
                ),
                children: <ReportsTab />,
              },
              {
                key: 'import',
                label: (
                  <Space size="small">
                    <ImportOutlined />
                    <span className="hidden sm:inline">Importar Dados</span>
                    <span className="sm:hidden">Importar</span>
                  </Space>
                ),
                children: <ImportDataTab />,
              },
              {
                key: 'data',
                label: (
                  <Space size="small">
                    <DatabaseOutlined />
                    <span className="hidden sm:inline">Gerenciar Dados</span>
                    <span className="sm:hidden">Dados</span>
                  </Space>
                ),
                children: <DataManagementTab />,
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

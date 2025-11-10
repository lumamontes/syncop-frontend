import {
  type Budget,
  type BudgetItem,
  budgetItemsApi,
} from '@/features/budgets';
import { dashboardApi } from '@/features/dashboard/dashboard.api';
import {
  DollarOutlined,
  PieChartOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Card,
  Col,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useMemo } from 'react';

const { Title } = Typography;

interface BudgetSummaryProps {
  periodType: 'MONTHLY' | 'ANNUAL';
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ periodType }) => {
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getDashboardData();
      return response.data;
    },
  });

  const activeBudgets: Budget[] = dashboardData?.budgets || [];
  const transactions = dashboardData?.transactions || [];
  const categories = dashboardData?.categories || [];

  const currentBudget = useMemo(() => {
    const now = new Date();
    return activeBudgets.find(budget => {
      const start = new Date(budget.startDate);
      const end = new Date(budget.endDate);
      return (
        budget.periodType === periodType &&
        budget.isActive &&
        now >= start &&
        now <= end
      );
    });
  }, [activeBudgets, periodType]);

  const { data: budgetItemsData } = useQuery({
    queryKey: ['budgetItems', currentBudget?.id],
    queryFn: async () => {
      if (!currentBudget?.id) return [];
      const response = await budgetItemsApi.getAll(currentBudget.id);
      return response.data || [];
    },
    enabled: !!currentBudget?.id,
  });

  const budgetItems: BudgetItem[] = budgetItemsData || [];

  const budgetStats = useMemo(() => {
    if (!currentBudget) {
      return {
        totalAllocated: 0,
        totalSpent: 0,
        remaining: 0,
        percentage: 0,
      };
    }

    const totalAllocated = budgetItems.reduce(
      (sum, item) => sum + item.allocatedAmount,
      0,
    );

    const categorySpending = transactions
      .filter(t => t.transactionType === 'DEBIT')
      .reduce(
        (acc, transaction) => {
          const categoryId = transaction.categoryId;
          acc[categoryId] = (acc[categoryId] || 0) + transaction.amount;
          return acc;
        },
        {} as Record<number, number>,
      );

    const totalSpent = budgetItems.reduce((sum, item) => {
      const spent = categorySpending[item.categoryId] || 0;
      return sum + spent;
    }, 0);

    const remaining = totalAllocated - totalSpent;
    const percentage =
      totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    return {
      totalAllocated,
      totalSpent,
      remaining,
      percentage: Math.min(percentage, 100),
    };
  }, [currentBudget, budgetItems, transactions]);

  const budgetItemsWithDetails = useMemo(() => {
    return budgetItems.map(item => {
      const category = categories.find(c => c.id === item.categoryId);
      const spent = transactions
        .filter(
          t =>
            t.categoryId === item.categoryId && t.transactionType === 'DEBIT',
        )
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage =
        item.allocatedAmount > 0 ? (spent / item.allocatedAmount) * 100 : 0;

      return {
        ...item,
        categoryName: category?.categoryName || 'N/A',
        spent,
        percentage: Math.min(percentage, 100),
      };
    });
  }, [budgetItems, categories, transactions]);

  if (!currentBudget) {
    return (
      <Card>
        <Title level={4}>
          {periodType === 'MONTHLY' ? 'Orçamento Mensal' : 'Orçamento Anual'}
        </Title>
        <p>Nenhum orçamento ativo encontrado para este período.</p>
      </Card>
    );
  }

  const columns = [
    {
      title: 'Categoria',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Alocado',
      dataIndex: 'allocatedAmount',
      key: 'allocatedAmount',
      render: (amount: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: currentBudget.currencyCode || 'BRL',
        }).format(amount),
    },
    {
      title: 'Gasto',
      dataIndex: 'spent',
      key: 'spent',
      render: (spent: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: currentBudget.currencyCode || 'BRL',
        }).format(spent),
    },
    {
      title: 'Restante',
      key: 'remaining',
      render: (_: unknown, record: BudgetItem) => {
        const remaining = record.allocatedAmount - record.spent;
        return (
          <Tag color={remaining >= 0 ? 'green' : 'red'}>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: currentBudget.currencyCode || 'BRL',
            }).format(remaining)}
          </Tag>
        );
      },
    },
    {
      title: 'Progresso',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <Progress
          percent={Math.round(percentage)}
          status={percentage > 100 ? 'exception' : 'active'}
          strokeColor={percentage > 100 ? '#ff4d4f' : '#52c41a'}
        />
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Title level={4}>
          {currentBudget.budgetName} (
          {periodType === 'MONTHLY' ? 'Mensal' : 'Anual'})
        </Title>
        <p style={{ color: '#666', marginBottom: 16 }}>
          {new Date(currentBudget.startDate).toLocaleDateString('pt-BR')} -{' '}
          {new Date(currentBudget.endDate).toLocaleDateString('pt-BR')}
        </p>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Alocado"
              value={budgetStats.totalAllocated}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              formatter={value =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: currentBudget.currencyCode || 'BRL',
                }).format(Number(value))
              }
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Gasto"
              value={budgetStats.totalSpent}
              prefix={<DollarOutlined />}
              valueStyle={{
                color:
                  budgetStats.totalSpent > budgetStats.totalAllocated
                    ? '#ff4d4f'
                    : '#52c41a',
              }}
              formatter={value =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: currentBudget.currencyCode || 'BRL',
                }).format(Number(value))
              }
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Restante"
              value={budgetStats.remaining}
              prefix={<DollarOutlined />}
              valueStyle={{
                color: budgetStats.remaining >= 0 ? '#52c41a' : '#ff4d4f',
              }}
              formatter={value =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: currentBudget.currencyCode || 'BRL',
                }).format(Number(value))
              }
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Progresso"
              value={budgetStats.percentage}
              prefix={<PieChartOutlined />}
              suffix="%"
              valueStyle={{
                color: budgetStats.percentage > 100 ? '#ff4d4f' : '#1890ff',
              }}
            />
          </Col>
        </Row>

        <Progress
          percent={Math.round(budgetStats.percentage)}
          status={budgetStats.percentage > 100 ? 'exception' : 'active'}
          strokeColor={budgetStats.percentage > 100 ? '#ff4d4f' : '#52c41a'}
          style={{ marginBottom: 24 }}
        />

        {budgetStats.percentage > 100 && (
          <Alert
            message="Orçamento Excedido"
            description={`Você ultrapassou o orçamento em ${new Intl.NumberFormat(
              'pt-BR',
              {
                style: 'currency',
                currency: currentBudget.currencyCode || 'BRL',
              },
            ).format(Math.abs(budgetStats.remaining))}`}
            type="error"
            icon={<WarningOutlined />}
            showIcon
            className="mb-4"
          />
        )}

        {budgetStats.percentage >= 80 && budgetStats.percentage <= 100 && (
          <Alert
            message="Atenção: Orçamento Próximo do Limite"
            description={`Você já utilizou ${Math.round(budgetStats.percentage)}% do orçamento. Restam ${new Intl.NumberFormat(
              'pt-BR',
              {
                style: 'currency',
                currency: currentBudget.currencyCode || 'BRL',
              },
            ).format(budgetStats.remaining)}`}
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            className="mb-4"
          />
        )}

        <Title level={5}>Itens do Orçamento</Title>
        <Table
          dataSource={budgetItemsWithDetails}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

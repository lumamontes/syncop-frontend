import { dashboardApi } from '@/features/dashboard/dashboard.api';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Empty, Row, Spin, Statistic, Typography } from 'antd';
import { useMemo } from 'react';

const { Title, Text } = Typography;

export const ReportsTab: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getDashboardData();
      return response.data;
    },
  });

  const transactions = dashboardData?.transactions || [];
  const categories = dashboardData?.categories || [];

  const categoryExpenses = useMemo(() => {
    const categoryMap = new Map<string, number>();

    for (const t of transactions.filter(t => t.transactionType === 'DEBIT')) {
      const categoryId = t.categoryId;
      const categoryName =
        categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
      const current = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, current + t.amount);
    }

    return Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, categories]);

  const monthlyTrend = useMemo(() => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    for (const t of transactions) {
      const date = new Date(t.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthlyMap.get(monthKey) || { income: 0, expense: 0 };

      if (t.transactionType === 'CREDIT') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }

      monthlyMap.set(monthKey, current);
    }

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.income - data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [transactions]);

  const accountBalances = useMemo(() => {
    const accountMap = new Map<string, number>();
    const accounts = dashboardData?.accounts || [];

    for (const t of transactions) {
      const accountId = t.accountId;
      const accountName =
        accounts.find(a => a.id === accountId)?.name || 'Conta desconhecida';
      const current = accountMap.get(accountName) || 0;

      if (t.transactionType === 'CREDIT') {
        accountMap.set(accountName, current + t.amount);
      } else {
        accountMap.set(accountName, current - t.amount);
      }
    }

    return Array.from(accountMap.entries()).map(([name, balance]) => ({
      name,
      balance,
    }));
  }, [transactions, dashboardData?.accounts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total de Transações"
              value={transactions.length}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Categorias Utilizadas"
              value={categoryExpenses.length}
              prefix={<PieChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Meses Analisados"
              value={monthlyTrend.length}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Categories */}
      <Card title="Top 5 Categorias por Despesa">
        {categoryExpenses.length > 0 ? (
          <div className="space-y-4">
            {categoryExpenses.map(category => (
              <div
                key={category.name}
                className="flex justify-between items-center"
              >
                <Text strong>{category.name}</Text>
                <Text type="danger">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(category.amount)}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="Nenhuma despesa por categoria encontrada" />
        )}
      </Card>

      {/* Monthly Trend */}
      <Card title="Tendência Mensal (Últimos 6 meses)">
        {monthlyTrend.length > 0 ? (
          <div className="space-y-4">
            {monthlyTrend.map(month => (
              <div key={month.month} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <Text strong>
                    {new Date(`${month.month}-01`).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text
                    style={{
                      color: month.balance >= 0 ? '#52c41a' : '#ff4d4f',
                    }}
                  >
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(month.balance)}
                  </Text>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <Text>
                    Receitas:{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(month.income)}
                  </Text>
                  <Text>
                    Despesas:{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(month.expense)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="Nenhum dado mensal disponível" />
        )}
      </Card>

      {/* Account Balances */}
      {accountBalances.length > 0 && (
        <Card title="Saldo por Conta">
          <div className="space-y-4">
            {accountBalances.map(account => (
              <div
                key={account.name}
                className="flex justify-between items-center"
              >
                <Text strong>{account.name}</Text>
                <Text
                  style={{
                    color: account.balance >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(account.balance)}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

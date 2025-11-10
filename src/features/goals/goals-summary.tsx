import { type Goal, goalsApi } from '@/features/goals';
import {
  CheckCircleOutlined,
  FireOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { useMemo } from 'react';

const { Title, Text } = Typography;

export const GoalsSummary: React.FC = () => {
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await goalsApi.getAll(true); // Only active goals
      return response.data || [];
    },
  });

  const goals: Goal[] = goalsData || [];

  const goalsStats = useMemo(() => {
    const activeGoals = goals.filter(g => g.isActive && !g.isAchieved);
    const achievedGoals = goals.filter(g => g.isAchieved);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress =
      totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    // Find goals that are close to target (80%+)
    const nearCompletion = activeGoals.filter(g => g.progressPercentage >= 80);

    // Find goals that are overdue (if they have targetDate)
    const now = new Date();
    const overdue = activeGoals.filter(g => {
      if (!g.targetDate) return false;
      return new Date(g.targetDate) < now && g.progressPercentage < 100;
    });

    return {
      activeCount: activeGoals.length,
      achievedCount: achievedGoals.length,
      totalTarget,
      totalCurrent,
      overallProgress,
      nearCompletion,
      overdue,
    };
  }, [goals]);

  if (isLoading) {
    return (
      <Card>
        <Text>Carregando...</Text>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <Title level={4}>
          <TrophyOutlined className="mr-2" />
          Metas Financeiras
        </Title>
        <Empty description="Nenhuma meta ativa encontrada" />
      </Card>
    );
  }

  const topGoals = goals
    .filter(g => g.isActive && !g.isAchieved)
    .sort(
      (a, b) =>
        b.priority - a.priority || b.progressPercentage - a.progressPercentage,
    )
    .slice(0, 3);

  return (
    <Card>
      <Title level={4}>
        <TrophyOutlined className="mr-2" />
        Metas Financeiras
      </Title>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Statistic
            title="Metas Ativas"
            value={goalsStats.activeCount}
            prefix={<TrophyOutlined />}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Metas Concluídas"
            value={goalsStats.achievedCount}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Progresso Total"
            value={Math.round(goalsStats.overallProgress)}
            suffix="%"
            prefix={<FireOutlined />}
            valueStyle={{
              color: goalsStats.overallProgress >= 100 ? '#52c41a' : '#1890ff',
            }}
          />
        </Col>
      </Row>

      {goalsStats.nearCompletion.length > 0 && (
        <div className="mb-4">
          <Text strong>Metas Próximas da Conclusão:</Text>
          <div className="mt-2">
            {goalsStats.nearCompletion.map(goal => (
              <Tag key={goal.id} color="orange" className="mb-2">
                {goal.goalName} - {Math.round(goal.progressPercentage)}%
              </Tag>
            ))}
          </div>
        </div>
      )}

      {goalsStats.overdue.length > 0 && (
        <div className="mb-4">
          <Text strong type="danger">
            Metas Atrasadas:
          </Text>
          <div className="mt-2">
            {goalsStats.overdue.map(goal => (
              <Tag key={goal.id} color="red" className="mb-2">
                {goal.goalName}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {topGoals.length > 0 && (
        <div>
          <Text strong>Principais Metas:</Text>
          <div className="mt-2 space-y-3">
            {topGoals.map(goal => (
              <div key={goal.id}>
                <div className="flex justify-between items-center mb-1">
                  <Text>{goal.goalName}</Text>
                  <Text type="secondary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: goal.currencyCode || 'BRL',
                    }).format(goal.currentAmount)}{' '}
                    /{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: goal.currencyCode || 'BRL',
                    }).format(goal.targetAmount)}
                  </Text>
                </div>
                <Progress
                  percent={Math.round(goal.progressPercentage)}
                  status={goal.progressPercentage >= 100 ? 'success' : 'active'}
                  strokeColor={
                    goal.progressPercentage >= 100 ? '#52c41a' : '#1890ff'
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

import {
  type BudgetItem,
  type CreateBudgetItemRequest,
  budgetItemsApi,
} from '@/features/budgets';
import { categoriesApi } from '@/features/categories';
import type { Category } from '@/features/categories/categories.types';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { useState } from 'react';
import type { Budget } from './budgets.types';

const { Title } = Typography;

interface BudgetItemsManagerProps {
  budget: Budget;
  onClose?: () => void;
}

export const BudgetItemsManager: React.FC<BudgetItemsManagerProps> = ({
  budget,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const queryClient = useQueryClient();

  // Fetch budget items
  const { data: budgetItemsData, isLoading } = useQuery({
    queryKey: ['budgetItems', budget.id],
    queryFn: async () => {
      const response = await budgetItemsApi.getAll(budget.id);
      return response.data || [];
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll('EXPENSE');
      return response.data || [];
    },
  });

  const budgetItems: BudgetItem[] = budgetItemsData || [];
  const categories: Category[] = categoriesData || [];

  // Create budget item
  const createBudgetItem = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return await budgetItemsApi.create(budget.id, {
        categoryId: values.categoryId as number,
        allocatedAmount: values.allocatedAmount as number,
        currencyCode: budget.currencyCode || 'BRL',
      } as CreateBudgetItemRequest);
    },
    onSuccess: () => {
      message.success('Item de orçamento criado com sucesso!');
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao criar item de orçamento');
    },
  });

  // Update budget item
  const updateBudgetItem = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number;
      values: Record<string, unknown>;
    }) => {
      return await budgetItemsApi.update(budget.id, id, {
        categoryId: values.categoryId as number,
        allocatedAmount: values.allocatedAmount as number,
        currencyCode: budget.currencyCode || 'BRL',
      } as CreateBudgetItemRequest);
    },
    onSuccess: () => {
      message.success('Item de orçamento atualizado com sucesso!');
      form.resetFields();
      setIsModalVisible(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao atualizar item de orçamento');
    },
  });

  // Delete budget item
  const deleteBudgetItem = useMutation({
    mutationFn: async (id: number) => {
      await budgetItemsApi.delete(budget.id, id);
    },
    onSuccess: () => {
      message.success('Item de orçamento excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao excluir item de orçamento');
    },
  });

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      categoryId: item.categoryId,
      allocatedAmount: item.allocatedAmount,
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await updateBudgetItem.mutateAsync({ id: editingItem.id, values });
      } else {
        await createBudgetItem.mutateAsync(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'Categoria',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: number) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.categoryName || 'N/A';
      },
    },
    {
      title: 'Valor Alocado',
      dataIndex: 'allocatedAmount',
      key: 'allocatedAmount',
      render: (amount: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: budget.currencyCode || 'BRL',
        }).format(amount),
    },
    {
      title: 'Valor Gasto',
      dataIndex: 'spentAmount',
      key: 'spentAmount',
      render: (spent: number | undefined) => {
        const spentValue = spent || 0;
        return (
          <Tag color={spentValue > 0 ? 'orange' : 'default'}>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: budget.currencyCode || 'BRL',
            }).format(spentValue)}
          </Tag>
        );
      },
    },
    {
      title: 'Restante',
      key: 'remaining',
      render: (_: unknown, record: BudgetItem) => {
        const spent = record.spentAmount || 0;
        const remaining = record.allocatedAmount - spent;
        return (
          <Tag color={remaining >= 0 ? 'green' : 'red'}>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: budget.currencyCode || 'BRL',
            }).format(remaining)}
          </Tag>
        );
      },
    },
    {
      title: 'Progresso',
      key: 'progress',
      render: (_: unknown, record: BudgetItem) => {
        const spent = record.spentAmount || 0;
        const percentage =
          record.allocatedAmount > 0
            ? (spent / record.allocatedAmount) * 100
            : 0;
        return (
          <Progress
            percent={Math.round(percentage)}
            status={percentage > 100 ? 'exception' : 'active'}
            strokeColor={percentage > 100 ? '#ff4d4f' : '#52c41a'}
            style={{ minWidth: 100 }}
          />
        );
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: BudgetItem) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir este item?"
            onConfirm={() => deleteBudgetItem.mutate(record.id)}
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

  const totalAllocated = budgetItems.reduce(
    (sum, item) => sum + item.allocatedAmount,
    0,
  );

  const totalSpent = budgetItems.reduce(
    (sum, item) => sum + (item.spentAmount || 0),
    0,
  );

  const availableCategories = categories.filter(
    cat => !budgetItems.some(item => item.categoryId === cat.id) || editingItem,
  );

  return (
    <>
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Itens do Orçamento: {budget.budgetName}
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={availableCategories.length === 0 && !editingItem}
            >
              Adicionar Item
            </Button>
            {onClose && <Button onClick={onClose}>Fechar</Button>}
          </Space>
        }
      >
        <div className="mb-4">
          <Space size="large">
            <div>
              <Typography.Text type="secondary">
                Total Alocado:{' '}
              </Typography.Text>
              <Typography.Text strong>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: budget.currencyCode || 'BRL',
                }).format(totalAllocated)}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text type="secondary">Total Gasto: </Typography.Text>
              <Typography.Text
                strong
                style={{
                  color: totalSpent > totalAllocated ? '#ff4d4f' : '#52c41a',
                }}
              >
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: budget.currencyCode || 'BRL',
                }).format(totalSpent)}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text type="secondary">Restante: </Typography.Text>
              <Typography.Text
                strong
                style={{
                  color:
                    totalAllocated - totalSpent >= 0 ? '#52c41a' : '#ff4d4f',
                }}
              >
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: budget.currencyCode || 'BRL',
                }).format(totalAllocated - totalSpent)}
              </Typography.Text>
            </div>
          </Space>
        </div>

        {availableCategories.length === 0 &&
          !editingItem &&
          budgetItems.length > 0 && (
            <div className="mb-4">
              <Typography.Text type="warning">
                Todas as categorias de despesa já foram adicionadas ao
                orçamento.
              </Typography.Text>
            </div>
          )}

        <Table
          dataSource={budgetItems}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, responsive: true }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={
          editingItem ? 'Editar Item de Orçamento' : 'Novo Item de Orçamento'
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
        confirmLoading={
          createBudgetItem.isPending || updateBudgetItem.isPending
        }
        okText="Salvar"
        cancelText="Cancelar"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="categoryId"
            label="Categoria"
            rules={[{ required: true, message: 'Selecione uma categoria' }]}
          >
            <Select
              placeholder="Selecione uma categoria"
              disabled={!!editingItem}
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {availableCategories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="allocatedAmount"
            label="Valor Alocado"
            rules={[
              { required: true, message: 'Informe o valor alocado' },
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
        </Form>
      </Modal>
    </>
  );
};

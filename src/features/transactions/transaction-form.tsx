import { type Account, accountsApi } from '@/features/accounts';
import { type Category, categoriesApi } from '@/features/categories';
import {
  type CreateRecurringTransactionRequest,
  recurringTransactionsApi,
} from '@/features/recurring-transactions';
import {
  type CreateTransactionRequest,
  type TransactionType,
  transactionsApi,
} from '@/features/transactions';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Switch,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

interface TransactionFormProps {
  type: 'DEBIT' | 'CREDIT';
  onSuccess?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const queryClient = useQueryClient();

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await accountsApi.getAll();
      return response.data || [];
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', type === 'DEBIT' ? 'EXPENSE' : 'INCOME'],
    queryFn: async () => {
      const categoryType = type === 'DEBIT' ? 'EXPENSE' : 'INCOME';
      const response = await categoriesApi.getAll(categoryType);
      return response.data || [];
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (isRecurring) {
        // Create recurring transaction
        return await recurringTransactionsApi.create({
          accountId: values.accountId as number,
          categoryId: values.categoryId as number,
          transactionType: type,
          amount: values.amount as number,
          description: values.description as string | undefined,
          merchantName: values.merchantName as string | undefined,
          recurrenceType:
            values.recurrenceType as CreateRecurringTransactionRequest['recurrenceType'],
          recurrenceDay: values.recurrenceDay as number | undefined,
          startDate: (
            values.startDate as { format: (format: string) => string }
          ).format('YYYY-MM-DD'),
          endDate: values.endDate
            ? (values.endDate as { format: (format: string) => string }).format(
                'YYYY-MM-DD',
              )
            : undefined,
        } as CreateRecurringTransactionRequest);
      }
      // Create regular transaction
      const transactionData = {
        accountId: values.accountId as number,
        categoryId: values.categoryId as number,
        transactionType: type,
        transactionNature:
          values.transactionNature as CreateTransactionRequest['transactionNature'],
        amount: values.amount as number,
        transactionDate: (
          values.transactionDate as { format: (format: string) => string }
        ).format('YYYY-MM-DD'),
        description: values.description as string | undefined,
        merchantName: values.merchantName as string | undefined,
      } as CreateTransactionRequest;
      return await transactionsApi.create(transactionData);
    },
    onSuccess: () => {
      message.success(
        isRecurring
          ? `${type === 'DEBIT' ? 'Despesa' : 'Receita'} recorrente criada com sucesso!`
          : `${type === 'DEBIT' ? 'Despesa' : 'Receita'} adicionada com sucesso!`,
      );
      form.resetFields();
      setIsModalVisible(false);
      setIsRecurring(false);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      message.error(
        error?.message ||
          `Erro ao adicionar ${type === 'DEBIT' ? 'despesa' : 'receita'}`,
      );
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createTransaction.mutateAsync(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const accounts: Account[] = accountsData || [];
  const categories: Category[] = categoriesData || [];

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{
          backgroundColor: type === 'DEBIT' ? '#ff4d4f' : '#52c41a',
          borderColor: type === 'DEBIT' ? '#ff4d4f' : '#52c41a',
        }}
      >
        {type === 'DEBIT' ? 'Adicionar Despesa' : 'Adicionar Receita'}
      </Button>

      <Modal
        title={type === 'DEBIT' ? 'Nova Despesa' : 'Nova Receita'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setIsRecurring(false);
        }}
        confirmLoading={createTransaction.isPending}
        okText="Salvar"
        cancelText="Cancelar"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            transactionDate: dayjs(),
            recurrenceType: 'MONTHLY',
          }}
        >
          <Form.Item label="Tipo de Transação">
            <Radio.Group
              value={isRecurring ? 'recurring' : 'one-time'}
              onChange={e => {
                setIsRecurring(e.target.value === 'recurring');
                form.setFieldsValue({
                  transactionDate: dayjs(),
                  recurrenceType: 'MONTHLY',
                });
              }}
            >
              <Radio value="one-time">Única</Radio>
              <Radio value="recurring">Recorrente</Radio>
            </Radio.Group>
          </Form.Item>

          {!isRecurring && (
            <Form.Item
              name="transactionNature"
              label="Natureza"
              tooltip="Fixa: valor constante (ex: aluguel, salário). Variável: valor pode mudar (ex: compras, entretenimento)"
            >
              <Select placeholder="Selecione a natureza">
                <Select.Option value="VARIABLE">Variável</Select.Option>
                <Select.Option value="FIXED">Fixa</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="accountId"
            label="Conta"
            rules={[{ required: true, message: 'Selecione uma conta' }]}
          >
            <Select placeholder="Selecione uma conta" showSearch>
              {accounts.map(account => (
                <Select.Option key={account.id} value={account.id}>
                  {account.accountName} ({account.currencyCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Categoria"
            rules={[{ required: true, message: 'Selecione uma categoria' }]}
          >
            <Select placeholder="Selecione uma categoria" showSearch>
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Valor"
            rules={[
              { required: true, message: 'Informe o valor' },
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

          {isRecurring ? (
            <>
              <Form.Item
                name="recurrenceType"
                label="Frequência"
                rules={[{ required: true, message: 'Selecione a frequência' }]}
              >
                <Select>
                  <Select.Option value="DAILY">Diária</Select.Option>
                  <Select.Option value="WEEKLY">Semanal</Select.Option>
                  <Select.Option value="MONTHLY">Mensal</Select.Option>
                  <Select.Option value="YEARLY">Anual</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="recurrenceDay"
                label="Dia da Recorrência"
                tooltip="Para mensal: dia do mês (1-31). Para semanal: dia da semana (1-7, onde 1=Segunda)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={31}
                  placeholder="Ex: 15 (dia 15 do mês)"
                />
              </Form.Item>

              <Form.Item
                name="startDate"
                label="Data Inicial"
                rules={[
                  { required: true, message: 'Selecione a data inicial' },
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                name="endDate"
                label="Data Final (Opcional)"
                tooltip="Deixe em branco para recorrência indefinida"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="transactionDate"
              label="Data"
              rules={[{ required: true, message: 'Selecione a data' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Selecione a data"
              />
            </Form.Item>
          )}

          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} placeholder="Descrição da transação" />
          </Form.Item>

          <Form.Item name="merchantName" label="Estabelecimento">
            <Input placeholder="Nome do estabelecimento" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

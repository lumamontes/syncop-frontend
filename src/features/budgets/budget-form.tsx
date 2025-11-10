import { type CreateBudgetRequest, budgetsApi } from '@/features/budgets';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

export const BudgetForm: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

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
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao criar orçamento');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createBudget.mutateAsync(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <>
      <Button
        type="default"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Novo Orçamento
      </Button>

      <Modal
        title="Novo Orçamento"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={createBudget.isPending}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical">
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
        </Form>
      </Modal>
    </>
  );
};

import { type CreateAccountRequest, accountsApi } from '@/features/accounts';
import {
  type AccountType,
  accountTypesApi,
} from '@/features/accounts/account-types.api';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, Modal, Select, message } from 'antd';
import { useState } from 'react';

export const AccountForm: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data: accountTypesData } = useQuery({
    queryKey: ['accountTypes'],
    queryFn: async () => {
      const response = await accountTypesApi.getAll(true);
      return response.data || [];
    },
  });

  const accountTypes: AccountType[] = accountTypesData || [];

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
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao criar conta');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createAccount.mutateAsync(values);
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
        Nova Conta
      </Button>

      <Modal
        title="Nova Conta"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={createAccount.isPending}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical">
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
    </>
  );
};

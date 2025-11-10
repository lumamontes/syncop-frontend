import {
  type CreateCategoryRequest,
  categoriesApi,
} from '@/features/categories';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { useState } from 'react';

export const CategoryForm: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

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
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || 'Erro ao criar categoria');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createCategory.mutateAsync(values);
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
        Nova Categoria
      </Button>

      <Modal
        title="Nova Categoria"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={createCategory.isPending}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical">
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
    </>
  );
};

import { seedApi } from '@/features/seed/seed.api';
import { DatabaseOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, message } from 'antd';
import { useState } from 'react';

export const SeedButton: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const generateDefaults = useMutation({
    mutationFn: async () => {
      return await seedApi.generateDefaults();
    },
    onSuccess: data => {
      message.success(data.message || 'Valores padrão criados com sucesso!');
      setIsModalVisible(false);
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(
        error?.message ||
          'Erro ao gerar valores padrão. Alguns itens podem já existir.',
      );
    },
  });

  const handleConfirm = () => {
    generateDefaults.mutate();
  };

  return (
    <>
      <Button
        type="default"
        icon={<DatabaseOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Gerar Valores Padrão
      </Button>

      <Modal
        title="Gerar Valores Padrão"
        open={isModalVisible}
        onOk={handleConfirm}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={generateDefaults.isPending}
        okText="Gerar"
        cancelText="Cancelar"
      >
        <p>
          Isso criará contas e categorias padrão para você começar a usar o
          sistema:
        </p>
        <ul style={{ marginLeft: 20, marginTop: 16 }}>
          <li>
            <strong>Contas:</strong> Conta Corrente, Poupança
          </li>
          <li>
            <strong>Categorias de Receita:</strong> Salário, Freelance,
            Investimentos, Outras Receitas
          </li>
          <li>
            <strong>Categorias de Despesa:</strong> Alimentação, Transporte,
            Moradia, Saúde, Educação, Lazer, Compras, Contas
          </li>
        </ul>
        <p style={{ marginTop: 16, color: '#666' }}>
          Se você já tiver contas ou categorias com os mesmos nomes, elas serão
          ignoradas.
        </p>
      </Modal>
    </>
  );
};

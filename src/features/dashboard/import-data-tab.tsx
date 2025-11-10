import { accountsApi } from '@/features/accounts';
import { categoriesApi } from '@/features/categories';
import { transactionsApi } from '@/features/transactions/transactions.api';
import {
  CheckCircleOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Modal,
  Progress,
  Select,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  type ParsedTransaction,
  parseNubankCSVFile,
} from './nubank-csv-parser';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export const ImportDataTab: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<
    ParsedTransaction[]
  >([]);
  const [selectedAccountId, setSelectedAccountId] = useState<
    number | undefined
  >();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const queryClient = useQueryClient();

  // Fetch accounts
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await accountsApi.getAll();
      return response.data || [];
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data || [];
    },
  });

  const handleFileRead = async (file: File) => {
    try {
      const text = await file.text();
      const transactions = parseNubankCSVFile(text);
      setParsedTransactions(transactions);

      if (transactions.length === 0) {
        message.warning('Nenhuma transação válida encontrada no arquivo.');
        return;
      }

      message.success(
        `${transactions.length} transação(ões) encontrada(s) no arquivo.`,
      );
      setPreviewVisible(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      message.error(`Erro ao processar arquivo: ${errorMessage}`);
      console.error('CSV parsing error:', error);
    }
  };

  const handleUpload: UploadProps['customRequest'] = async options => {
    const { file, onSuccess, onError } = options;

    if (!(file instanceof File)) {
      onError?.(new Error('Invalid file'));
      return;
    }

    await handleFileRead(file);
    onSuccess?.(file);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    onChange(info) {
      setFileList(info.fileList);
    },
    beforeUpload: () => false, // Prevent auto upload
    customRequest: handleUpload,
    accept: '.csv,.xlsx,.xls',
  };

  const handleRemove = () => {
    setFileList([]);
    setParsedTransactions([]);
    setSelectedAccountId(undefined);
    setSelectedCategoryId(undefined);
    setImportProgress(0);
  };

  const importTransactions = useMutation({
    mutationFn: async () => {
      if (!selectedAccountId) {
        throw new Error('Selecione uma conta para importar as transações');
      }

      if (parsedTransactions.length === 0) {
        throw new Error('Nenhuma transação para importar');
      }

      const results = [];
      const total = parsedTransactions.length;

      for (let i = 0; i < parsedTransactions.length; i++) {
        const transaction = parsedTransactions[i];

        // Find appropriate category if not selected
        let categoryId = selectedCategoryId;
        if (!categoryId && categoriesData) {
          // Try to find a matching category based on transaction type
          const matchingCategory = categoriesData.find(
            cat =>
              cat.categoryType ===
              (transaction.transactionType === 'DEBIT' ? 'EXPENSE' : 'INCOME'),
          );
          categoryId = matchingCategory?.id;
        }

        if (!categoryId) {
          // Skip transactions without category, or create a default one
          console.warn(`Skipping transaction ${i + 1}: no category available`);
          setImportProgress(Math.round(((i + 1) / total) * 100));
          continue;
        }

        try {
          const result = await transactionsApi.create({
            accountId: selectedAccountId,
            categoryId,
            transactionType: transaction.transactionType,
            amount: transaction.amount,
            transactionDate: transaction.date,
            description: transaction.description,
            merchantName: transaction.merchantName,
          });
          results.push(result);
        } catch (error) {
          console.error(`Error importing transaction ${i + 1}:`, error);
          // Continue with other transactions
        }

        setImportProgress(Math.round(((i + 1) / total) * 100));
      }

      return results;
    },
    onSuccess: results => {
      message.success(
        `${results.length} transação(ões) importada(s) com sucesso!`,
      );
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      handleRemove();
      setPreviewVisible(false);
    },
    onError: (error: Error) => {
      message.error(`Erro ao importar transações: ${error.message}`);
    },
    onSettled: () => {
      setUploading(false);
      setImportProgress(0);
    },
  });

  const handleImport = () => {
    if (!selectedAccountId) {
      message.warning('Por favor, selecione uma conta');
      return;
    }
    setUploading(true);
    importTransactions.mutate();
  };

  const previewColumns = [
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tipo',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: string) => (
        <span style={{ color: type === 'DEBIT' ? '#ff4d4f' : '#52c41a' }}>
          {type === 'DEBIT' ? 'Despesa' : 'Receita'}
        </span>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: ParsedTransaction) => (
        <span
          style={{
            color: record.transactionType === 'DEBIT' ? '#ff4d4f' : '#52c41a',
          }}
        >
          R$ {amount.toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Merchant',
      dataIndex: 'merchantName',
      key: 'merchantName',
      ellipsis: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Title level={4}>Importar Transações - Nubank</Title>
        <Paragraph>
          Importe suas transações financeiras a partir do extrato bancário CSV
          do Nubank. O arquivo deve conter as colunas: Data, Valor,
          Identificador, Descrição.
        </Paragraph>

        <Alert
          message="Formato Nubank Suportado"
          description="Importe o arquivo CSV do extrato bancário do Nubank. O arquivo deve ter no máximo 5MB e conter as colunas: Data, Valor, Identificador, Descrição."
          type="info"
          showIcon
          className="mb-6"
        />

        <Dragger {...uploadProps} disabled={uploading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">
            Clique ou arraste o arquivo aqui para fazer upload
          </p>
          <p className="ant-upload-hint">Suporte para arquivos CSV e Excel</p>
        </Dragger>

        {fileList.length > 0 && (
          <div className="mt-4">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Button
                  type="primary"
                  loading={uploading}
                  onClick={() => {
                    const file = fileList[0];
                    if (file?.originFileObj) {
                      handleFileRead(file.originFileObj);
                    }
                  }}
                  disabled={uploading}
                >
                  Processar Arquivo
                </Button>
                <Button onClick={handleRemove} disabled={uploading}>
                  Remover
                </Button>
              </Space>

              {parsedTransactions.length > 0 && (
                <div className="mt-4 space-y-4">
                  <Alert
                    message={`${parsedTransactions.length} transação(ões) encontrada(s)`}
                    description="Configure a conta e categoria abaixo, depois clique em 'Importar Transações'"
                    type="success"
                    showIcon
                  />

                  <div>
                    <Text strong>Conta: </Text>
                    <Select
                      style={{ width: 300, marginLeft: 8 }}
                      placeholder="Selecione uma conta"
                      value={selectedAccountId}
                      onChange={setSelectedAccountId}
                      disabled={uploading}
                    >
                      {accountsData?.map(account => (
                        <Select.Option key={account.id} value={account.id}>
                          {account.accountName}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Text strong>Categoria (Opcional): </Text>
                    <Select
                      style={{ width: 300, marginLeft: 8 }}
                      placeholder="Selecione uma categoria (opcional)"
                      value={selectedCategoryId}
                      onChange={setSelectedCategoryId}
                      allowClear
                      disabled={uploading}
                    >
                      {categoriesData?.map(category => (
                        <Select.Option key={category.id} value={category.id}>
                          {category.categoryName}
                        </Select.Option>
                      ))}
                    </Select>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Se não selecionar, será usada uma categoria padrão baseada
                      no tipo de transação
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    loading={uploading}
                    onClick={handleImport}
                    disabled={!selectedAccountId || uploading}
                    icon={<CheckCircleOutlined />}
                  >
                    Importar {parsedTransactions.length} Transação(ões)
                  </Button>

                  {uploading && importProgress > 0 && (
                    <Progress percent={importProgress} status="active" />
                  )}
                </div>
              )}
            </Space>
          </div>
        )}
      </Card>

      <Modal
        title="Pré-visualização das Transações"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          dataSource={parsedTransactions}
          columns={previewColumns}
          rowKey={(record, index) => record.identifier || `row-${index}`}
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
        />
      </Modal>

      <Card title="Instruções de Importação - Nubank">
        <div className="space-y-4">
          <div>
            <Title level={5}>
              <FileExcelOutlined className="mr-2" />
              Formato do Arquivo CSV do Nubank
            </Title>
            <Paragraph>
              O arquivo CSV do extrato bancário do Nubank deve conter as
              seguintes colunas:
            </Paragraph>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <Text code>Data</Text> - Data da transação no formato DD/MM/YYYY
              </li>
              <li>
                <Text code>Valor</Text> - Valor da transação (positivo para
                crédito, negativo para débito)
              </li>
              <li>
                <Text code>Identificador</Text> - Identificador único da
                transação (UUID)
              </li>
              <li>
                <Text code>Descrição</Text> - Descrição completa da transação
              </li>
            </ul>
          </div>

          <div>
            <Title level={5}>
              <FileTextOutlined className="mr-2" />
              Exemplo de Arquivo CSV do Nubank
            </Title>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              <code>{`Data,Valor,Identificador,Descrição
01/11/2025,-97.79,69068be8-677b-4e69-89d6-e6befa8eb686,Transferência enviada pelo Pix - IFOOD.COM AGENCIA DE RESTAURANTES ONLINE S.A.
02/11/2025,-88.59,690778be-30b5-4db7-a689-bc4ff5487f29,Transferência enviada pelo Pix - IFOOD.COM AGENCIA DE RESTAURANTES ONLINE S.A.
02/11/2025,1000.00,6908059e-6944-451e-bb5b-e523d7bbae17,Resgate RDB`}</code>
            </pre>
          </div>
        </div>
      </Card>

      <Card title="Como Obter o Arquivo CSV do Nubank">
        <ol className="list-decimal list-inside space-y-2">
          <li>Acesse o aplicativo ou site do Nubank</li>
          <li>Vá até a seção de Extrato ou Histórico</li>
          <li>Selecione o período desejado</li>
          <li>Exporte o extrato no formato CSV</li>
          <li>Faça o upload do arquivo aqui</li>
        </ol>
      </Card>

      <Card title="Dicas">
        <ul className="list-disc list-inside space-y-2">
          <li>
            O tipo de transação (Receita/Despesa) é determinado automaticamente
            pelo sinal do valor
          </li>
          <li>Valores negativos são importados como Despesas (DEBIT)</li>
          <li>Valores positivos são importados como Receitas (CREDIT)</li>
          <li>
            O sistema tentará extrair o nome do merchant da descrição quando
            possível
          </li>
          <li>
            Se não selecionar uma categoria, será usada uma categoria padrão
            baseada no tipo
          </li>
          <li>Arquivos grandes podem levar alguns minutos para processar</li>
        </ul>
      </Card>
    </div>
  );
};

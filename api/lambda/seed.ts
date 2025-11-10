const BACKEND_URL = 'http://localhost:8081/api';

function getAuthHeaders(headers?: Record<string, string>): HeadersInit {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (headers?.authorization || headers?.Authorization) {
    defaultHeaders.Authorization =
      headers.authorization || headers.Authorization;
  }
  return defaultHeaders;
}

export async function post({
  headers,
}: {
  headers?: Record<string, string>;
}): Promise<unknown> {
  const requestHeaders = getAuthHeaders(headers);

  // First, get account types to use for default accounts
  const accountTypesRes = await fetch(
    `${BACKEND_URL}/account-types?activeOnly=true`,
    {
      method: 'GET',
      headers: requestHeaders,
    },
  );

  if (!accountTypesRes.ok) {
    throw new Error(`Failed to fetch account types: ${accountTypesRes.status}`);
  }

  const accountTypesData = await accountTypesRes.json();
  const accountTypes = accountTypesData.data || [];

  // Default accounts to create
  const defaultAccounts = [
    {
      accountTypeId:
        accountTypes.find(
          (t: unknown) => (t as { typeCode?: string })?.typeCode === 'CHECKING',
        )?.id ||
        accountTypes[0]?.id ||
        1,
      accountName: 'Conta Corrente',
      currencyCode: 'BRL',
      currentBalance: 0,
      availableBalance: 0,
    },
    {
      accountTypeId:
        accountTypes.find(
          (t: unknown) => (t as { typeCode?: string })?.typeCode === 'SAVINGS',
        )?.id ||
        accountTypes[0]?.id ||
        1,
      accountName: 'Poupança',
      currencyCode: 'BRL',
      currentBalance: 0,
      availableBalance: 0,
    },
  ];

  // Default categories to create
  const defaultCategories = [
    // Income categories
    {
      categoryName: 'Salário',
      categoryType: 'INCOME',
      description: 'Salário mensal',
    },
    {
      categoryName: 'Freelance',
      categoryType: 'INCOME',
      description: 'Trabalhos freelancer',
    },
    {
      categoryName: 'Investimentos',
      categoryType: 'INCOME',
      description: 'Rendimentos de investimentos',
    },
    {
      categoryName: 'Outras Receitas',
      categoryType: 'INCOME',
      description: 'Outras fontes de receita',
    },

    // Expense categories
    {
      categoryName: 'Alimentação',
      categoryType: 'EXPENSE',
      description: 'Gastos com alimentação',
    },
    {
      categoryName: 'Transporte',
      categoryType: 'EXPENSE',
      description: 'Gastos com transporte',
    },
    {
      categoryName: 'Moradia',
      categoryType: 'EXPENSE',
      description: 'Aluguel, condomínio, etc',
    },
    {
      categoryName: 'Saúde',
      categoryType: 'EXPENSE',
      description: 'Gastos com saúde',
    },
    {
      categoryName: 'Educação',
      categoryType: 'EXPENSE',
      description: 'Gastos com educação',
    },
    {
      categoryName: 'Lazer',
      categoryType: 'EXPENSE',
      description: 'Gastos com lazer e entretenimento',
    },
    {
      categoryName: 'Compras',
      categoryType: 'EXPENSE',
      description: 'Compras diversas',
    },
    {
      categoryName: 'Contas',
      categoryType: 'EXPENSE',
      description: 'Contas de água, luz, internet, etc',
    },
  ];

  // Create accounts and categories in parallel
  const accountPromises = defaultAccounts.map(account =>
    fetch(`${BACKEND_URL}/accounts`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(account),
    }),
  );

  const categoryPromises = defaultCategories.map(category =>
    fetch(`${BACKEND_URL}/categories`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(category),
    }),
  );

  const allPromises = [...accountPromises, ...categoryPromises];
  const responses = await Promise.all(allPromises);

  // Check for errors
  const errors = responses.filter(r => !r.ok);
  if (errors.length > 0) {
    const errorMessages = await Promise.all(
      errors.map(async r => {
        try {
          const error = await r.json();
          return error.message || `HTTP ${r.status}`;
        } catch {
          return `HTTP ${r.status}`;
        }
      }),
    );
    throw new Error(`Some items failed to create: ${errorMessages.join(', ')}`);
  }

  // Parse successful responses
  const results = await Promise.all(responses.map(r => r.json()));

  const createdAccounts = results.slice(0, defaultAccounts.length);
  const createdCategories = results.slice(defaultAccounts.length);

  return {
    success: true,
    data: {
      accounts: createdAccounts.map(
        (r: unknown) => (r as { data?: unknown })?.data,
      ),
      categories: createdCategories.map(
        (r: unknown) => (r as { data?: unknown })?.data,
      ),
    },
    message: `Criadas ${createdAccounts.length} contas e ${createdCategories.length} categorias com sucesso!`,
  };
}

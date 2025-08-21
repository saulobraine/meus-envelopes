/**
 * Mocks para Supabase
 *
 * Este arquivo resolve problemas com dependências ESM do Supabase
 * que não são compatíveis com o ambiente de teste do Jest.
 */

// Mock do Supabase Client
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
    })),
  })),
  rpc: jest.fn(),
};

// Mock do Supabase Server
export const mockSupabaseServer = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
    })),
  })),
  rpc: jest.fn(),
};

// Mock das funções de criação de clientes
export const createBrowserClient = jest.fn(() => mockSupabaseClient);
export const createServerClient = jest.fn(() => mockSupabaseServer);

// Mock das funções de criação de clientes do Supabase
export const createClient = jest.fn(() => mockSupabaseClient);
export const createClientComponentClient = jest.fn(() => mockSupabaseClient);
export const createServerComponentClient = jest.fn(() => mockSupabaseServer);

// Mock das funções de autenticação do Supabase
export const createAuthHelpers = jest.fn(() => ({
  getUser: jest.fn(() =>
    Promise.resolve({ data: { user: mockAuth.user }, error: null })
  ),
  signOut: jest.fn(),
}));

// Mock das funções de UI do Supabase
export const Auth = jest.fn(() => "Auth Component");
export const ThemeSupa = jest.fn(() => ({}));

// Mock das funções de storage do Supabase
export const createStorageClient = jest.fn(() => mockStorage);

// Mock das funções de realtime do Supabase
export const createRealtimeClient = jest.fn(() => mockRealtime);

// Mock do Realtime
export const mockRealtime = {
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(),
    })),
    subscribe: jest.fn(),
  })),
  removeAllChannels: jest.fn(),
};

// Mock do Storage
export const mockStorage = {
  from: jest.fn(() => ({
    upload: jest.fn(),
    download: jest.fn(),
    remove: jest.fn(),
    list: jest.fn(),
  })),
};

// Configurar mocks globais
beforeEach(() => {
  jest.clearAllMocks();

  // Mock das funções de criação de clientes
  mockSupabaseClient.from.mockReturnValue({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
    })),
  });

  mockSupabaseServer.from.mockReturnValue({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
    })),
  });
});

// Mock das funções de autenticação
export const mockAuth = {
  user: { id: "test-user-123", email: "test@example.com" },
  isAuthenticated: true,
  loading: false,
  signOut: jest.fn(),
  getUser: jest.fn(() =>
    Promise.resolve({ data: { user: mockAuth.user }, error: null })
  ),
};

// Mock das funções de autenticação do Supabase
export const getAuthenticatedUser = jest.fn(() =>
  Promise.resolve({ user: mockAuth.user })
);
export const signOut = jest.fn(() => Promise.resolve({ error: null }));
export const signIn = jest.fn(() =>
  Promise.resolve({ data: { user: mockAuth.user }, error: null })
);
export const signUp = jest.fn(() =>
  Promise.resolve({ data: { user: mockAuth.user }, error: null })
);

// Mock das funções de hook de autenticação
export const useAuth = jest.fn(() => mockAuth);
export const useUser = jest.fn(() => mockAuth.user);
export const useSession = jest.fn(() => ({
  data: { session: { user: mockAuth.user } },
  loading: false,
}));

// Mock das funções de envelope
export const mockEnvelopeActions = {
  create: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock das funções de transação
export const mockTransactionActions = {
  create: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  removeAll: jest.fn(),
};

// Mock das funções de dashboard
export const mockDashboardActions = {
  getDashboardOverview: jest.fn(),
  getFinancialChartData: jest.fn(),
};

// Configurações de sucesso para envelope actions
export const setupEnvelopeActionsSuccess = () => {
  mockEnvelopeActions.create.mockResolvedValue({
    success: true,
    data: { id: "1", name: "Alimentação", value: 500, type: "MONETARY" },
  });
  mockEnvelopeActions.get.mockResolvedValue([
    { id: "1", name: "Alimentação", value: 500, type: "MONETARY" },
    { id: "2", name: "Transporte", value: 300, type: "MONETARY" },
  ]);
  mockEnvelopeActions.update.mockResolvedValue({
    success: true,
    data: {
      id: "1",
      name: "Alimentação Atualizada",
      value: 600,
      type: "MONETARY",
    },
  });
  mockEnvelopeActions.remove.mockResolvedValue({ success: true });
};

// Configurações de erro para envelope actions
export const setupEnvelopeActionsError = (errorMessage = "Erro de teste") => {
  mockEnvelopeActions.create.mockRejectedValue(new Error(errorMessage));
  mockEnvelopeActions.get.mockRejectedValue(new Error(errorMessage));
  mockEnvelopeActions.update.mockRejectedValue(new Error(errorMessage));
  mockEnvelopeActions.remove.mockRejectedValue(new Error(errorMessage));
};

// Configurações de sucesso para dashboard actions
export const setupDashboardActionsSuccess = () => {
  mockDashboardActions.getDashboardOverview.mockResolvedValue({
    totalBalance: 150000,
    monthlyIncome: 300000,
    monthlyExpenses: 150000,
    amountToReceive: 50000,
    generalBalance: 200000,
    incomeChange: { value: 10, isPositive: true, stringValue: "+10%" },
    expensesChange: { value: 5, isPositive: false, stringValue: "-5%" },
    balanceChange: { value: 15, isPositive: true, stringValue: "+15%" },
  });

  mockDashboardActions.getFinancialChartData.mockResolvedValue([
    { month: "Jan", income: 300000, expenses: 150000 },
    { month: "Feb", income: 320000, expenses: 160000 },
  ]);
};

// Configurações de erro para dashboard actions
export const setupDashboardActionsError = (
  errorMessage = "Erro ao carregar dados"
) => {
  mockDashboardActions.getDashboardOverview.mockRejectedValue(
    new Error(errorMessage)
  );
  mockDashboardActions.getFinancialChartData.mockRejectedValue(
    new Error(errorMessage)
  );
};

// Configurações de sucesso para transaction actions
export const setupTransactionActionsSuccess = () => {
  mockTransactionActions.create.mockResolvedValue({
    success: true,
    data: { id: "1", amount: 100, type: "EXPENSE", description: "Teste" },
  });
  mockTransactionActions.get.mockResolvedValue([
    { id: "1", amount: 100, type: "EXPENSE", description: "Teste" },
    { id: "2", amount: 200, type: "INCOME", description: "Salário" },
  ]);
  mockTransactionActions.update.mockResolvedValue({
    success: true,
    data: {
      id: "1",
      amount: 150,
      type: "EXPENSE",
      description: "Teste Atualizado",
    },
  });
  mockTransactionActions.remove.mockResolvedValue({ success: true });
  mockTransactionActions.removeAll.mockResolvedValue({ success: true });
};

// Configurações de erro para transaction actions
export const setupTransactionActionsError = (
  errorMessage = "Erro ao processar transação"
) => {
  mockTransactionActions.create.mockRejectedValue(new Error(errorMessage));
  mockTransactionActions.get.mockRejectedValue(new Error(errorMessage));
  mockTransactionActions.update.mockRejectedValue(new Error(errorMessage));
  mockTransactionActions.remove.mockRejectedValue(new Error(errorMessage));
  mockTransactionActions.removeAll.mockRejectedValue(new Error(errorMessage));
};

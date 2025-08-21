/**
 * Mocks para Server Actions
 * 
 * Este arquivo contém mocks para todas as server actions usadas nos componentes React.
 */

import { jest } from '@jest/globals';

// Mock das actions de envelope
export const mockEnvelopeActions = {
  create: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

jest.mock('@/app/_actions/envelope', () => ({
  create: mockEnvelopeActions.create,
  get: mockEnvelopeActions.get,
  update: mockEnvelopeActions.update,
  remove: mockEnvelopeActions.remove,
}));

// Mock das actions de dashboard
export const mockDashboardActions = {
  getDashboardOverview: jest.fn(),
  getFinancialChartData: jest.fn(),
};

jest.mock('@/app/_actions/dashboard/getDashboardOverview', () => ({
  getDashboardOverview: mockDashboardActions.getDashboardOverview,
}));

jest.mock('@/app/_actions/dashboard/getFinancialChartData', () => ({
  getFinancialChartData: mockDashboardActions.getFinancialChartData,
}));

// Mock das actions de transações
export const mockTransactionActions = {
  create: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  removeAll: jest.fn(),
};

jest.mock('@/app/_actions/transactions', () => ({
  create: mockTransactionActions.create,
  get: mockTransactionActions.get,
  update: mockTransactionActions.update,
  remove: mockTransactionActions.remove,
  removeAll: mockTransactionActions.removeAll,
}));

// Configurações de sucesso para envelope actions
export const setupEnvelopeActionsSuccess = () => {
  mockEnvelopeActions.create.mockResolvedValue(undefined);
  mockEnvelopeActions.get.mockResolvedValue([
    { id: '1', name: 'Alimentação', value: 500, type: 'MONETARY' },
    { id: '2', name: 'Transporte', value: 300, type: 'MONETARY' },
  ]);
  mockEnvelopeActions.update.mockResolvedValue(undefined);
  mockEnvelopeActions.remove.mockResolvedValue(undefined);
};

// Configurações de erro para envelope actions
export const setupEnvelopeActionsError = (errorMessage = 'Erro de teste') => {
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
    incomeChange: { value: 10, isPositive: true, stringValue: '+10%' },
    expensesChange: { value: 5, isPositive: false, stringValue: '-5%' },
    balanceChange: { value: 15, isPositive: true, stringValue: '+15%' },
  });
  
  mockDashboardActions.getFinancialChartData.mockResolvedValue([
    { month: 'Jan', income: 300000, expenses: 150000 },
    { month: 'Feb', income: 320000, expenses: 160000 },
  ]);
};

// Configurações de erro para dashboard actions
export const setupDashboardActionsError = (errorMessage = 'Erro ao carregar dados') => {
  mockDashboardActions.getDashboardOverview.mockRejectedValue(new Error(errorMessage));
  mockDashboardActions.getFinancialChartData.mockRejectedValue(new Error(errorMessage));
};

// Configurações de sucesso para transaction actions
export const setupTransactionActionsSuccess = () => {
  mockTransactionActions.create.mockResolvedValue(undefined);
  mockTransactionActions.get.mockResolvedValue([
    { id: '1', description: 'Compra no mercado', amount: 15000, type: 'EXPENSE' },
    { id: '2', description: 'Salário', amount: 300000, type: 'INCOME' },
  ]);
  mockTransactionActions.update.mockResolvedValue(undefined);
  mockTransactionActions.remove.mockResolvedValue(undefined);
  mockTransactionActions.removeAll.mockResolvedValue(undefined);
};

// Configurações de erro para transaction actions
export const setupTransactionActionsError = (errorMessage = 'Erro de transação') => {
  mockTransactionActions.create.mockRejectedValue(new Error(errorMessage));
  mockTransactionActions.get.mockRejectedValue(new Error(errorMessage));
  mockTransactionActions.update.mockRejectedValue(new Error(errorMessage));
  mockTransactionActions.remove.mockRejectedValue(new Error(errorMessage));
  mockTransactionActions.removeAll.mockRejectedValue(new Error(errorMessage));
};

// Função para limpar todos os mocks
export const clearAllActionMocks = () => {
  Object.values(mockEnvelopeActions).forEach(mock => (mock as jest.Mock).mockClear());
  Object.values(mockDashboardActions).forEach(mock => (mock as jest.Mock).mockClear());
  Object.values(mockTransactionActions).forEach(mock => (mock as jest.Mock).mockClear());
};

// Função para resetar todos os mocks
export const resetAllActionMocks = () => {
  Object.values(mockEnvelopeActions).forEach(mock => (mock as jest.Mock).mockReset());
  Object.values(mockDashboardActions).forEach(mock => (mock as jest.Mock).mockReset());
  Object.values(mockTransactionActions).forEach(mock => (mock as jest.Mock).mockReset());
};

// Configuração padrão para testes (sucesso)
export const setupDefaultActionMocks = () => {
  setupEnvelopeActionsSuccess();
  setupDashboardActionsSuccess();
  setupTransactionActionsSuccess();
};

// Configuração de cenários específicos
export const setupActionScenario = (scenario: 'success' | 'error' | 'mixed') => {
  clearAllActionMocks();
  
  switch (scenario) {
    case 'success':
      setupDefaultActionMocks();
      break;
    case 'error':
      setupEnvelopeActionsError();
      setupDashboardActionsError();
      setupTransactionActionsError();
      break;
    case 'mixed':
      // Envelope actions com sucesso, dashboard com erro
      setupEnvelopeActionsSuccess();
      setupDashboardActionsError();
      setupTransactionActionsSuccess();
      break;
    default:
      setupDefaultActionMocks();
  }
};

export default {
  mockEnvelopeActions,
  mockDashboardActions,
  mockTransactionActions,
  setupEnvelopeActionsSuccess,
  setupEnvelopeActionsError,
  setupDashboardActionsSuccess,
  setupDashboardActionsError,
  setupTransactionActionsSuccess,
  setupTransactionActionsError,
  clearAllActionMocks,
  resetAllActionMocks,
  setupDefaultActionMocks,
  setupActionScenario,
};

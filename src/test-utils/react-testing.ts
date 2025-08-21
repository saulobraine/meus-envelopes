/**
 * Utilitários Compartilhados para Testes de Componentes React
 * 
 * Este arquivo contém utilitários e configurações para testes de componentes React
 * usando React Testing Library e Jest.
 */

import { render, screen, fireEvent, waitFor, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';
import { jest } from '@jest/globals';

// Mock do useRouter do Next.js
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock do useToast
export const mockToast = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock do useAuth
export const mockAuth = {
  user: { id: 'test-user-123', email: 'test@example.com' },
  isAuthenticated: true,
  loading: false,
  signOut: jest.fn(),
};

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockAuth,
}));

// Wrapper para testes com providers
interface AllTheProvidersProps {
  children: ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <div>
      {children}
    </div>
  );
};

// Função de render customizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-exportar everything
export * from '@testing-library/react';
export { customRender as render, userEvent };

// Utilitários para interações comuns
export const TestUtils = {
  // Preencher formulário
  async fillForm(fields: Record<string, string>) {
    const user = userEvent.setup();
    
    for (const [name, value] of Object.entries(fields)) {
      const field = screen.getByLabelText(new RegExp(name, 'i'));
      await user.clear(field);
      await user.type(field, value);
    }
  },

  // Selecionar opção em select
  async selectOption(labelText: string, optionText: string) {
    const user = userEvent.setup();
    const select = screen.getByLabelText(new RegExp(labelText, 'i'));
    await user.click(select);
    const option = screen.getByText(optionText);
    await user.click(option);
  },

  // Clicar em botão
  async clickButton(buttonText: string) {
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
    await user.click(button);
  },

  // Submeter formulário
  async submitForm(formName?: string) {
    const user = userEvent.setup();
    const form = formName 
      ? screen.getByRole('form', { name: new RegExp(formName, 'i') })
      : screen.getByRole('form');
    
    const submitButton = form.querySelector('button[type="submit"]') || 
                        screen.getByRole('button', { name: /submit|enviar|adicionar|salvar/i });
    
    if (submitButton) {
      await user.click(submitButton);
    } else {
      fireEvent.submit(form);
    }
  },

  // Aguardar loading desaparecer
  async waitForLoadingToFinish() {
    await waitFor(() => {
      expect(screen.queryByText(/carregando|loading/i)).not.toBeInTheDocument();
    });
  },

  // Aguardar elemento aparecer
  async waitForElement(text: string | RegExp) {
    return await screen.findByText(text);
  },

  // Verificar toast de sucesso
  expectSuccessToast(message?: string) {
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringMatching(/sucesso|adicionado|criado/i),
        description: message ? expect.stringContaining(message) : expect.any(String),
      })
    );
  },

  // Verificar toast de erro
  expectErrorToast(message?: string) {
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringMatching(/erro|falha/i),
        description: message ? expect.stringContaining(message) : expect.any(String),
        variant: 'destructive',
      })
    );
  },

  // Verificar redirecionamento
  expectNavigation(path: string) {
    expect(mockRouter.push).toHaveBeenCalledWith(path);
  },
};

// Configurações para diferentes cenários de teste
export const TestScenarios = {
  // Usuário autenticado
  authenticatedUser() {
    mockAuth.isAuthenticated = true;
    mockAuth.loading = false;
    mockAuth.user = { id: 'test-user-123', email: 'test@example.com' };
  },

  // Usuário não autenticado
  unauthenticatedUser() {
    mockAuth.isAuthenticated = false;
    mockAuth.loading = false;
    mockAuth.user = null;
  },

  // Loading de autenticação
  authLoading() {
    mockAuth.isAuthenticated = false;
    mockAuth.loading = true;
    mockAuth.user = null;
  },

  // Limpar mocks
  clearMocks() {
    jest.clearAllMocks();
    mockToast.mockClear();
    Object.values(mockRouter).forEach(mock => (mock as jest.Mock).mockClear());
  },

  // Reset para estado padrão
  resetToDefaults() {
    this.clearMocks();
    this.authenticatedUser();
  },
};

// Matchers customizados para jest
export const customMatchers = {
  toHaveFormField(element: HTMLElement, fieldName: string) {
    const field = element.querySelector(`[name="${fieldName}"]`);
    return {
      pass: !!field,
      message: () => `Expected form to have field with name "${fieldName}"`,
    };
  },

  toBeLoadingState(element: HTMLElement) {
    const isLoading = element.textContent?.includes('carregando') || 
                     element.textContent?.includes('Loading') ||
                     element.querySelector('[data-testid="loading"]');
    return {
      pass: !!isLoading,
      message: () => 'Expected element to be in loading state',
    };
  },
};

// Dados de teste padrão
export const TestData = {
  envelope: {
    valid: {
      name: 'Teste Envelope',
      value: '1000',
      type: 'MONETARY',
    },
    percentage: {
      name: 'Investimentos',
      value: '25',
      type: 'PERCENTAGE',
    },
    invalid: {
      emptyName: {
        name: '',
        value: '1000',
        type: 'MONETARY',
      },
      invalidValue: {
        name: 'Teste',
        value: 'abc',
        type: 'MONETARY',
      },
      noType: {
        name: 'Teste',
        value: '1000',
        type: '',
      },
    },
  },
  
  user: {
    authenticated: {
      id: 'test-user-123',
      email: 'test@example.com',
    },
    admin: {
      id: 'admin-456',
      email: 'admin@example.com',
    },
  },

  dashboard: {
    overview: {
      totalBalance: 150000, // R$ 1.500,00 em centavos
      monthlyIncome: 300000, // R$ 3.000,00
      monthlyExpenses: 150000, // R$ 1.500,00
      amountToReceive: 50000, // R$ 500,00
      generalBalance: 200000, // R$ 2.000,00
      incomeChange: {
        value: 10,
        isPositive: true,
        stringValue: '+10%',
      },
      expensesChange: {
        value: 5,
        isPositive: false,
        stringValue: '-5%',
      },
      balanceChange: {
        value: 15,
        isPositive: true,
        stringValue: '+15%',
      },
    },
  },
};

export default {
  render: customRender,
  TestUtils,
  TestScenarios,
  TestData,
  userEvent,
  mockToast,
  mockRouter,
  mockAuth,
};

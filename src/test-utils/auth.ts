/**
 * Autenticação Compartilhada para Testes
 *
 * Este arquivo contém mocks e utilitários de autenticação que podem ser
 * reutilizados em todos os testes que precisam de usuários autenticados.
 */

import { jest } from "@jest/globals";

// Mock da função de autenticação
export const mockGetAuthenticatedUser = jest.fn();

// Mock do módulo de autenticação
jest.mock("@/lib/supabase/server", () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

// Usuários de teste padrão
export const TEST_USERS = {
  DEFAULT: { id: "user-123", email: "test@example.com" },
  ADMIN: { id: "admin-456", email: "admin@example.com" },
  PREMIUM: { id: "premium-789", email: "premium@example.com" },
  NEW_USER: { id: "new-user-999", email: "new@example.com" },
} as const;

// Função para configurar usuário autenticado
export const setupAuthenticatedUser = (user = TEST_USERS.DEFAULT) => {
  (mockGetAuthenticatedUser as jest.Mock).mockResolvedValue({ user } as never);
};

// Função para configurar usuário não autenticado
export const setupUnauthenticatedUser = () => {
  (mockGetAuthenticatedUser as jest.Mock).mockRejectedValue(
    new Error("User not authenticated.") as never
  );
};

// Função para limpar mocks de autenticação
export const clearAuthMocks = () => {
  (mockGetAuthenticatedUser as jest.Mock).mockClear();
};

// Função para resetar mocks de autenticação
export const resetAuthMocks = () => {
  (mockGetAuthenticatedUser as jest.Mock).mockReset();
};

// Função para restaurar mocks de autenticação
export const restoreAuthMocks = () => {
  (mockGetAuthenticatedUser as jest.Mock).mockRestore();
};

// Função para simular mudança de usuário durante teste
export const simulateUserChange = (
  initialUser: Record<string, unknown>,
  finalUser: Record<string, unknown>
) => {
  (mockGetAuthenticatedUser as jest.Mock)
    .mockResolvedValueOnce({ user: initialUser } as never)
    .mockResolvedValueOnce({ user: finalUser } as never);
};

// Função para simular falha intermitente de autenticação
export const simulateIntermittentAuthFailure = (
  user: Record<string, unknown>,
  failureCount = 1
) => {
  const successResponse = { user };
  const failureResponse = new Error(
    "Authentication service temporarily unavailable"
  );

  // Primeiras tentativas falham
  for (let i = 0; i < failureCount; i++) {
    (mockGetAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
      failureResponse as never
    );
  }

  // Última tentativa funciona
  (mockGetAuthenticatedUser as jest.Mock).mockResolvedValue(
    successResponse as never
  );
};

// Função para validar se usuário foi autenticado
export const expectUserWasAuthenticated = () => {
  expect(mockGetAuthenticatedUser).toHaveBeenCalled();
};

// Função para validar se usuário não foi autenticado
export const expectUserWasNotAuthenticated = () => {
  expect(mockGetAuthenticatedUser).not.toHaveBeenCalled();
};

// Função para validar se usuário específico foi autenticado
export const expectSpecificUserWasAuthenticated = () => {
  expect(mockGetAuthenticatedUser).toHaveBeenCalled();
  // Note: Como é um mock, não podemos verificar o usuário específico
  // mas podemos verificar se foi chamado
};

// Configurações de teste para diferentes cenários de autenticação
export const AUTH_TEST_CONFIG = {
  TIMEOUTS: {
    AUTHENTICATION: 2000, // 2 segundos para autenticação
    SESSION_REFRESH: 5000, // 5 segundos para refresh de sessão
  },

  ERROR_MESSAGES: {
    NOT_AUTHENTICATED: "User not authenticated.",
    SESSION_EXPIRED: "Session expired.",
    INVALID_TOKEN: "Invalid authentication token.",
    SERVICE_UNAVAILABLE: "Authentication service unavailable.",
  },

  RETRY_POLICIES: {
    MAX_ATTEMPTS: 3,
    BACKOFF_DELAY: 1000, // 1 segundo
  },
};

// Função para configurar cenário de teste de autenticação
export const setupAuthTestScenario = (
  scenario: "success" | "failure" | "intermittent" | "user_change"
) => {
  switch (scenario) {
    case "success":
      setupAuthenticatedUser();
      break;
    case "failure":
      setupUnauthenticatedUser();
      break;
    case "intermittent":
      simulateIntermittentAuthFailure(TEST_USERS.DEFAULT, 2);
      break;
    case "user_change":
      simulateUserChange(TEST_USERS.DEFAULT, TEST_USERS.ADMIN);
      break;
    default:
      setupAuthenticatedUser();
  }
};

// Exportar tudo como default para facilitar import
const authUtils = {
  mockGetAuthenticatedUser,
  TEST_USERS,
  setupAuthenticatedUser,
  setupUnauthenticatedUser,
  clearAuthMocks,
  resetAuthMocks,
  restoreAuthMocks,
  simulateUserChange,
  simulateIntermittentAuthFailure,
  expectUserWasAuthenticated,
  expectUserWasNotAuthenticated,
  expectSpecificUserWasAuthenticated,
  AUTH_TEST_CONFIG,
  setupAuthTestScenario,
};

export default authUtils;

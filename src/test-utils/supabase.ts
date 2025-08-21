/**
 * Mock do Supabase para Testes
 * 
 * Este arquivo contém mocks específicos para o Supabase
 * para evitar problemas com ES modules no Jest.
 */

import { jest } from '@jest/globals';

// Mock do módulo @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@example.com' } },
        error: null,
      }),
    },
  })),
}));

// Mock do módulo next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
    get: jest.fn(),
  })),
}));

// Mock da função getAuthenticatedUser
export const mockGetAuthenticatedUser = jest.fn();

// Mock do módulo de autenticação do Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@example.com' } },
        error: null,
      }),
    },
  })),
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

// Função para configurar usuário autenticado
export const setupSupabaseAuthenticatedUser = (user = { id: 'test-user-123', email: 'test@example.com' }) => {
  mockGetAuthenticatedUser.mockResolvedValue({ user });
};

// Função para configurar usuário não autenticado
export const setupSupabaseUnauthenticatedUser = () => {
  mockGetAuthenticatedUser.mockRejectedValue(new Error('User not authenticated.'));
};

// Função para limpar mocks do Supabase
export const clearSupabaseMocks = () => {
  mockGetAuthenticatedUser.mockClear();
};

// Função para resetar mocks do Supabase
export const resetSupabaseMocks = () => {
  mockGetAuthenticatedUser.mockReset();
};

// Função para restaurar mocks do Supabase
export const restoreSupabaseMocks = () => {
  mockGetAuthenticatedUser.mockRestore();
};

// Exportar tudo como default
export default {
  mockGetAuthenticatedUser,
  setupSupabaseAuthenticatedUser,
  setupSupabaseUnauthenticatedUser,
  clearSupabaseMocks,
  resetSupabaseMocks,
  restoreSupabaseMocks,
};

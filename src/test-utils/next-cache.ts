/**
 * Mocks Compartilhados para Next.js Cache
 * 
 * Este arquivo contém mocks e utilitários para o sistema de cache do Next.js
 * que podem ser reutilizados em todos os testes que precisam revalidar cache.
 */

import { jest } from '@jest/globals';

// Mock da função revalidatePath
export const mockRevalidatePath = jest.fn().mockImplementation((path: any) => {
  // Simula revalidação bem-sucedida sem contexto do Next.js
  // Retorna undefined para simular comportamento real
  return undefined;
});

// Mock do módulo next/cache
jest.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

// Função para limpar mocks de cache
export const clearCacheMocks = () => {
  mockRevalidatePath.mockClear();
};

// Função para resetar mocks de cache
export const resetCacheMocks = () => {
  mockRevalidatePath.mockReset();
};

// Função para restaurar mocks de cache
export const restoreCacheMocks = () => {
  mockRevalidatePath.mockRestore();
};

// Função para configurar mock de sucesso para revalidação
export const setupCacheSuccess = () => {
  mockRevalidatePath.mockImplementation(() => {
    // Simula revalidação bem-sucedida
    return Promise.resolve();
  });
};

// Função para configurar mock de falha para revalidação
export const setupCacheFailure = (error: Error | string = 'Cache revalidation failed') => {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  mockRevalidatePath.mockImplementation(() => {
    throw errorObj;
  });
};

// Função para configurar mock de falha intermitente para revalidação
export const setupCacheIntermittentFailure = (failureCount: number = 1) => {
  let callCount = 0;
  mockRevalidatePath.mockImplementation(() => {
    callCount++;
    if (callCount <= failureCount) {
      throw new Error('Cache revalidation temporarily failed');
    }
    return Promise.resolve();
  });
};

// Função para validar se cache foi revalidado
export const expectCacheWasRevalidated = () => {
  expect(mockRevalidatePath).toHaveBeenCalled();
};

// Função para validar se cache não foi revalidado
export const expectCacheWasNotRevalidated = () => {
  expect(mockRevalidatePath).not.toHaveBeenCalled();
};

// Função para validar se cache foi revalidado com caminho específico
export const expectCacheWasRevalidatedWithPath = (expectedPath: string) => {
  expect(mockRevalidatePath).toHaveBeenCalledWith(expectedPath);
};

// Função para validar se cache foi revalidado N vezes
export const expectCacheWasRevalidatedTimes = (expectedTimes: number) => {
  expect(mockRevalidatePath).toHaveBeenCalledTimes(expectedTimes);
};

// Função para validar se cache foi revalidado com argumentos específicos
export const expectCacheWasRevalidatedWithArgs = (expectedArgs: any) => {
  expect(mockRevalidatePath).toHaveBeenCalledWith(expectedArgs);
};

// Função para validar se cache foi revalidado com qualquer argumento
export const expectCacheWasRevalidatedWithAnyArgs = () => {
  expect(mockRevalidatePath).toHaveBeenCalledWith(expect.anything());
};

// Configurações de teste para diferentes cenários de cache
export const CACHE_TEST_CONFIG = {
  TIMEOUTS: {
    REVALIDATION: 1000,    // 1 segundo para revalidação
    BACKGROUND: 5000,       // 5 segundos para revalidação em background
  },
  
  ERROR_MESSAGES: {
    REVALIDATION_FAILED: 'Cache revalidation failed',
    TIMEOUT: 'Cache revalidation timeout',
    PERMISSION_DENIED: 'Permission denied to revalidate cache',
    INVALID_PATH: 'Invalid path for cache revalidation',
  },
  
  PATHS: {
    DASHBOARD: '/dashboard',
    ENVELOPES: '/envelopes',
    TRANSACTIONS: '/transactions',
    SETTINGS: '/configuracoes',
    PLANNING: '/planejamento',
  },
  
  RETRY_POLICIES: {
    MAX_ATTEMPTS: 3,
    BACKOFF_DELAY: 1000, // 1 segundo
  },
};

// Função para configurar cenário de teste de cache
export const setupCacheTestScenario = (
  scenario: 'success' | 'failure' | 'intermittent' | 'timeout' | 'permission_denied'
) => {
  switch (scenario) {
    case 'success':
      setupCacheSuccess();
      break;
    case 'failure':
      setupCacheFailure();
      break;
    case 'intermittent':
      setupCacheIntermittentFailure(2);
      break;
    case 'timeout':
      setupCacheFailure(new Error('Cache revalidation timeout'));
      break;
    case 'permission_denied':
      setupCacheFailure(new Error('Permission denied to revalidate cache'));
      break;
    default:
      setupCacheSuccess();
  }
};

// Função para simular revalidação de múltiplos caminhos
export const simulateMultiplePathRevalidation = (paths: string[]) => {
  paths.forEach(path => {
    mockRevalidatePath(path);
  });
};

// Função para validar se múltiplos caminhos foram revalidados
export const expectMultiplePathsWereRevalidated = (expectedPaths: string[]) => {
  expectedPaths.forEach(path => {
    expect(mockRevalidatePath).toHaveBeenCalledWith(path);
  });
  expect(mockRevalidatePath).toHaveBeenCalledTimes(expectedPaths.length);
};

// Função para validar se cache foi revalidado em ordem específica
export const expectCacheWasRevalidatedInOrder = (expectedPaths: string[]) => {
  const calls = mockRevalidatePath.mock.calls;
  expect(calls.length).toBe(expectedPaths.length);
  
  expectedPaths.forEach((path, index) => {
    expect(calls[index][0]).toBe(path);
  });
};

// Função para validar se cache foi revalidado pelo menos uma vez
export const expectCacheWasRevalidatedAtLeastOnce = () => {
  expect(mockRevalidatePath).toHaveBeenCalled();
};

// Função para validar se cache foi revalidado no máximo N vezes
export const expectCacheWasRevalidatedAtMostTimes = (maxTimes: number) => {
  expect(mockRevalidatePath).toHaveBeenCalledTimes(expect.any(Number));
  const actualTimes = mockRevalidatePath.mock.calls.length;
  expect(actualTimes).toBeLessThanOrEqual(maxTimes);
};

// Exportar tudo como default para facilitar import
export default {
  mockRevalidatePath,
  clearCacheMocks,
  resetCacheMocks,
  restoreCacheMocks,
  setupCacheSuccess,
  setupCacheFailure,
  setupCacheIntermittentFailure,
  expectCacheWasRevalidated,
  expectCacheWasNotRevalidated,
  expectCacheWasRevalidatedWithPath,
  expectCacheWasRevalidatedTimes,
  expectCacheWasRevalidatedWithArgs,
  expectCacheWasRevalidatedWithAnyArgs,
  CACHE_TEST_CONFIG,
  setupCacheTestScenario,
  simulateMultiplePathRevalidation,
  expectMultiplePathsWereRevalidated,
  expectCacheWasRevalidatedInOrder,
  expectCacheWasRevalidatedAtLeastOnce,
  expectCacheWasRevalidatedAtMostTimes,
};

/**
 * Mocks Compartilhados para Prisma
 * 
 * Este arquivo contém mocks e utilitários do Prisma que podem ser
 * reutilizados em todos os testes que precisam interagir com o banco de dados.
 */

import { jest } from '@jest/globals';

// Mock do cliente Prisma
export const mockPrismaClient = {
  envelope: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transaction: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Adicionar outros modelos conforme necessário
};

// Mock do módulo Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}));

// Função para limpar todos os mocks do Prisma
export const clearPrismaMocks = () => {
  Object.values(mockPrismaClient).forEach(model => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach(method => {
        if (typeof method === 'function' && 'mockClear' in method) {
          (method as any).mockClear();
        }
      });
    }
  });
};

// Função para resetar todos os mocks do Prisma
export const resetPrismaMocks = () => {
  Object.values(mockPrismaClient).forEach(model => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach(method => {
        if (typeof method === 'function' && 'mockReset' in method) {
          (method as any).mockReset();
        }
      });
    }
  });
};

// Função para restaurar todos os mocks do Prisma
export const restorePrismaMocks = () => {
  Object.values(mockPrismaClient).forEach(model => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach(method => {
        if (typeof method === 'function' && 'mockRestore' in method) {
          (method as any).mockRestore();
        }
      });
    }
  });
};

// Função para configurar mock de sucesso para operação específica
export const setupPrismaSuccess = (model: string, operation: string, returnValue: any = {}) => {
  const mockMethod = (mockPrismaClient as any)[model]?.[operation];
  if (mockMethod) {
    mockMethod.mockResolvedValue(returnValue);
  }
};

// Função para configurar mock de falha para operação específica
export const setupPrismaFailure = (model: string, operation: string, error: Error | string) => {
  const mockMethod = (mockPrismaClient as any)[model]?.[operation];
  if (mockMethod) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    mockMethod.mockRejectedValue(errorObj);
  }
};

// Função para configurar mock de retorno nulo para operação específica
export const setupPrismaNull = (model: string, operation: string) => {
  const mockMethod = (mockPrismaClient as any)[model]?.[operation];
  if (mockMethod) {
    mockMethod.mockResolvedValue(null);
  }
};

// Função para validar se operação foi chamada
export const expectPrismaOperationWasCalled = (model: string, operation: string) => {
  const mockMethod = (mockPrismaClient as any)[model]?.[operation];
  expect(mockMethod).toHaveBeenCalled();
};

// Função para validar se operação não foi chamada
export const expectPrismaOperationWasNotCalled = (model: string, operation: string) => {
  const mockMethod = (mockPrismaClient as any)[model]?.[operation];
  expect(mockMethod).not.toHaveBeenCalled();
};

// Função para validar se operação foi chamada com parâmetros específicos
export const expectPrismaOperationWasCalledWith = (model: string, operation: string, expectedArgs: any) => {
  const mockMethod = (mockPrismaClient as any)[model]?.[operation];
  expect(mockMethod).toHaveBeenCalledWith(expectedArgs);
};

// Função para validar se operação foi chamada N vezes
export const expectPrismaOperationWasCalledTimes = (model: string, operation: string, expectedTimes: number) => {
  const mockMethod = (mockPrismaClient as any)[model]?.[operation];
  expect(mockMethod).toHaveBeenCalledTimes(expectedTimes);
};

// Configurações de teste para diferentes cenários de banco
export const PRISMA_TEST_CONFIG = {
  TIMEOUTS: {
    QUERY: 1000,      // 1 segundo para queries
    TRANSACTION: 5000, // 5 segundos para transações
    MIGRATION: 30000,  // 30 segundos para migrações
  },
  
  ERROR_MESSAGES: {
    CONNECTION_FAILED: 'Database connection failed',
    QUERY_TIMEOUT: 'Query timeout',
    CONSTRAINT_VIOLATION: 'Constraint violation',
    RECORD_NOT_FOUND: 'Record not found',
    DUPLICATE_ENTRY: 'Duplicate entry',
    FOREIGN_KEY_VIOLATION: 'Foreign key violation',
  },
  
  RETRY_POLICIES: {
    MAX_ATTEMPTS: 3,
    BACKOFF_DELAY: 1000, // 1 segundo
  },
};

// Função para configurar cenário de teste do Prisma
export const setupPrismaTestScenario = (
  scenario: 'success' | 'failure' | 'timeout' | 'constraint_violation' | 'record_not_found'
) => {
  switch (scenario) {
    case 'success':
      // Todos os mocks retornam sucesso por padrão
      break;
    case 'failure':
      setupPrismaFailure('envelope', 'create', new Error('Database connection failed'));
      break;
    case 'timeout':
      setupPrismaFailure('envelope', 'findFirst', new Error('Query timeout'));
      break;
    case 'constraint_violation':
      setupPrismaFailure('envelope', 'create', new Error('Constraint violation'));
      break;
    case 'record_not_found':
      setupPrismaNull('envelope', 'findFirst');
      break;
    default:
      // Cenário padrão: sucesso
      break;
  }
};

// Função para simular falha intermitente do banco
export const simulateIntermittentPrismaFailure = (
  model: string, 
  operation: string, 
  failureCount: number = 1,
  successValue: any = {}
) => {
  const mockMethod = (mockPrismaClient as any)[model]?.[operation];
  if (mockMethod) {
    // Primeiras tentativas falham
    for (let i = 0; i < failureCount; i++) {
      mockMethod.mockRejectedValueOnce(new Error('Database temporarily unavailable'));
    }
    // Última tentativa funciona
    mockMethod.mockResolvedValue(successValue);
  }
};

// Exportar tudo como default para facilitar import
export default {
  mockPrismaClient,
  clearPrismaMocks,
  resetPrismaMocks,
  restorePrismaMocks,
  setupPrismaSuccess,
  setupPrismaFailure,
  setupPrismaNull,
  expectPrismaOperationWasCalled,
  expectPrismaOperationWasNotCalled,
  expectPrismaOperationWasCalledWith,
  expectPrismaOperationWasCalledTimes,
  PRISMA_TEST_CONFIG,
  setupPrismaTestScenario,
  simulateIntermittentPrismaFailure,
};

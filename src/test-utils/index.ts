/**
 * Mocks Compartilhados para Testes
 *
 * Este arquivo exporta todos os mocks e utilitários compartilhados
 * que podem ser reutilizados em diferentes suites de teste.
 */

// Imports removidos pois não são re-exportados neste arquivo

// Mocks de autenticação
export * from "./auth";

// Mocks do Prisma
export * from "./prisma";

// Mocks do Next.js cache
export * from "./next-cache";

// Re-exportar tudo como default para facilitar import
export { default as auth } from "./auth";
export { default as prisma } from "./prisma";
export { default as cache } from "./next-cache";

// Função para limpar todos os mocks compartilhados
import { clearAuthMocks } from "./auth";
import { clearPrismaMocks } from "./prisma";
import { clearCacheMocks } from "./next-cache";
export const clearAllSharedMocks = () => {
  clearAuthMocks();
  clearPrismaMocks();
  clearCacheMocks();
};

// Função para resetar todos os mocks compartilhados
import { resetAuthMocks } from "./auth";
import { resetPrismaMocks } from "./prisma";
import { resetCacheMocks } from "./next-cache";
export const resetAllSharedMocks = () => {
  resetAuthMocks();
  resetPrismaMocks();
  resetCacheMocks();
};

// Função para restaurar todos os mocks compartilhados
import { restoreAuthMocks } from "./auth";
import { restorePrismaMocks } from "./prisma";
import { restoreCacheMocks } from "./next-cache";
export const restoreAllSharedMocks = () => {
  restoreAuthMocks();
  restorePrismaMocks();
  restoreCacheMocks();
};

// Função para configurar cenário de teste padrão
import { setupAuthenticatedUser } from "./auth";
import { setupPrismaSuccess } from "./prisma";
import { setupCacheSuccess } from "./next-cache";
export const setupDefaultTestScenario = () => {
  setupAuthenticatedUser();
  setupPrismaSuccess("envelope", "findFirst", undefined);
  setupPrismaSuccess("envelope", "create", {});
  setupCacheSuccess();
};

// Função para configurar cenário de teste de falha
import { setupUnauthenticatedUser } from "./auth";
import { setupPrismaFailure } from "./prisma";
import { setupCacheFailure } from "./next-cache";
export const setupFailureTestScenario = () => {
  setupUnauthenticatedUser();
  setupPrismaFailure("envelope", "findFirst", "Database connection failed");
  setupCacheFailure("Cache revalidation failed");
};

// Função para configurar cenário de teste de falha intermitente
import { simulateIntermittentAuthFailure } from "./auth";
import { simulateIntermittentPrismaFailure } from "./prisma";
import { setupCacheIntermittentFailure } from "./next-cache";
export const setupIntermittentFailureTestScenario = () => {
  simulateIntermittentAuthFailure({ id: "user-123" }, 2);
  simulateIntermittentPrismaFailure("envelope", "findFirst", 2);
  setupCacheIntermittentFailure(2);
};

// Configurações globais de teste
export const GLOBAL_TEST_CONFIG = {
  TIMEOUTS: {
    UNIT: 5000, // 5 segundos para testes unitários
    INTEGRATION: 10000, // 10 segundos para testes de integração
    E2E: 30000, // 30 segundos para testes end-to-end
  },

  RETRY_POLICIES: {
    MAX_ATTEMPTS: 3,
    BACKOFF_DELAY: 1000, // 1 segundo
  },

  ENVIRONMENTS: {
    TEST: "test",
    CI: "ci",
    LOCAL: "local",
  },
};

// Função para configurar ambiente de teste
export const setupTestEnvironment = (
  environment: "test" | "ci" | "local" = "test"
) => {
  const config = GLOBAL_TEST_CONFIG;

  // Configurar timeouts baseado no ambiente
  switch (environment) {
    case "ci":
      jest.setTimeout(config.TIMEOUTS.INTEGRATION);
      break;
    case "local":
      jest.setTimeout(config.TIMEOUTS.E2E);
      break;
    default:
      jest.setTimeout(config.TIMEOUTS.UNIT);
  }

  // Configurar cenário padrão
  setupDefaultTestScenario();
};

// Função para limpar ambiente de teste
export const cleanupTestEnvironment = () => {
  clearAllSharedMocks();
  jest.clearAllMocks();
  jest.resetAllMocks();
};

// Exportar configuração global
const testUtils = {
  clearAllSharedMocks,
  resetAllSharedMocks,
  restoreAllSharedMocks,
  setupDefaultTestScenario,
  setupFailureTestScenario,
  setupIntermittentFailureTestScenario,
  setupTestEnvironment,
  cleanupTestEnvironment,
  GLOBAL_TEST_CONFIG,
};

export default testUtils;

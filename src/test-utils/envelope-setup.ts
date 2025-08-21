/**
 * Configuração e Setup para Testes de Envelope
 * 
 * Este arquivo contém configurações comuns, mocks globais e utilitários
 * compartilhados entre todos os testes de envelope.
 */

import { jest } from '@jest/globals';

// Configurações globais para testes de envelope
export const ENVELOPE_TEST_CONFIG = {
  // IDs de teste padrão
  TEST_USER_ID: 'test-user-123',
  TEST_ENVELOPE_ID: 'test-envelope-123',
  
  // Dados de teste padrão
  DEFAULT_ENVELOPE_DATA: {
    name: 'Envelope Teste',
    value: 1000,
    type: 'MONETARY' as const,
  },
  
  // Valores de teste para diferentes cenários
  TEST_VALUES: {
    MONETARY: [0, 100, 1000, 1500.50, -500, 999999.99],
    PERCENTAGE: [0, 25, 50, 75, 100, 12.5, 33.33],
  },
  
  // Nomes de teste para diferentes cenários
  TEST_NAMES: [
    'Alimentação',
    'Transporte',
    'Lazer',
    'Investimentos',
    'Contas da Casa',
    'Saúde',
    'Educação',
    'Viagens',
  ],
  
  // Tipos de envelope válidos
  VALID_TYPES: ['PERCENTAGE', 'MONETARY'] as const,
};

// Utilitários para criação de dados de teste
export const createTestFormData = (overrides: Partial<typeof ENVELOPE_TEST_CONFIG.DEFAULT_ENVELOPE_DATA> = {}) => {
  const formData = new FormData();
  const data = { ...ENVELOPE_TEST_CONFIG.DEFAULT_ENVELOPE_DATA, ...overrides };
  
  formData.set('name', data.name);
  formData.set('value', data.value.toString());
  formData.set('type', data.type);
  
  return formData;
};

// Utilitários para criação de mocks de envelope
export const createMockEnvelope = (overrides: Partial<any> = {}) => {
  return {
    id: ENVELOPE_TEST_CONFIG.TEST_ENVELOPE_ID,
    name: ENVELOPE_TEST_CONFIG.DEFAULT_ENVELOPE_DATA.name,
    value: ENVELOPE_TEST_CONFIG.DEFAULT_ENVELOPE_DATA.value,
    type: ENVELOPE_TEST_CONFIG.DEFAULT_ENVELOPE_DATA.type,
    userId: ENVELOPE_TEST_CONFIG.TEST_USER_ID,
    isGlobal: false,
    isDeletable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

// Utilitários para criação de mocks de usuário
export const createMockUser = (overrides: Partial<any> = {}) => {
  return {
    id: ENVELOPE_TEST_CONFIG.TEST_USER_ID,
    email: 'test@example.com',
    ...overrides,
  };
};

// Função para limpar todos os mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
};

// Função para resetar todos os mocks
export const resetAllMocks = () => {
  jest.resetAllMocks();
};

// Função para restaurar todos os mocks
export const restoreAllMocks = () => {
  jest.restoreAllMocks();
};

// Configurações de timeout para testes
export const TEST_TIMEOUTS = {
  SHORT: 1000,    // 1 segundo
  MEDIUM: 5000,   // 5 segundos
  LONG: 10000,    // 10 segundos
};

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  USER_NOT_AUTHENTICATED: 'User not authenticated.',
  ENVELOPE_ALREADY_EXISTS: 'Já existe um envelope com este nome.',
  ENVELOPE_NOT_FOUND: 'Record to update not found',
  ENVELOPE_NOT_DELETABLE: 'Cannot delete non-deletable envelope',
  ACCESS_DENIED: 'Access denied',
  VALIDATION_FAILED: 'Validation failed',
  DATABASE_ERROR: 'Database error',
  CONNECTION_TIMEOUT: 'Connection timeout',
};

// Configurações de validação
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255, // Assumindo limite padrão do banco
  },
  VALUE: {
    MIN: -999999999.99,
    MAX: 999999999.99,
  },
  TYPE: {
    ALLOWED_VALUES: ENVELOPE_TEST_CONFIG.VALID_TYPES,
  },
};

// Função para validar estrutura de envelope
export const validateEnvelopeStructure = (envelope: any) => {
  const requiredFields = ['id', 'name', 'value', 'type', 'userId', 'isGlobal', 'isDeletable', 'createdAt', 'updatedAt'];
  
  requiredFields.forEach(field => {
    expect(envelope).toHaveProperty(field);
  });
  
  expect(typeof envelope.name).toBe('string');
  expect(typeof envelope.value).toBe('number');
  expect(typeof envelope.type).toBe('string');
  expect(typeof envelope.userId).toBe('string');
  expect(typeof envelope.isGlobal).toBe('boolean');
  expect(typeof envelope.isDeletable).toBe('boolean');
  expect(envelope.createdAt).toBeInstanceOf(Date);
  expect(envelope.updatedAt).toBeInstanceOf(Date);
  
  expect(ENVELOPE_TEST_CONFIG.VALID_TYPES).toContain(envelope.type);
};

// Função para validar dados de entrada
export const validateInputData = (formData: FormData) => {
  const name = formData.get('name');
  const value = formData.get('value');
  const type = formData.get('type');
  
  expect(name).toBeTruthy();
  expect(value).toBeTruthy();
  expect(type).toBeTruthy();
  
  if (name) expect(typeof name).toBe('string');
  if (value) expect(typeof value).toBe('string');
  if (type) expect(typeof type).toBe('string');
  
  if (type) expect(ENVELOPE_TEST_CONFIG.VALID_TYPES).toContain(type);
};

// Configurações de teste para diferentes ambientes
export const getTestConfig = (environment: 'test' | 'ci' | 'local' = 'test') => {
  const configs = {
    test: {
      timeout: TEST_TIMEOUTS.SHORT,
      verbose: false,
      retries: 1,
    },
    ci: {
      timeout: TEST_TIMEOUTS.MEDIUM,
      verbose: true,
      retries: 3,
    },
    local: {
      timeout: TEST_TIMEOUTS.LONG,
      verbose: true,
      retries: 1,
    },
  };
  
  return configs[environment];
};

// Exportar configuração padrão
export default ENVELOPE_TEST_CONFIG;

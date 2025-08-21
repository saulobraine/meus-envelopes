/**
 * Setup Global para Testes
 * 
 * Este arquivo resolve problemas comuns de ambiente de teste
 * e configura mocks globais necessários.
 */

// Polyfill para TextEncoder/TextDecoder (necessário para Next.js 15+)
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

// Polyfill para FormData (necessário para testes de server actions)
if (typeof globalThis.FormData === 'undefined') {
  const { FormData } = require('formdata-node');
  globalThis.FormData = FormData;
}

// Polyfill para Blob (necessário para FormData)
if (typeof globalThis.Blob === 'undefined') {
  const { Blob } = require('buffer');
  globalThis.Blob = Blob;
}

// Configurações globais do Jest
beforeAll(() => {
  // Configurar timeouts padrão
  jest.setTimeout(10000);
});

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configurar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Suprimir logs desnecessários durante testes
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock global para fetch se necessário
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = jest.fn();
}

// Mock global para crypto se necessário
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {
    getRandomValues: jest.fn(),
    randomUUID: jest.fn(() => 'test-uuid'),
  } as any;
}

// Mock global para localStorage se necessário
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  } as any;
}

// Mock global para sessionStorage se necessário
if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  } as any;
}

// Mock global para URL se necessário
if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = require('url').URL;
}

// Mock global para URLSearchParams se necessário
if (typeof globalThis.URLSearchParams === 'undefined') {
  globalThis.URLSearchParams = require('url').URLSearchParams;
}

// Mock global para Request se necessário
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(input: any, init?: any) {
      // Implementação básica para testes
    }
  } as any;
}

// Mock global para Response se necessário
if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = class Response {
    constructor(body?: any, init?: any) {
      // Implementação básica para testes
    }
  } as any;
}

// Importar mocks do Supabase
import './shared/supabase';

// Configurar Jest para usar setupFilesAfterEnv
export default {
  setupFilesAfterEnv: ['<rootDir>/src/app/_actions/__tests__/setup.ts'],
};

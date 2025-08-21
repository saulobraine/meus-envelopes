/**
 * Setup Global para Testes
 *
 * Este arquivo resolve problemas comuns de ambiente de teste
 * e configura mocks globais necessários.
 */

// Imports removidos pois não são utilizados diretamente neste arquivo

// Polyfills simplificados apenas quando necessário
import util from "util";
if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder =
    util.TextEncoder as unknown as typeof globalThis.TextEncoder;
  globalThis.TextDecoder =
    util.TextDecoder as unknown as typeof globalThis.TextDecoder;
}

// FormData polyfill básico para testes
if (typeof globalThis.FormData === "undefined") {
  globalThis.FormData = class FormData {
    private data = new Map<string, string>();

    append(name: string, value: string) {
      this.data.set(name, value);
    }

    get(name: string) {
      return this.data.get(name) || null;
    }
  } as unknown as typeof globalThis.FormData;
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

// Configurar ambiente de teste (apenas se não estiver definido)
if (!process.env.NODE_ENV) {
  (process.env as Record<string, unknown>).NODE_ENV = "test";
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
}

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
if (typeof globalThis.fetch === "undefined") {
  globalThis.fetch = jest.fn();
}

// Mock global para crypto se necessário
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = {
    getRandomValues: jest.fn(),
    randomUUID: jest.fn(() => "test-uuid"),
    subtle: {} as SubtleCrypto,
  } as Crypto;
}

// Mock global para localStorage se necessário
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  } as Storage;
}

// Mock global para sessionStorage se necessário
if (typeof globalThis.sessionStorage === "undefined") {
  globalThis.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  } as Storage;
}

// Mock global para URL se necessário
import url from "url";
if (typeof globalThis.URL === "undefined") {
  globalThis.URL = url.URL as unknown as typeof globalThis.URL;
}

// Mock global para URLSearchParams se necessário
if (typeof globalThis.URLSearchParams === "undefined") {
  globalThis.URLSearchParams =
    url.URLSearchParams as unknown as typeof globalThis.URLSearchParams;
}

// Mock global para Request se necessário
if (typeof globalThis.Request === "undefined") {
  globalThis.Request = class Request {
    constructor() {
      // Implementação básica para testes
    }
  } as unknown as typeof globalThis.Request;
}

// Mock global para Response se necessário
if (typeof globalThis.Response === "undefined") {
  globalThis.Response = class Response {
    constructor() {
      // Implementação básica para testes
    }
  } as unknown as typeof globalThis.Response;
}

// Importar mocks do Supabase
import "./shared/supabase";

// Configurar Jest para usar setupFilesAfterEnv
const actionsSetupConfig = {
  setupFilesAfterEnv: ["<rootDir>/src/app/_actions/__tests__/setup.ts"],
};

export default actionsSetupConfig;

/**
 * Setup para Testes de Componentes React
 *
 * Este arquivo configura o ambiente de teste para componentes React,
 * incluindo polyfills necessários e configurações globais.
 */

import "@testing-library/jest-dom";

// Importar mocks do Supabase
import "./supabase-mocks";

// Importar mocks do Next.js
import "./next-mocks";

// Polyfills necessários para ambiente de teste jsdom
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream } from "stream/web";

// Configurar TextEncoder/TextDecoder globalmente
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// Configurar ReadableStream para testes de streaming
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = ReadableStream as unknown as typeof global.ReadableStream;
}

// Mock do ResizeObserver (necessário para muitos componentes UI)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do IntersectionObserver (necessário para lazy loading)
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do matchMedia (necessário para responsive components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do getComputedStyle (necessário para cálculos de CSS)
Object.defineProperty(window, "getComputedStyle", {
  value: () => ({
    getPropertyValue: () => "",
  }),
});

// Mock do scrollTo (necessário para alguns componentes)
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
});

// Mock do HTMLElement.scrollIntoView
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  value: jest.fn(),
});

// Mock do HTMLDialogElement (para modals/dialogs)
if (typeof global.HTMLDialogElement === "undefined") {
  global.HTMLDialogElement = class HTMLDialogElement extends HTMLElement {
    open = false;
    returnValue = "";
    show = jest.fn();
    showModal = jest.fn();
    close = jest.fn();
  } as typeof HTMLDialogElement;
}

// Mock do Clipboard API - comentado temporariamente para resolver conflito
// if (typeof navigator.clipboard === 'undefined') {
//   Object.defineProperty(navigator, 'clipboard', {
//     value: {
//       writeText: jest.fn(),
//       readText: jest.fn(),
//     },
//   });
// }

// Mock de crypto.randomUUID
Object.defineProperty(global.crypto, "randomUUID", {
  value: jest.fn(() => "mock-uuid-1234"),
});

// Suprimir warnings desnecessários durante testes
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: Array<unknown>) => {
    // Suprimir warnings específicos do React/Next.js que não são relevantes para testes
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render is deprecated") ||
        args[0].includes("Warning: Function components cannot be given refs") ||
        args[0].includes("act(...) is not supported"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: Array<unknown>) => {
    // Suprimir warnings específicos que não são relevantes para testes
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render is deprecated") ||
        args[0].includes("Warning: Function components cannot be given refs"))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Configurar timeouts
jest.setTimeout(10000);

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Importar mocks compartilhados
// import './shared/react-testing';
// import './shared/server-actions';

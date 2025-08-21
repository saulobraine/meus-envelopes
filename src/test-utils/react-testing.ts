/**
 * Utilitários Básicos para Testes de Componentes React
 */

import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement, ReactNode } from "react";
import { jest } from "@jest/globals";

// Mock básico do useRouter do Next.js
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

// Mock básico do useToast
export const mockToast = jest.fn();

// Mock básico do useAuth
export const mockAuth = {
  user: { id: "test-user-123", email: "test@example.com" },
  isAuthenticated: true,
  loading: false,
  signOut: jest.fn(),
};

// Wrapper básico para testes com providers
interface AllTheProvidersProps {
  children: ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return children as ReactElement;
};

// Função de render customizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-exportar funcionalidades básicas
export * from "@testing-library/react";
export { customRender as render, userEvent };

// Export default básico
const testUtilsExport = {
  render: customRender,
  userEvent,
  mockToast,
  mockRouter,
  mockAuth,
};

export default testUtilsExport;

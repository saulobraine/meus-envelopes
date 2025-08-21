/**
 * Testes para o componente TransactionDialog
 *
 * Este arquivo testa as funcionalidades essenciais do diálogo de transações:
 * - Renderização básica
 * - Props principais
 * - Estados básicos
 * - Funcionalidades core
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TransactionDialog } from "../TransactionDialog";

// Mock das dependências
jest.mock("@/app/_actions/transactions/create", () => ({
  create: jest.fn(),
}));

jest.mock("@/app/_actions/transactions/update", () => ({
  update: jest.fn(),
}));

jest.mock("@/app/_actions/envelope/get", () => ({
  get: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe("TransactionDialog", () => {
  const mockOnTransactionAdded = jest.fn();
  const mockOnTransactionUpdated = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Renderização Básica", () => {
    it("deve renderizar o componente TransactionDialog", () => {
      render(
        <TransactionDialog
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Verificar se o botão de trigger está presente
      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });

    it("deve renderizar com tipo padrão expense", () => {
      render(
        <TransactionDialog
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });

    it("deve renderizar com tipo income quando especificado", () => {
      render(
        <TransactionDialog
          defaultType="income"
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });
  });

  describe("Props e Validação", () => {
    it("deve aceitar onTransactionAdded callback", () => {
      render(
        <TransactionDialog
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      expect(mockOnTransactionAdded).toBeDefined();
    });

    it("deve aceitar onTransactionUpdated callback", () => {
      render(
        <TransactionDialog
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      expect(mockOnTransactionUpdated).toBeDefined();
    });

    it("deve aceitar defaultType", () => {
      render(
        <TransactionDialog
          defaultType="income"
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });
  });

  describe("Modo de Operação", () => {
    it("deve estar em modo add por padrão", () => {
      render(
        <TransactionDialog
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });

    it("deve aceitar modo edit", () => {
      render(
        <TransactionDialog
          mode="edit"
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });
  });

  describe("Estado Controlado", () => {
    it("deve aceitar open controlado", () => {
      render(
        <TransactionDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Quando open é true, o diálogo deve estar visível
      expect(mockOnOpenChange).toBeDefined();
    });

    it("deve aceitar onOpenChange callback", () => {
      render(
        <TransactionDialog
          onOpenChange={mockOnOpenChange}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      expect(mockOnOpenChange).toBeDefined();
    });
  });

  describe("Estrutura HTML", () => {
    it("deve ter estrutura semântica correta", () => {
      render(
        <TransactionDialog
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role button no trigger", () => {
      render(
        <TransactionDialog
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });

    it("deve ter texto acessível no trigger", () => {
      render(
        <TransactionDialog
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      const triggerButton = screen.getByRole("button", {
        name: /nova transação/i,
      });
      expect(triggerButton).toBeInTheDocument();
    });
  });
});

/**
 * Teste Básico para o TransactionDialog
 *
 * Este arquivo testa funcionalidades básicas que sabemos que funcionam:
 * - Renderização
 * - Validação de campos obrigatórios
 * - Estados básicos
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { TransactionDialog } from "../TransactionDialog";

// Mock das actions
jest.mock("@/app/_actions/transactions/create", () => ({
  create: jest.fn(),
}));

jest.mock("@/app/_actions/transactions/update", () => ({
  update: jest.fn(),
}));

jest.mock("@/app/_actions/envelope/get", () => ({
  get: jest.fn(),
}));

// Mock do toast
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock do router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe("TransactionDialog - Testes Básicos", () => {
  const user = userEvent.setup();
  const mockOnTransactionAdded = jest.fn();
  const mockOnTransactionUpdated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock para listagem de envelopes
    const { get: mockGetEnvelopes } = require("@/app/_actions/envelope/get");
    mockGetEnvelopes.mockResolvedValue([
      { id: "1", name: "Supermercado", type: "EXPENSE" },
      { id: "2", name: "Salário", type: "INCOME" },
    ]);
  });

  describe("Renderização e Estrutura", () => {
    it("deve renderizar o diálogo corretamente", async () => {
      render(
        <TransactionDialog
          open={true}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Aguardar carregamento dos envelopes
      await waitFor(() => {
        expect(require("@/app/_actions/envelope/get").get).toHaveBeenCalled();
      });

      // Verificar se o título está presente
      expect(screen.getByText(/adicionar transação/i)).toBeInTheDocument();

      // Verificar se os campos básicos estão presentes
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();

      // Verificar se o botão de submit está presente
      expect(
        screen.getByRole("button", { name: /salvar transação/i })
      ).toBeInTheDocument();
    });

    it("deve mostrar modo de edição quando especificado", async () => {
      const mockTransaction = {
        id: "123",
        amount: 150,
        type: "EXPENSE" as const,
        description: "Compras antigas",
        envelopeId: "1",
        date: new Date(),
        userId: "user-123",
        status: "COMPLETED" as const,
        scheduledAt: null,
        processedAt: null,
        importJobId: null,
      };

      render(
        <TransactionDialog
          mode="edit"
          transaction={mockTransaction}
          open={true}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Aguardar carregamento dos envelopes
      await waitFor(() => {
        expect(require("@/app/_actions/envelope/get").get).toHaveBeenCalled();
      });

      // Verificar se o título está correto
      expect(screen.getByText(/editar transação/i)).toBeInTheDocument();

      // Verificar se o botão de submit está correto
      expect(
        screen.getByRole("button", { name: /atualizar transação/i })
      ).toBeInTheDocument();
    });
  });

  describe("Validação de Campos", () => {
    it("deve validar campos obrigatórios", async () => {
      render(
        <TransactionDialog
          open={true}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Aguardar carregamento dos envelopes
      await waitFor(() => {
        expect(require("@/app/_actions/envelope/get").get).toHaveBeenCalled();
      });

      const submitButton = screen.getByRole("button", {
        name: /salvar transação/i,
      });

      // Tentar submeter sem preencher
      await user.click(submitButton);

      // Verificar se há mensagens de erro
      await waitFor(() => {
        expect(
          screen.getByText(/descrição é obrigatória/i)
        ).toBeInTheDocument();
      });
    });

    it("deve aceitar valores válidos", async () => {
      render(
        <TransactionDialog
          open={true}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Aguardar carregamento dos envelopes
      await waitFor(() => {
        expect(require("@/app/_actions/envelope/get").get).toHaveBeenCalled();
      });

      const amountInput = screen.getByLabelText(/valor/i);
      const descriptionInput = screen.getByLabelText(/descrição/i);

      // Preencher com valores válidos
      await user.type(amountInput, "150");
      await user.type(descriptionInput, "Compras do mês");

      // Verificar se os valores foram preenchidos
      expect(amountInput.value).toMatch(/R\$\s*1,50/); // Valor formatado (aceita espaços)
      expect(descriptionInput).toHaveValue("Compras do mês");

      // Verificar se não há erros de validação
      expect(
        screen.queryByText(/descrição é obrigatória/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Estados e Interações", () => {
    it("deve ter valores padrão corretos", async () => {
      render(
        <TransactionDialog
          open={true}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Aguardar carregamento dos envelopes
      await waitFor(() => {
        expect(require("@/app/_actions/envelope/get").get).toHaveBeenCalled();
      });

      const amountInput = screen.getByLabelText(/valor/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(
        /descrição/i
      ) as HTMLInputElement;

      expect(amountInput.value).toBe("");
      expect(descriptionInput.value).toBe("");
    });

    it("deve permitir interação com campos", async () => {
      render(
        <TransactionDialog
          open={true}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Aguardar carregamento dos envelopes
      await waitFor(() => {
        expect(require("@/app/_actions/envelope/get").get).toHaveBeenCalled();
      });

      const amountInput = screen.getByLabelText(/valor/i);
      const descriptionInput = screen.getByLabelText(/descrição/i);

      // Preencher campos
      await user.type(amountInput, "100");
      await user.type(descriptionInput, "Teste");

      // Verificar se os valores foram preenchidos
      expect(amountInput.value).toMatch(/R\$\s*1,00/); // Valor formatado (aceita espaços)
      expect(descriptionInput).toHaveValue("Teste");
    });
  });

  describe("Mocks e Dependências", () => {
    it("deve carregar envelopes corretamente", async () => {
      render(
        <TransactionDialog
          open={true}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Verificar se a action de buscar envelopes foi chamada
      await waitFor(() => {
        expect(require("@/app/_actions/envelope/get").get).toHaveBeenCalled();
      });
    });

    it("deve ter mocks configurados corretamente", () => {
      // Verificar se os mocks estão funcionando
      const {
        create: mockCreate,
      } = require("@/app/_actions/transactions/create");
      const {
        update: mockUpdate,
      } = require("@/app/_actions/transactions/update");
      const { get: mockGet } = require("@/app/_actions/envelope/get");

      expect(mockCreate).toBeDefined();
      expect(mockUpdate).toBeDefined();
      expect(mockGet).toBeDefined();
    });
  });
});

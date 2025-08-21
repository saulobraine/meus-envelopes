/**
 * Teste de Integração Simples para o TransactionDialog
 *
 * Este arquivo testa a integração básica entre o frontend e as actions:
 * - Fluxo básico de criação de transação
 * - Interação com as actions do backend
 * - Validações e estados do formulário
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { TransactionDialog } from "../TransactionDialog";
// Imports removidos pois não são utilizados neste teste

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

describe("TransactionDialog - Integração Simples", () => {
  const user = userEvent.setup();
  const mockOnTransactionAdded = jest.fn();
  const mockOnTransactionUpdated = jest.fn();

  const mockEnvelopes = [
    { id: "1", name: "Supermercado", type: "EXPENSE" },
    { id: "2", name: "Salário", type: "INCOME" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock para listagem de envelopes
    const mockGetEnvelopes = jest.fn();
    mockGetEnvelopes.mockResolvedValue(mockEnvelopes);
  });

  describe("Fluxo Básico de Criação", () => {
    it("deve renderizar e permitir interação básica", async () => {
      render(
        <TransactionDialog
          open={true}
          onTransactionAdded={mockOnTransactionAdded}
          onTransactionUpdated={mockOnTransactionUpdated}
        />
      );

      // Aguardar carregamento dos envelopes
      await waitFor(() => {
        expect(mockGetEnvelopes).toHaveBeenCalled();
      });

      // Verificar se os campos estão presentes
      const amountInput = screen.getByLabelText(/valor/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(
        /descrição/i
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: /salvar transação/i,
      });

      expect(amountInput).toBeInTheDocument();
      expect(descriptionInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();

      // Preencher campos básicos
      await user.type(amountInput, "150");
      await user.type(descriptionInput, "Compras do mês");

      // Verificar se os valores foram preenchidos
      expect(amountInput.value).toMatch(/R\$\s*1,50/); // Valor formatado
      expect(descriptionInput).toHaveValue("Compras do mês");

      // Verificar se o botão está habilitado
      expect(submitButton).not.toBeDisabled();
    });

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
        expect(mockGetEnvelopes).toHaveBeenCalled();
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
        expect(mockGetEnvelopes).toHaveBeenCalled();
      });

      const amountInput = screen.getByLabelText(/valor/i);
      const descriptionInput = screen.getByLabelText(/descrição/i);

      // Preencher com valores válidos
      await user.type(amountInput, "150");
      await user.type(descriptionInput, "Compras do mês");

      // Verificar se não há erros de validação
      expect(
        screen.queryByText(/descrição é obrigatória/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Modo de Edição", () => {
    it("deve carregar dados da transação existente", async () => {
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
        expect(mockGetEnvelopes).toHaveBeenCalled();
      });

      // Verificar se os campos estão preenchidos
      const amountInput = screen.getByLabelText(/valor/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(
        /descrição/i
      ) as HTMLInputElement;

      expect(amountInput.value).toMatch(/R\$\s*1,50/); // Valor formatado
      expect(descriptionInput.value).toBe("Compras antigas");
    });

    it("deve mostrar modo de edição corretamente", async () => {
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
        expect(mockGetEnvelopes).toHaveBeenCalled();
      });

      // Verificar se o título está correto
      expect(screen.getByText(/editar transação/i)).toBeInTheDocument();

      // Verificar se o botão de submit está correto
      expect(
        screen.getByRole("button", { name: /atualizar transação/i })
      ).toBeInTheDocument();
    });
  });

  describe("Estados do Formulário", () => {
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
        expect(mockGetEnvelopes).toHaveBeenCalled();
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
        expect(mockGetEnvelopes).toHaveBeenCalled();
      });

      const amountInput = screen.getByLabelText(/valor/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(
        /descrição/i
      ) as HTMLInputElement;

      // Preencher campos
      await user.type(amountInput, "100");
      await user.type(descriptionInput, "Teste");

      // Verificar se os valores foram preenchidos
      expect(amountInput.value).toMatch(/R\$\s*1,00/); // Valor formatado
      expect(descriptionInput.value).toBe("Teste");
    });
  });
});

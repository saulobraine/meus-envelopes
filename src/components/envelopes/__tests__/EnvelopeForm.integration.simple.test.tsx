/**
 * Teste de Integração Simples para o EnvelopeForm
 *
 * Este arquivo testa a integração básica entre o frontend e as actions:
 * - Fluxo básico de criação de envelope
 * - Interação com as actions do backend
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { EnvelopeForm } from "../EnvelopeForm";

// Mock das actions
jest.mock("@/app/_actions/envelope", () => ({
  create: jest.fn(),
}));

// Mock do toast
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("EnvelopeForm - Integração Simples", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Fluxo Básico de Criação", () => {
    it("deve renderizar e permitir interação básica", async () => {
      const mockOnSuccess = jest.fn();

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      // Verificar se os campos estão presentes
      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      expect(nameInput).toBeInTheDocument();
      expect(valueInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();

      // Preencher campos básicos
      await user.type(nameInput, "Teste");
      await user.clear(valueInput);
      await user.type(valueInput, "100");

      // Verificar se os valores foram preenchidos
      expect(nameInput).toHaveValue("Teste");
      expect(valueInput).toHaveValue(100);

      // Verificar se o botão está habilitado
      expect(submitButton).not.toBeDisabled();
    });

    it("deve validar campos obrigatórios", async () => {
      const mockOnSuccess = jest.fn();

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      // Tentar submeter sem preencher
      await user.click(submitButton);

      // Verificar se há mensagens de erro
      await waitFor(() => {
        expect(
          screen.getByText(/nome do envelope deve ter pelo menos 2 caracteres/i)
        ).toBeInTheDocument();
      });
    });

    it("deve aceitar valores válidos", async () => {
      const mockOnSuccess = jest.fn();

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);

      // Preencher com valores válidos
      await user.type(nameInput, "Supermercado");
      await user.clear(valueInput);
      await user.type(valueInput, "300");

      // Verificar se não há erros de validação
      expect(
        screen.queryByText(/nome do envelope deve ter pelo menos 2 caracteres/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/valor deve ser um número positivo/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Integração com Actions", () => {
    it("deve chamar a action quando o formulário for válido", async () => {
      const mockOnSuccess = jest.fn();
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");

      // Mock para sucesso
      mockCreateEnvelope.mockResolvedValue({
        success: true,
        data: { id: "123", name: "Teste", value: 100, type: "MONETARY" },
      });

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      // Preencher formulário
      await user.type(nameInput, "Teste");
      await user.clear(valueInput);
      await user.type(valueInput, "100");

      // Submeter
      await user.click(submitButton);

      // Verificar se a action foi chamada
      await waitFor(() => {
        expect(mockCreateEnvelope).toHaveBeenCalled();
      });
    });

    it("deve lidar com erro da action", async () => {
      const mockOnSuccess = jest.fn();
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");

      // Mock para erro
      mockCreateEnvelope.mockRejectedValue(new Error("Erro no servidor"));

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      // Preencher formulário
      await user.type(nameInput, "Teste");
      await user.clear(valueInput);
      await user.type(valueInput, "100");

      // Submeter
      await user.click(submitButton);

      // Verificar se a action foi chamada
      await waitFor(() => {
        expect(mockCreateEnvelope).toHaveBeenCalled();
      });

      // Verificar se onSuccess NÃO foi chamado devido ao erro
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Estados do Formulário", () => {
    it("deve ter valores padrão corretos", () => {
      const mockOnSuccess = jest.fn();

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(
        /nome do envelope/i
      ) as HTMLInputElement;
      const valueInput = screen.getByLabelText(/^valor$/i) as HTMLInputElement;

      expect(nameInput.value).toBe("");
      expect(valueInput.value).toBe("0");
    });

    it("deve limpar campos após submissão bem-sucedida", async () => {
      const mockOnSuccess = jest.fn();
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");

      // Mock para sucesso
      mockCreateEnvelope.mockResolvedValue({
        success: true,
        data: { id: "123", name: "Teste", value: 100, type: "MONETARY" },
      });

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(
        /nome do envelope/i
      ) as HTMLInputElement;
      const valueInput = screen.getByLabelText(/^valor$/i) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      // Preencher e submeter
      await user.type(nameInput, "Teste");
      await user.clear(valueInput);
      await user.type(valueInput, "100");
      await user.click(submitButton);

      // Aguardar sucesso
      await waitFor(() => {
        expect(mockCreateEnvelope).toHaveBeenCalled();
      });

      // Verificar se os campos foram limpos
      expect(nameInput.value).toBe("");
      expect(valueInput.value).toBe("0");
    });
  });
});

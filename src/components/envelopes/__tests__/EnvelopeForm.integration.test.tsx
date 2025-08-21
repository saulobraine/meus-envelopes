/**
 * Testes de Integração para o EnvelopeForm
 *
 * Este arquivo testa a integração entre o frontend e as actions:
 * - Fluxo completo de criação de envelope
 * - Interação com as actions do backend
 * - Estados de loading e sucesso
 * - Tratamento de erros
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { EnvelopeForm } from "../EnvelopeForm";

// Mock das actions reais
jest.mock("@/app/_actions/envelope", () => ({
  create: jest.fn(),
}));

// Mock do toast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe("EnvelopeForm - Integração com Actions", () => {
  const mockOnSuccess = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Fluxo de Criação de Envelope", () => {
    it("deve criar envelope com sucesso e chamar onSuccess", async () => {
      // Configurar mock para sucesso
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");
      mockCreateEnvelope.mockResolvedValue({
        success: true,
        data: { id: "123", name: "Supermercado", value: 300, type: "MONETARY" },
      });

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      // Preencher o formulário
      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      await user.type(nameInput, "Supermercado");
      await user.clear(valueInput);
      await user.type(valueInput, "300");

      // Submeter o formulário
      await user.click(submitButton);

      // Verificar se a action foi chamada (com FormData)
      await waitFor(() => {
        expect(mockCreateEnvelope).toHaveBeenCalled();
        const callArgs = mockCreateEnvelope.mock.calls[0][0];
        expect(callArgs).toBeInstanceOf(FormData);
        expect(callArgs.get("name")).toBe("Supermercado");
        expect(callArgs.get("value")).toBe("300");
        expect(callArgs.get("type")).toBe("MONETARY");
      });

      // Verificar se onSuccess foi chamado
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // Verificar se o toast de sucesso foi mostrado
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Envelope adicionado",
          description: "O envelope foi criado com sucesso.",
        });
      });
    });

    it("deve lidar com erro na criação e mostrar toast de erro", async () => {
      // Configurar mock para erro
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");
      mockCreateEnvelope.mockRejectedValue(new Error("Erro ao criar envelope"));

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      // Preencher e submeter o formulário
      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      await user.type(nameInput, "Teste");
      await user.clear(valueInput);
      await user.type(valueInput, "100");
      await user.click(submitButton);

      // Verificar se o toast de erro foi mostrado
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Erro ao adicionar envelope",
          description: "Erro ao criar envelope",
          variant: "destructive",
        });
      });

      // Verificar se onSuccess NÃO foi chamado
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Validação de Dados", () => {
    it("deve validar campos obrigatórios antes de chamar a action", async () => {
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

    it("deve validar valor numérico antes de chamar a action", async () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      await user.type(nameInput, "Teste");
      await user.clear(valueInput);
      await user.type(valueInput, "-10"); // Valor negativo (inválido)

      await user.click(submitButton);

      // Verificar se há mensagem de erro de validação
      await waitFor(() => {
        expect(
          screen.getByText(/valor deve ser um número positivo/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Estados de Loading", () => {
    it("deve mostrar estado de loading durante a criação", async () => {
      // Mock que demora para responder
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");
      mockCreateEnvelope.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      await user.type(nameInput, "Teste");
      await user.clear(valueInput);
      await user.type(valueInput, "100");

      await user.click(submitButton);

      // Verificar se o botão está desabilitado durante o loading
      expect(submitButton).toBeDisabled();

      // Aguardar a conclusão
      await waitFor(() => {
        expect(mockCreateEnvelope).toHaveBeenCalled();
      });

      // Verificar se o botão voltou ao normal
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Integração com Diferentes Tipos", () => {
    it("deve criar envelope com tipo padrão corretamente", async () => {
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");
      mockCreateEnvelope.mockResolvedValue({
        success: true,
        data: { id: "123", name: "Salário", value: 5000, type: "MONETARY" },
      });

      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      await user.type(nameInput, "Salário");
      await user.clear(valueInput);
      await user.type(valueInput, "5000");

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateEnvelope).toHaveBeenCalled();
        const callArgs = mockCreateEnvelope.mock.calls[0][0];
        expect(callArgs).toBeInstanceOf(FormData);
        expect(callArgs.get("name")).toBe("Salário");
        expect(callArgs.get("value")).toBe("5000");
        expect(callArgs.get("type")).toBe("MONETARY"); // Tipo padrão
      });
    });
  });
});

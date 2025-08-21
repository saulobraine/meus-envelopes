/**
 * Teste de Integração - Workflow de Negócio Simplificado
 *
 * Este arquivo testa a integração básica entre componentes:
 * - Criação de envelope (funcional)
 * - Testes simples e focados
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { EnvelopeForm } from "../envelopes/EnvelopeForm";

// Mock das actions
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

describe("Workflow de Negócio - Integração Simplificada", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Workflow: Criar Envelope", () => {
    it("deve permitir criar envelope com sucesso", async () => {
      // Mock para criação de envelope
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");
      mockCreateEnvelope.mockResolvedValue({
        success: true,
        data: {
          id: "env-123",
          name: "Supermercado",
          value: 500,
          type: "MONETARY",
        },
      });

      render(<EnvelopeForm onSuccess={jest.fn()} />);

      // Preencher formulário de envelope
      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      await user.type(nameInput, "Supermercado");
      await user.clear(valueInput);
      await user.type(valueInput, "500");
      await user.click(submitButton);

      // Verificar se envelope foi criado
      await waitFor(() => {
        expect(mockCreateEnvelope).toHaveBeenCalled();
        const callArgs = mockCreateEnvelope.mock.calls[0][0];
        expect(callArgs).toBeInstanceOf(FormData);
        expect(callArgs.get("name")).toBe("Supermercado");
        expect(callArgs.get("value")).toBe("500");
        expect(callArgs.get("type")).toBe("MONETARY");
      });
    });

    it("deve lidar com erro na criação de envelope", async () => {
      // Mock para erro na criação
      const { create: mockCreateEnvelope } = require("@/app/_actions/envelope");
      mockCreateEnvelope.mockRejectedValue(new Error("Erro no banco de dados"));

      render(<EnvelopeForm onSuccess={jest.fn()} />);

      // Preencher formulário de envelope
      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });

      await user.type(nameInput, "Teste");
      await user.clear(valueInput);
      await user.type(valueInput, "100");
      await user.click(submitButton);

      // Verificar se o erro foi tratado
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Erro ao adicionar envelope",
          description: "Erro no banco de dados",
          variant: "destructive",
        });
      });
    });
  });
});

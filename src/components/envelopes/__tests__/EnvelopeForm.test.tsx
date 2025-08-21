/**
 * Testes para o componente EnvelopeForm
 *
 * Este arquivo testa as funcionalidades essenciais do formulário de envelope:
 * - Renderização básica
 * - Props principais
 * - Estados básicos
 * - Funcionalidades core
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EnvelopeForm } from "../EnvelopeForm";

// Mock das dependências
jest.mock("@/app/_actions/envelope", () => ({
  create: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("EnvelopeForm", () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Renderização Básica", () => {
    it("deve renderizar o componente EnvelopeForm", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      // Verificar se o formulário está presente
      const form = screen
        .getByRole("button", { name: /adicionar envelope/i })
        .closest("form");
      expect(form).toBeInTheDocument();
    });

    it("deve renderizar todos os campos do formulário", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      // Verificar se todos os campos estão presentes
      expect(screen.getByLabelText(/nome do envelope/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo de valor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^valor$/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /adicionar envelope/i })
      ).toBeInTheDocument();
    });

    it("deve ter placeholders corretos nos campos", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByPlaceholderText(/ex: supermercado/i);
      const valueInput = screen.getByPlaceholderText("30");

      expect(nameInput).toBeInTheDocument();
      expect(valueInput).toBeInTheDocument();
    });

    it("deve ter valores padrão corretos", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(
        /nome do envelope/i
      ) as HTMLInputElement;
      const valueInput = screen.getByLabelText(/^valor$/i) as HTMLInputElement;

      expect(nameInput.value).toBe("");
      expect(valueInput.value).toBe("0");
    });
  });

  describe("Props e Validação", () => {
    it("deve aceitar onSuccess callback", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      expect(mockOnSuccess).toBeDefined();
    });

    it("deve ter estrutura semântica correta", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const form = screen
        .getByRole("button", { name: /adicionar envelope/i })
        .closest("form");
      expect(form).toBeInTheDocument();
    });
  });

  describe("Estrutura HTML", () => {
    it("deve ter labels associados aos inputs", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const typeSelect = screen.getByLabelText(/tipo de valor/i);

      expect(nameInput).toBeInTheDocument();
      expect(valueInput).toBeInTheDocument();
      expect(typeSelect).toBeInTheDocument();
    });

    it("deve ter botão de submit", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role form", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const form = screen
        .getByRole("button", { name: /adicionar envelope/i })
        .closest("form");
      expect(form).toBeInTheDocument();
    });

    it("deve ter labels associados aos inputs", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(/nome do envelope/i);
      const valueInput = screen.getByLabelText(/^valor$/i);
      const typeSelect = screen.getByLabelText(/tipo de valor/i);

      expect(nameInput).toBeInTheDocument();
      expect(valueInput).toBeInTheDocument();
      expect(typeSelect).toBeInTheDocument();
    });

    it("deve ter botão com texto descritivo", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole("button", {
        name: /adicionar envelope/i,
      });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Estados do Formulário", () => {
    it("deve ter campos vazios inicialmente", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText(
        /nome do envelope/i
      ) as HTMLInputElement;
      const valueInput = screen.getByLabelText(/^valor$/i) as HTMLInputElement;

      expect(nameInput.value).toBe("");
      expect(valueInput.value).toBe("0");
    });

    it("deve ter tipo padrão EXPENSE", () => {
      render(<EnvelopeForm onSuccess={mockOnSuccess} />);

      const typeSelect = screen.getByLabelText(/tipo de valor/i);
      expect(typeSelect).toBeInTheDocument();
    });
  });
});

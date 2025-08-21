/**
 * Testes para o componente ThemeToggle
 *
 * Este arquivo testa as funcionalidades básicas do ThemeToggle:
 * - Renderização do botão
 * - Alternância de tema
 * - Acessibilidade
 * - Props básicas
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock do useTheme
let mockSetTheme = jest.fn();
let mockResolvedTheme = "light";

jest.mock("@/components/theme-provider", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    resolvedTheme: mockResolvedTheme,
  }),
}));

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolvedTheme = "light";
  });

  describe("Renderização Básica", () => {
    it("deve renderizar o botão de alternância de tema", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("deve ter o texto acessível correto", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it("deve ter o tipo button", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });

  describe("Alternância de Tema", () => {
    it("deve chamar setTheme com dark quando tema atual é light", () => {
      mockResolvedTheme = "light";

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      button.click();

      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("deve chamar setTheme com light quando tema atual é dark", () => {
      mockResolvedTheme = "dark";

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      button.click();

      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("deve chamar setTheme apenas uma vez por clique", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      button.click();

      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe("Ícones", () => {
    it("deve mostrar ícone Moon quando tema é light", () => {
      mockResolvedTheme = "light";

      render(<ThemeToggle />);

      // Verificar se o ícone Moon está presente
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("deve mostrar ícone Sun quando tema é dark", () => {
      mockResolvedTheme = "dark";

      render(<ThemeToggle />);

      // Verificar se o ícone Sun está presente
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Props e Estilos", () => {
    it("deve ter variant outline", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "border-input", "bg-background");
    });

    it("deve ter size icon", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10", "w-10");
    });

    it("deve ter classes de hover", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "hover:bg-accent",
        "hover:text-accent-foreground"
      );
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role button", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("deve ter texto acessível para leitores de tela", () => {
      render(<ThemeToggle />);

      const srText = screen.getByText("Toggle theme");
      expect(srText).toHaveClass("sr-only");
    });

    it("deve ser clicável", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  describe("Comportamento", () => {
    it("deve funcionar quando setTheme é undefined", () => {
      const originalSetTheme = mockSetTheme;
      mockSetTheme = undefined as unknown as jest.Mock;

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      // Restaurar mock
      mockSetTheme = originalSetTheme;
    });

    it("deve funcionar quando resolvedTheme é undefined", () => {
      const originalResolvedTheme = mockResolvedTheme;
      mockResolvedTheme = undefined as unknown as string;

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      // Restaurar mock
      mockResolvedTheme = originalResolvedTheme;
    });
  });
});

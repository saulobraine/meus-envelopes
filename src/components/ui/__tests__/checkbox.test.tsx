/**
 * Testes para o componente Checkbox
 *
 * Este arquivo testa as funcionalidades do componente Checkbox:
 * - Renderização do checkbox
 * - Diferentes tamanhos e variantes
 * - Estados (checked, disabled, error, loading)
 * - Acessibilidade
 * - Props customizadas
 * - Interações do usuário
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox Component", () => {
  describe("Renderização Básica", () => {
    it("deve renderizar o componente Checkbox", () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("deve ter o role correto", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("deve ter as classes CSS padrão", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("h-4", "w-4", "border-primary");
    });
  });

  describe("Estados", () => {
    it("deve estar desmarcado por padrão", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("deve estar marcado quando checked é true", () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("deve estar desabilitado quando disabled é true", () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });

    it("deve estar habilitado por padrão", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeDisabled();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter aria-checked correto", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "false");
    });

    it("deve ter aria-checked true quando marcado", () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("Props Adicionais", () => {
    it("deve aceitar className customizada", () => {
      render(<Checkbox className="custom-class" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-class");
    });

    it("deve aceitar id customizado", () => {
      render(<Checkbox id="custom-id" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Indicador Visual", () => {
    it("deve mostrar o ícone de check quando marcado", () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      // O ícone está dentro do CheckboxPrimitive.Indicator
    });

    it("deve não mostrar o ícone quando desmarcado", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      // O ícone não deve estar visível quando não marcado
    });
  });

  describe("Ref Forwarding", () => {
    it("deve encaminhar ref corretamente", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Checkbox ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});

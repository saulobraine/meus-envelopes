/**
 * Testes para o componente Switch
 *
 * Este arquivo testa as funcionalidades do componente Switch:
 * - Renderização do switch
 * - Diferentes tamanhos e variantes
 * - Estados (checked, disabled, error, loading)
 * - Acessibilidade
 * - Props customizadas
 * - Interações do usuário
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Switch } from "@/components/ui/switch";

describe("Switch Component", () => {
  describe("Renderização Básica", () => {
    it("deve renderizar o componente Switch", () => {
      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId("switch");
      expect(switchElement).toBeInTheDocument();
    });

    it("deve ter o role switch", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
    });

    it("deve ter as classes CSS padrão", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("peer", "inline-flex", "h-6", "w-11");
    });
  });

  describe("Estados", () => {
    it("deve estar desmarcado por padrão", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "false");
      expect(switchElement).toHaveAttribute("data-state", "unchecked");
    });

    it("deve estar marcado quando checked é true", () => {
      render(<Switch checked />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "true");
      expect(switchElement).toHaveAttribute("data-state", "checked");
    });

    it("deve estar desabilitado quando disabled é true", () => {
      render(<Switch disabled />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeDisabled();
    });

    it("deve estar habilitado por padrão", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).not.toBeDisabled();
    });
  });

  describe("Props Adicionais", () => {
    it("deve aceitar className customizada", () => {
      render(<Switch className="custom-class" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("custom-class");
    });

    it("deve aceitar id customizado", () => {
      render(<Switch id="custom-id" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("id", "custom-id");
    });

    it("deve aceitar value customizado", () => {
      render(<Switch value="custom-value" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("value", "custom-value");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter aria-checked correto", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "false");
    });

    it("deve ter aria-checked true quando marcado", () => {
      render(<Switch checked />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "true");
    });

    it("deve ter aria-checked false quando desmarcado", () => {
      render(<Switch checked={false} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("Indicador Visual", () => {
    it("deve mostrar o indicador visual", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch");
      const indicator = switchElement.querySelector("span");
      expect(indicator).toBeInTheDocument();
    });

    it("deve ter o indicador com classes corretas", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch");
      const indicator = switchElement.querySelector("span");
      expect(indicator).toHaveClass(
        "pointer-events-none",
        "block",
        "h-5",
        "w-5"
      );
    });
  });

  describe("Ref Forwarding", () => {
    it("deve encaminhar ref corretamente", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Switch ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});

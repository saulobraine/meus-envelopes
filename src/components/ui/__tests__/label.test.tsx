/**
 * Testes para o componente Label
 *
 * Este arquivo testa as funcionalidades básicas do Label:
 * - Renderização
 * - Props básicas
 * - Acessibilidade
 * - Ref forwarding
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Label } from "@/components/ui/label";

describe("Label Component", () => {
  describe("Renderização Básica", () => {
    it("deve renderizar o componente Label", () => {
      render(<Label data-testid="label">Nome do usuário</Label>);
      const label = screen.getByTestId("label");
      expect(label).toBeInTheDocument();
    });

    it("deve renderizar com texto", () => {
      render(<Label>Nome do usuário</Label>);
      expect(screen.getByText("Nome do usuário")).toBeInTheDocument();
    });

    it("deve ter as classes CSS padrão", () => {
      render(<Label>Nome do usuário</Label>);
      const label = screen.getByText("Nome do usuário");
      expect(label).toHaveClass(
        "text-sm",
        "font-medium",
        "leading-none",
        "peer-disabled:cursor-not-allowed",
        "peer-disabled:opacity-70"
      );
    });
  });

  describe("Props Básicas", () => {
    it("deve aceitar className customizada", () => {
      render(<Label className="custom-class">Nome do usuário</Label>);
      const label = screen.getByText("Nome do usuário");
      expect(label).toHaveClass("custom-class");
    });

    it("deve aceitar id customizado", () => {
      render(<Label id="custom-id">Nome do usuário</Label>);
      const label = screen.getByText("Nome do usuário");
      expect(label).toHaveAttribute("id", "custom-id");
    });

    it("deve aceitar htmlFor", () => {
      render(<Label htmlFor="input-id">Nome do usuário</Label>);
      const label = screen.getByText("Nome do usuário");
      expect(label).toHaveAttribute("for", "input-id");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter o elemento label por padrão", () => {
      render(<Label>Nome do usuário</Label>);
      const label = screen.getByText("Nome do usuário");
      expect(label.tagName).toBe("LABEL");
    });

    it("deve aceitar aria-label", () => {
      render(<Label aria-label="Label acessível">Nome do usuário</Label>);
      const label = screen.getByText("Nome do usuário");
      expect(label).toHaveAttribute("aria-label", "Label acessível");
    });

    it("deve aceitar aria-describedby", () => {
      render(<Label aria-describedby="descricao">Nome do usuário</Label>);
      const label = screen.getByText("Nome do usuário");
      expect(label).toHaveAttribute("aria-describedby", "descricao");
    });
  });

  describe("Ref Forwarding", () => {
    it("deve encaminhar ref corretamente", () => {
      const ref = React.createRef<HTMLLabelElement>();
      render(<Label ref={ref}>Nome do usuário</Label>);
      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });
  });

  describe("Comportamento com asChild", () => {
    it("deve aceitar asChild", () => {
      render(
        <Label asChild>
          <span>Nome do usuário</span>
        </Label>
      );
      const span = screen.getByText("Nome do usuário");
      expect(span.tagName).toBe("SPAN");
    });

    it("deve aplicar classes ao elemento filho quando asChild é true", () => {
      render(
        <Label asChild className="custom-label">
          <span>Nome do usuário</span>
        </Label>
      );
      const span = screen.getByText("Nome do usuário");
      expect(span).toHaveClass("custom-label");
    });
  });
});

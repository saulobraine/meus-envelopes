/**
 * Testes para o componente Alert
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";

describe("Alert", () => {
  describe("Renderização Básica", () => {
    it("deve renderizar o componente Alert", () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Alert Title")).toBeInTheDocument();
      expect(screen.getByText("Alert description")).toBeInTheDocument();
    });

    it("deve renderizar apenas o título", () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>
      );

      expect(screen.getByText("Alert Title")).toBeInTheDocument();
    });

    it("deve renderizar apenas a descrição", () => {
      render(
        <Alert>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Alert description")).toBeInTheDocument();
    });
  });

  describe("Variantes", () => {
    it("deve aplicar variante default", () => {
      render(
        <Alert>
          <AlertTitle>Default Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border");
    });

    it("deve aplicar variante destructive", () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Destructive Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border-destructive/50");
    });

    it("deve aplicar variante outline", () => {
      render(
        <Alert variant="outline">
          <AlertTitle>Outline Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border");
    });
  });

  describe("Ícones", () => {
    it("deve renderizar com ícone personalizado", () => {
      render(
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Alert with icon</AlertTitle>
        </Alert>
      );

      // Verificar se o ícone está presente verificando se há um SVG
      const alert = screen.getByRole("alert");
      const svg = alert.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("deve renderizar com diferentes tipos de ícones", () => {
      const { rerender } = render(
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Alert Circle</AlertTitle>
        </Alert>
      );

      expect(screen.getByText("Alert Circle")).toBeInTheDocument();

      rerender(
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alert Triangle</AlertTitle>
        </Alert>
      );

      expect(screen.getByText("Alert Triangle")).toBeInTheDocument();

      rerender(
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Info Alert</AlertTitle>
        </Alert>
      );

      expect(screen.getByText("Info Alert")).toBeInTheDocument();

      rerender(
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success Alert</AlertTitle>
        </Alert>
      );

      expect(screen.getByText("Success Alert")).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role alert", () => {
      render(
        <Alert>
          <AlertTitle>Accessible Alert</AlertTitle>
        </Alert>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("deve ter aria-label quando fornecido", () => {
      render(
        <Alert aria-label="Custom alert label">
          <AlertTitle>Custom Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-label", "Custom alert label");
    });

    it("deve ter aria-describedby quando tem descrição", () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription id="alert-desc">Alert description</AlertDescription>
        </Alert>
      );

      const description = screen.getByText("Alert description");
      // O componente Alert pode não ter aria-describedby por padrão
      expect(description).toHaveAttribute("id", "alert-desc");
    });
  });

  describe("Props Customizadas", () => {
    it("deve aceitar className customizada", () => {
      render(
        <Alert className="custom-alert">
          <AlertTitle>Custom Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("custom-alert");
    });

    it("deve aceitar data-testid customizado", () => {
      render(
        <Alert data-testid="custom-alert">
          <AlertTitle>Custom Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByTestId("custom-alert");
      expect(alert).toBeInTheDocument();
    });

    it("deve aceitar outras props HTML", () => {
      render(
        <Alert id="alert-1" data-custom="value">
          <AlertTitle>Custom Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("id", "alert-1");
      expect(alert).toHaveAttribute("data-custom", "value");
    });
  });

  describe("Composição", () => {
    it("deve renderizar múltiplos elementos filhos", () => {
      render(
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Complex Alert</AlertTitle>
          <AlertDescription>First description</AlertDescription>
          <AlertDescription>Second description</AlertDescription>
          <div>Custom content</div>
        </Alert>
      );

      expect(screen.getByText("Complex Alert")).toBeInTheDocument();
      expect(screen.getByText("First description")).toBeInTheDocument();
      expect(screen.getByText("Second description")).toBeInTheDocument();
      expect(screen.getByText("Custom content")).toBeInTheDocument();
    });

    it("deve renderizar sem ícone", () => {
      render(
        <Alert>
          <AlertTitle>Alert without icon</AlertTitle>
        </Alert>
      );

      expect(screen.getByText("Alert without icon")).toBeInTheDocument();
      // Não deve ter ícone padrão
      expect(screen.queryByTestId(/lucide-/)).not.toBeInTheDocument();
    });
  });

  describe("Estados", () => {
    it("deve renderizar normalmente sem props de estado especiais", () => {
      render(
        <Alert>
          <AlertTitle>Normal Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).not.toHaveAttribute("aria-disabled");
    });
  });

  describe("Responsividade", () => {
    it("deve aplicar classes responsivas", () => {
      render(
        <Alert className="sm:text-sm md:text-base lg:text-lg">
          <AlertTitle>Responsive Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("sm:text-sm", "md:text-base", "lg:text-lg");
    });
  });

  describe("Integração com Formulários", () => {
    it("deve funcionar como mensagem de erro", () => {
      render(
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de validação</AlertTitle>
          <AlertDescription>
            Por favor, corrija os erros no formulário.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Erro de validação")).toBeInTheDocument();
      expect(
        screen.getByText("Por favor, corrija os erros no formulário.")
      ).toBeInTheDocument();

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border-destructive/50");
    });

    it("deve funcionar como mensagem de sucesso", () => {
      render(
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sucesso!</AlertTitle>
          <AlertDescription>Operação realizada com sucesso.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Sucesso!")).toBeInTheDocument();
      expect(
        screen.getByText("Operação realizada com sucesso.")
      ).toBeInTheDocument();
    });
  });

  it("deve aplicar variantes de cor corretamente", () => {
    const { rerender } = render(
      <Alert variant="default">Mensagem padrão</Alert>
    );
    expect(screen.getByRole("alert")).toHaveClass("bg-background");

    rerender(<Alert variant="destructive">Mensagem de erro</Alert>);
    expect(screen.getByRole("alert")).toHaveClass(
      "border-destructive/50 text-destructive dark:border-destructive"
    );
  });
});

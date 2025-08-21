import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  describe("Renderização Básica", () => {
    it("deve renderizar o componente Button", () => {
      render(<Button data-testid="button">Clique aqui</Button>);
      const button = screen.getByTestId("button");
      expect(button).toBeInTheDocument();
    });

    it("deve renderizar com texto", () => {
      render(<Button>Clique aqui</Button>);
      const button = screen.getByRole("button", { name: /clique aqui/i });
      expect(button).toBeInTheDocument();
    });

    it("deve ter o role button por padrão", () => {
      render(<Button>Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Estados", () => {
    it("deve estar habilitado por padrão", () => {
      render(<Button>Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    it("deve estar desabilitado quando disabled é true", () => {
      render(<Button disabled>Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Variantes", () => {
    it("deve usar variante default quando não especificada", () => {
      render(<Button>Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "inline-flex",
        "items-center",
        "justify-center"
      );
    });

    it("deve aplicar variante destructive", () => {
      render(<Button variant="destructive">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "bg-destructive",
        "text-destructive-foreground"
      );
    });

    it("deve aplicar variante outline", () => {
      render(<Button variant="outline">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "border-input", "bg-background");
    });

    it("deve aplicar variante secondary", () => {
      render(<Button variant="secondary">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("deve aplicar variante ghost", () => {
      render(<Button variant="ghost">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "hover:bg-accent",
        "hover:text-accent-foreground"
      );
    });

    it("deve aplicar variante link", () => {
      render(<Button variant="link">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-primary", "underline-offset-4");
    });
  });

  describe("Tamanhos", () => {
    it("deve usar tamanho default quando não especificado", () => {
      render(<Button>Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10", "px-4", "py-2");
    });

    it("deve aplicar tamanho sm", () => {
      render(<Button size="sm">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9", "rounded-md", "px-3");
    });

    it("deve aplicar tamanho lg", () => {
      render(<Button size="lg">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-11", "rounded-md", "px-8");
    });

    it("deve aplicar tamanho icon", () => {
      render(<Button size="icon">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10", "w-10");
    });
  });

  describe("Props Adicionais", () => {
    it("deve aceitar className customizada", () => {
      render(<Button className="custom-class">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("deve aceitar id customizado", () => {
      render(<Button id="custom-id">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("id", "custom-id");
    });

    it("deve aceitar type customizado", () => {
      render(<Button type="submit">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("deve aceitar data-testid customizado", () => {
      render(<Button data-testid="custom-button">Clique aqui</Button>);
      const button = screen.getByTestId("custom-button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter aria-label quando fornecido", () => {
      render(<Button aria-label="Botão acessível">Clique aqui</Button>);
      const button = screen.getByRole("button", { name: /botão acessível/i });
      expect(button).toBeInTheDocument();
    });

    it("deve ter aria-describedby quando fornecido", () => {
      render(<Button aria-describedby="descricao">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-describedby", "descricao");
    });

    it("deve ter aria-pressed quando fornecido", () => {
      render(<Button aria-pressed="true">Clique aqui</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Ref Forwarding", () => {
    it("deve encaminhar ref corretamente", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Clique aqui</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});

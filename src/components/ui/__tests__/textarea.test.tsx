/**
 * Testes para o componente Textarea
 *
 * Este arquivo testa as funcionalidades básicas do Textarea:
 * - Renderização
 * - Props básicas
 * - Acessibilidade
 * - Ref forwarding
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea Component", () => {
  describe("Renderização Básica", () => {
    it("deve renderizar o componente Textarea", () => {
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toBeInTheDocument();
    });

    it("deve renderizar com placeholder", () => {
      render(<Textarea placeholder="Digite aqui" />);

      const textarea = screen.getByPlaceholderText("Digite aqui");
      expect(textarea).toBeInTheDocument();
    });

    it("deve renderizar com valor", () => {
      render(<Textarea defaultValue="Texto inicial" />);

      const textarea = screen.getByDisplayValue("Texto inicial");
      expect(textarea).toBeInTheDocument();
    });

    it("deve renderizar com value controlado", () => {
      render(<Textarea value="Texto controlado" onChange={() => {}} />);

      const textarea = screen.getByDisplayValue("Texto controlado");
      expect(textarea).toBeInTheDocument();
    });
  });

  describe("Props Básicas", () => {
    it("deve aceitar className customizada", () => {
      render(<Textarea className="custom-textarea" data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveClass("custom-textarea");
    });

    it("deve aceitar id customizado", () => {
      render(<Textarea id="custom-id" data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("id", "custom-id");
    });

    it("deve aceitar name customizado", () => {
      render(<Textarea name="custom-name" data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("name", "custom-name");
    });

    it("deve aceitar placeholder customizado", () => {
      render(<Textarea placeholder="Placeholder customizado" />);

      const textarea = screen.getByPlaceholderText("Placeholder customizado");
      expect(textarea).toBeInTheDocument();
    });

    it("deve aceitar rows customizado", () => {
      render(<Textarea rows={5} data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("rows", "5");
    });

    it("deve aceitar cols customizado", () => {
      render(<Textarea cols={50} data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("cols", "50");
    });

    it("deve aceitar maxLength", () => {
      render(<Textarea maxLength={100} data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("maxLength", "100");
    });

    it("deve aceitar minLength", () => {
      render(<Textarea minLength={10} data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("minLength", "10");
    });
  });

  describe("Estados", () => {
    it("deve estar habilitado por padrão", () => {
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).not.toBeDisabled();
    });

    it("deve estar desabilitado quando disabled é true", () => {
      render(<Textarea disabled data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toBeDisabled();
    });

    it("deve estar readonly quando readOnly é true", () => {
      render(<Textarea readOnly data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("readonly");
    });

    it("deve estar required quando required é true", () => {
      render(<Textarea required data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("required");
    });
  });

  describe("Classes CSS Padrão", () => {
    it("deve ter classes CSS padrão", () => {
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveClass(
        "flex",
        "min-h-[80px]",
        "w-full",
        "rounded-md",
        "border",
        "border-input",
        "bg-background",
        "px-3",
        "py-2",
        "text-sm",
        "ring-offset-background",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-hidden",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50"
      );
    });

    it("deve combinar classes padrão com className customizada", () => {
      render(<Textarea className="custom-class" data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveClass("custom-class");
      expect(textarea).toHaveClass("flex", "min-h-[80px]", "w-full");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role textbox", () => {
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("deve ter aria-label quando fornecido", () => {
      render(
        <Textarea aria-label="Descrição do campo" data-testid="textarea" />
      );

      const textarea = screen.getByRole("textbox", {
        name: /descrição do campo/i,
      });
      expect(textarea).toBeInTheDocument();
    });

    it("deve ter aria-describedby quando fornecido", () => {
      render(<Textarea aria-describedby="descricao" data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("aria-describedby", "descricao");
    });

    it("deve ter aria-invalid quando fornecido", () => {
      render(<Textarea aria-invalid="true" data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("deve ter required quando required é true", () => {
      render(<Textarea required data-testid="textarea" />);

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("required");
    });
  });

  describe("Ref Forwarding", () => {
    it("deve encaminhar ref corretamente", () => {
      const ref = React.createRef<HTMLTextAreaElement>();

      render(<Textarea ref={ref} data-testid="textarea" />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });

  describe("Casos Especiais", () => {
    it("deve aceitar todas as props HTML padrão", () => {
      render(
        <Textarea
          data-testid="textarea"
          autoComplete="off"
          form="test-form"
          spellCheck={false}
        />
      );

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toHaveAttribute("autoComplete", "off");
      expect(textarea).toHaveAttribute("form", "test-form");
      expect(textarea).toHaveAttribute("spellCheck", "false");
    });

    it("deve aceitar eventos customizados", () => {
      const mockOnChange = jest.fn();
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();

      render(
        <Textarea
          data-testid="textarea"
          onChange={mockOnChange}
          onFocus={mockOnFocus}
          onBlur={mockOnBlur}
        />
      );

      const textarea = screen.getByTestId("textarea");
      expect(textarea).toBeInTheDocument();
    });

    it("deve aceitar children como conteúdo inicial", () => {
      render(<Textarea>Conteúdo inicial</Textarea>);

      const textarea = screen.getByDisplayValue("Conteúdo inicial");
      expect(textarea).toBeInTheDocument();
    });
  });
});

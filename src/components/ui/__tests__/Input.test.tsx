import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
  describe("Renderização Básica", () => {
    it("deve renderizar o componente Input", () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId("input");
      expect(input).toBeInTheDocument();
    });

    it("deve renderizar com placeholder", () => {
      render(<Input placeholder="Digite aqui" />);
      const input = screen.getByPlaceholderText("Digite aqui");
      expect(input).toBeInTheDocument();
    });

    it("deve renderizar com valor", () => {
      render(<Input defaultValue="Valor inicial" />);
      const input = screen.getByDisplayValue("Valor inicial");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Tipos de Input", () => {
    it("deve usar tipo text por padrão", () => {
      render(<Input type="text" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("type", "text");
    });

    it("deve aplicar tipo password corretamente", () => {
      render(<Input type="password" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("type", "password");
    });

    it("deve aplicar tipo number corretamente", () => {
      render(<Input type="number" />);
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("type", "number");
    });

    it("deve aplicar tipo email corretamente", () => {
      render(<Input type="email" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("type", "email");
    });

    it("deve aplicar tipo tel corretamente", () => {
      render(<Input type="tel" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("type", "tel");
    });
  });

  describe("Estados", () => {
    it("deve estar habilitado por padrão", () => {
      render(<Input />);
      const input = screen.getByDisplayValue("");
      expect(input).not.toBeDisabled();
    });

    it("deve estar desabilitado quando disabled é true", () => {
      render(<Input disabled />);
      const input = screen.getByDisplayValue("");
      expect(input).toBeDisabled();
    });

    it("deve estar readonly quando readOnly é true", () => {
      render(<Input readOnly />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("readonly");
    });
  });

  describe("Props Adicionais", () => {
    it("deve aceitar className customizada", () => {
      render(<Input className="custom-class" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveClass("custom-class");
    });

    it("deve aceitar id customizado", () => {
      render(<Input id="custom-id" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("id", "custom-id");
    });

    it("deve aceitar name customizado", () => {
      render(<Input name="custom-name" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("name", "custom-name");
    });

    it("deve aceitar required", () => {
      render(<Input required />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("required");
    });

    it("deve aceitar maxLength", () => {
      render(<Input maxLength={10} />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("maxLength", "10");
    });

    it("deve aceitar minLength", () => {
      render(<Input minLength={5} />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("minLength", "5");
    });

    it("deve aceitar pattern", () => {
      render(<Input pattern="[0-9]+" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("pattern", "[0-9]+");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter aria-label quando fornecido", () => {
      render(<Input aria-label="Campo de entrada" />);
      const input = screen.getByRole("textbox", { name: /campo de entrada/i });
      expect(input).toBeInTheDocument();
    });

    it("deve ter aria-describedby quando fornecido", () => {
      render(<Input aria-describedby="descricao" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("aria-describedby", "descricao");
    });

    it("deve ter aria-invalid quando fornecido", () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("deve ter required quando required é true", () => {
      render(<Input required />);
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("required");
    });
  });

  describe("Ref Forwarding", () => {
    it("deve encaminhar ref corretamente", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});

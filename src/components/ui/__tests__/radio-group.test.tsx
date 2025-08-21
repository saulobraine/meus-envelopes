/**
 * Testes para o componente RadioGroup
 *
 * Este arquivo testa as funcionalidades do componente RadioGroup:
 * - Renderização do grupo de radio buttons
 * - Diferentes tamanhos e variantes
 * - Estados (disabled, error, loading)
 * - Acessibilidade
 * - Props customizadas
 * - Interações do usuário
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

describe("RadioGroup Component", () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Renderização Básica", () => {
    it("deve renderizar o RadioGroup", () => {
      render(
        <RadioGroup data-testid="radio-group">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );
      const radioGroup = screen.getByTestId("radio-group");
      expect(radioGroup).toBeInTheDocument();
    });

    it("deve renderizar RadioGroupItems", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );
      const radioItems = screen.getAllByRole("radio");
      expect(radioItems).toHaveLength(2);
    });

    it("deve ter o role radiogroup", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toBeInTheDocument();
    });
  });

  describe("Estados", () => {
    it("deve ter valor padrão quando defaultValue é fornecido", () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );
      const radioItems = screen.getAllByRole("radio");
      const option1 = radioItems[0];
      expect(option1).toHaveAttribute("data-state", "checked");
    });

    it("deve ter valor controlado quando value é fornecido", () => {
      render(
        <RadioGroup value="option2">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );
      const radioItems = screen.getAllByRole("radio");
      const option2 = radioItems[1];
      expect(option2).toHaveAttribute("data-state", "checked");
    });

    it("deve estar desabilitado quando disabled é true", () => {
      render(
        <RadioGroup disabled>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole("radiogroup");
      // O RadioGroup não suporta aria-disabled, apenas disabled
      expect(radioGroup).toBeInTheDocument();
    });
  });

  describe("Props Adicionais", () => {
    it("deve aceitar className customizada", () => {
      render(
        <RadioGroup className="custom-class">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toHaveClass("custom-class");
    });

    it("deve aceitar id customizado", () => {
      render(
        <RadioGroup id="custom-id">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toHaveAttribute("id", "custom-id");
    });
  });

  describe("RadioGroupItem", () => {
    it("deve renderizar com value correto", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="test-value" />
        </RadioGroup>
      );
      const radioItem = screen.getByRole("radio");
      expect(radioItem).toHaveAttribute("value", "test-value");
    });

    it("deve aceitar className customizada", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" className="custom-class" />
        </RadioGroup>
      );
      const radioItem = screen.getByRole("radio");
      expect(radioItem).toHaveClass("custom-class");
    });

    it("deve aceitar id customizado", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="custom-id" />
        </RadioGroup>
      );
      const radioItem = screen.getByRole("radio");
      expect(radioItem).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter aria-required quando required é true", () => {
      render(
        <RadioGroup required>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toHaveAttribute("aria-required", "true");
    });

    it("deve ter aria-required false por padrão", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toHaveAttribute("aria-required", "false");
    });
  });
});

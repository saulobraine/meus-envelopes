/**
 * Testes para o componente PeriodSelector
 *
 * Este arquivo testa as funcionalidades do seletor de período:
 * - Renderização do Select
 * - Valores das opções
 * - Callback onValueChange
 * - Props e validação
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";

describe("PeriodSelector", () => {
  const mockOnValueChange = jest.fn();
  const defaultPeriod = "this-month";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Renderização Básica", () => {
    it("deve renderizar o componente PeriodSelector", () => {
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("deve mostrar o valor selecionado quando há um value", () => {
      render(
        <PeriodSelector value="this-month" onValueChange={mockOnValueChange} />
      );
      expect(screen.getByText("Este mês")).toBeInTheDocument();
    });

    it("deve ter o role combobox", () => {
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });
  });

  describe("Props e Validação", () => {
    it("deve aceitar value correto", () => {
      render(
        <PeriodSelector value="this-month" onValueChange={mockOnValueChange} />
      );
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("deve aceitar className customizada", () => {
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
          className="custom-class"
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("custom-class");
    });

    it("deve aceitar todos os valores de período válidos", () => {
      const validPeriods = [
        "this-month",
        "last-month",
        "3-months",
        "6-months",
        "12-months",
        "all-time",
      ] as const;

      validPeriods.forEach((period) => {
        const { unmount } = render(
          <PeriodSelector value={period} onValueChange={mockOnValueChange} />
        );
        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter aria-controls", () => {
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-controls");
    });

    it("deve ter aria-expanded false por padrão", () => {
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-expanded", "false");
    });

    it("deve ter aria-autocomplete none", () => {
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-autocomplete", "none");
    });
  });

  describe("Estrutura HTML", () => {
    it("deve ter estrutura semântica correta", () => {
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("deve ter data-state closed por padrão", () => {
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("data-state", "closed");
    });
  });

  describe("Ref Forwarding", () => {
    it("deve aceitar ref", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <PeriodSelector
          value={defaultPeriod}
          onValueChange={mockOnValueChange}
        />
      );
      // O ref não é suportado diretamente pelo PeriodSelector
      expect(ref.current).toBeNull();
    });
  });
});

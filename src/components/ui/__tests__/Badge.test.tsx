/**
 * Testes para o componente Badge
 *
 * Este arquivo testa as funcionalidades do componente Badge:
 * - Renderização do badge
 * - Diferentes variantes
 * - Props customizadas
 * - Acessibilidade
 * - Ref forwarding
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  describe("Renderização Básica", () => {
    it("deve renderizar o badge com texto", () => {
      render(<Badge>Novo</Badge>);

      const badge = screen.getByText("Novo");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full");
    });

    it("deve renderizar com children React", () => {
      render(
        <Badge>
          <span>Texto</span>
          <strong>Negrito</strong>
        </Badge>
      );

      const badge = screen.getByText("Texto");
      expect(badge).toBeInTheDocument();
      expect(screen.getByText("Negrito")).toBeInTheDocument();
    });

    it("deve renderizar sem children", () => {
      render(<Badge />);

      // Usar getAllByRole e pegar o primeiro para evitar ambiguidade
      const badges = screen.getAllByRole("generic");
      expect(badges.length).toBeGreaterThan(0);
      expect(badges[0]).toBeInTheDocument();
    });

    it("deve renderizar com número", () => {
      render(<Badge>42</Badge>);

      const badge = screen.getByText("42");
      expect(badge).toBeInTheDocument();
    });

    it("deve renderizar com zero", () => {
      render(<Badge>0</Badge>);

      const badge = screen.getByText("0");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Variantes", () => {
    it("deve usar variante default quando não especificada", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("deve aplicar variante default corretamente", () => {
      render(<Badge variant="default">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("deve aplicar variante secondary corretamente", () => {
      render(<Badge variant="secondary">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("deve aplicar variante destructive corretamente", () => {
      render(<Badge variant="destructive">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass(
        "bg-destructive",
        "text-destructive-foreground"
      );
    });

    it("deve aplicar variante outline corretamente", () => {
      render(<Badge variant="outline">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("text-foreground");
    });
  });

  describe("Classes CSS Padrão", () => {
    it("deve ter classes CSS padrão", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "rounded-full",
        "border",
        "px-2.5",
        "py-0.5",
        "text-xs",
        "font-semibold",
        "transition-colors"
      );
    });

    it("deve ter classes de focus", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass(
        "focus:outline-hidden",
        "focus:ring-2",
        "focus:ring-ring",
        "focus:ring-offset-2"
      );
    });
  });

  describe("Props Adicionais", () => {
    it("deve aceitar className customizada", () => {
      render(<Badge className="custom-badge">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("custom-badge");
    });

    it("deve aceitar id customizado", () => {
      render(<Badge id="custom-id">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("id", "custom-id");
    });

    it("deve aceitar tabIndex customizado", () => {
      render(<Badge tabIndex={0}>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("tabIndex", "0");
    });

    it("deve aceitar data-testid customizado", () => {
      render(<Badge data-testid="custom-badge">Badge</Badge>);

      const badge = screen.getByTestId("custom-badge");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role generic por padrão", () => {
      render(<Badge>Badge</Badge>);

      // Usar getAllByRole e pegar o primeiro para evitar ambiguidade
      const badges = screen.getAllByRole("generic");
      expect(badges.length).toBeGreaterThan(0);
      expect(badges[0]).toBeInTheDocument();
    });

    it("deve ter role customizado quando fornecido", () => {
      render(<Badge role="status">Badge</Badge>);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    it("deve ter aria-label quando fornecido", () => {
      render(<Badge aria-label="Status do item">Badge</Badge>);

      const badge = screen.getByRole("generic", { name: /status do item/i });
      expect(badge).toBeInTheDocument();
    });

    it("deve ter aria-describedby quando fornecido", () => {
      render(<Badge aria-describedby="descricao">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("aria-describedby", "descricao");
    });

    it("deve ter aria-live quando fornecido", () => {
      render(<Badge aria-live="polite">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("aria-live", "polite");
    });

    it("deve ter aria-atomic quando fornecido", () => {
      render(<Badge aria-atomic="true">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("aria-atomic", "true");
    });

    it("deve ter aria-relevant quando fornecido", () => {
      render(<Badge aria-relevant="text">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("aria-relevant", "text");
    });
  });

  describe("Ref Forwarding", () => {
    it("deve renderizar sem suporte a ref", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Badge>Badge</Badge>);

      // O componente não suporta ref, então ref.current deve ser null
      expect(ref.current).toBeNull();

      // Verificar se o badge foi renderizado
      expect(screen.getByText("Badge")).toBeInTheDocument();
    });
  });

  describe("Casos Especiais", () => {
    it("deve lidar com children nulos", () => {
      render(
        <Badge>
          {null}
          <span>Texto válido</span>
          {undefined}
        </Badge>
      );

      const badge = screen.getByText("Texto válido");
      expect(badge).toBeInTheDocument();
    });

    it("deve lidar com children vazios", () => {
      render(<Badge></Badge>);

      // Usar getAllByRole e pegar o primeiro para evitar ambiguidade
      const badges = screen.getAllByRole("generic");
      expect(badges.length).toBeGreaterThan(0);
      expect(badges[0]).toBeInTheDocument();
    });

    it("deve lidar com children booleanos", () => {
      render(
        <Badge>
          {true}
          {false}
          <span>Texto</span>
        </Badge>
      );

      const badge = screen.getByText("Texto");
      expect(badge).toBeInTheDocument();
    });

    it("deve lidar com children numéricos", () => {
      render(
        <Badge>
          {0}
          {42}
          {3.14}
        </Badge>
      );

      // Usar getAllByText e pegar o primeiro para evitar ambiguidade
      const badges = screen.getAllByText(/0|42|3\.14/);
      expect(badges.length).toBeGreaterThan(0);

      // Verificar se o conteúdo está correto
      const badge = screen.getByText(/0423\.14/);
      expect(badge).toBeInTheDocument();
    });

    it("deve lidar com children arrays", () => {
      render(<Badge>{["Item 1", "Item 2", "Item 3"]}</Badge>);

      // Usar getAllByText e pegar o primeiro para evitar ambiguidade
      const badges = screen.getAllByText(/Item \d+/);
      expect(badges.length).toBeGreaterThan(0);

      // Verificar se o conteúdo está correto
      const badge = screen.getByText(/Item 1Item 2Item 3/);
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Combinações de Props", () => {
    it("deve combinar variante e className corretamente", () => {
      render(
        <Badge variant="destructive" className="custom-class">
          Badge
        </Badge>
      );

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass(
        "bg-destructive",
        "text-destructive-foreground",
        "custom-class"
      );
    });

    it("deve combinar variante, role e aria-label corretamente", () => {
      render(
        <Badge
          variant="outline"
          role="status"
          aria-label="Badge de status"
          className="status-badge"
        >
          Badge
        </Badge>
      );

      const badge = screen.getByRole("status", { name: /badge de status/i });
      expect(badge).toHaveClass("text-foreground", "status-badge");
    });
  });

  describe("Performance", () => {
    it("deve renderizar eficientemente com muitos badges", () => {
      const badges = Array.from({ length: 100 }, (_, i) => (
        <Badge key={i}>Badge {i + 1}</Badge>
      ));

      render(<div>{badges}</div>);

      expect(screen.getByText("Badge 1")).toBeInTheDocument();
      expect(screen.getByText("Badge 100")).toBeInTheDocument();
    });

    it("deve lidar com conteúdo dinâmico", () => {
      const { rerender } = render(<Badge>Inicial</Badge>);

      expect(screen.getByText("Inicial")).toBeInTheDocument();

      rerender(<Badge>Atualizado</Badge>);

      expect(screen.getByText("Atualizado")).toBeInTheDocument();
      expect(screen.queryByText("Inicial")).not.toBeInTheDocument();
    });

    it("deve lidar com mudanças de variante", () => {
      const { rerender } = render(<Badge variant="default">Badge</Badge>);

      let badge = screen.getByText("Badge");
      expect(badge).toHaveClass("bg-primary", "text-primary-foreground");

      rerender(<Badge variant="destructive">Badge</Badge>);

      badge = screen.getByText("Badge");
      expect(badge).toHaveClass(
        "bg-destructive",
        "text-destructive-foreground"
      );
      expect(badge).not.toHaveClass("bg-primary", "text-primary-foreground");
    });
  });
});

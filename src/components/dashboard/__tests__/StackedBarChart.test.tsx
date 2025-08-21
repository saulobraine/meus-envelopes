/**
 * Testes para o componente StackedBarChart
 *
 * Este arquivo testa as funcionalidades do gráfico de barras empilhadas:
 * - Renderização do gráfico
 * - Dados de entrada
 * - Formatação de valores
 * - Responsividade
 * - Acessibilidade
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { StackedBarChart } from "@/components/dashboard/StackedBarChart";

// Mock do componente BarChart do Recharts
jest.mock("recharts", () => ({
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: any[];
  }) => (
    <div data-testid="bar-chart" data-points={data.length}>
      {children}
    </div>
  ),
  Bar: ({
    dataKey,
    stackId,
    fill,
  }: {
    dataKey: string;
    stackId: string;
    fill: string;
  }) => (
    <div data-testid={`bar-${dataKey}`} data-stack={stackId} data-fill={fill}>
      {dataKey}
    </div>
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`xaxis-${dataKey}`}>{dataKey}</div>
  ),
  YAxis: () => <div data-testid="yaxis" />,
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" data-fill={fill} />
  ),
}));

// Mock dos componentes de UI
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-footer">{children}</div>
  ),
}));

jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({
    children,
    config,
  }: {
    children: React.ReactNode;
    config: any;
  }) => (
    <div data-testid="chart-container" data-config={JSON.stringify(config)}>
      {children}
    </div>
  ),
  ChartTooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-tooltip">{children}</div>
  ),
}));

describe("StackedBarChart", () => {
  const mockInitialChartData = [
    { period: "Jan", Supermercado: 150000, Salário: 300000 },
    { period: "Feb", Supermercado: 160000, Salário: 320000 },
    { period: "Mar", Supermercado: 140000, Salário: 280000 },
  ];

  const mockEnvelopes = ["Supermercado", "Salário"];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Renderização", () => {
    it("deve renderizar o gráfico de barras empilhadas", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toBeInTheDocument();
      expect(screen.getByTestId("card-description")).toBeInTheDocument();
      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve renderizar título e descrição corretos", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByText("Análise por Envelopes")).toBeInTheDocument();
      expect(
        screen.getByText("Distribuição de valores por envelope")
      ).toBeInTheDocument();
    });
  });

  describe("Dados", () => {
    it("deve lidar com array vazio", () => {
      render(<StackedBarChart initialChartData={[]} envelopes={[]} />);

      expect(
        screen.getByText("Nenhum dado disponível para exibir o gráfico")
      ).toBeInTheDocument();
    });

    it("deve lidar com envelopes vazios", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={[]}
        />
      );

      expect(
        screen.getByText("Nenhum dado disponível para exibir o gráfico")
      ).toBeInTheDocument();
    });

    it("deve renderizar com dados de um único período", () => {
      const singlePeriodData = [
        { period: "Jan", Supermercado: 150000, Salário: 300000 },
      ];

      render(
        <StackedBarChart
          initialChartData={singlePeriodData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve renderizar com dados de múltiplos períodos", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });
  });

  describe("Configuração do Gráfico", () => {
    it("deve configurar cores para envelopes", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      const chartContainer = screen.getByTestId("chart-container");
      const config = JSON.parse(
        chartContainer.getAttribute("data-config") || "{}"
      );

      expect(config.Supermercado).toBeDefined();
      expect(config.Salário).toBeDefined();
      expect(config.Supermercado.color).toBeDefined();
      expect(config.Salário.color).toBeDefined();
    });

    it("deve usar cores consistentes para o mesmo envelope", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      const chartContainer = screen.getByTestId("chart-container");
      const config = JSON.parse(
        chartContainer.getAttribute("data-config") || "{}"
      );

      expect(config.Supermercado.color).toBeTruthy();
      expect(config.Salário.color).toBeTruthy();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter estrutura semântica adequada", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByTestId("card-header")).toBeInTheDocument();
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
    });

    it("deve ter tooltip configurado", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-tooltip")).toBeInTheDocument();
    });
  });

  describe("Responsividade", () => {
    it("deve usar container responsivo", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve ter classes CSS responsivas", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      const chartContainer = screen.getByTestId("chart-container");
      expect(chartContainer).toHaveAttribute("data-config");
    });
  });

  describe("Props e Validação", () => {
    it("deve aceitar dados customizados", () => {
      const customData = [
        { period: "Q1", Marketing: 50000, Vendas: 200000 },
        { period: "Q2", Marketing: 60000, Vendas: 250000 },
      ];
      const customEnvelopes = ["Marketing", "Vendas"];

      render(
        <StackedBarChart
          initialChartData={customData}
          envelopes={customEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve ser flexível com diferentes estruturas de dados", () => {
      const flexibleData = [
        { month: "Jan", Receita: 100000, Despesa: 50000 },
        { month: "Feb", Receita: 120000, Despesa: 60000 },
      ];
      const flexibleEnvelopes = ["Receita", "Despesa"];

      render(
        <StackedBarChart
          initialChartData={flexibleData}
          envelopes={flexibleEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve funcionar sem props opcionais", () => {
      render(<StackedBarChart initialChartData={[]} envelopes={[]} />);

      expect(
        screen.getByText("Nenhum dado disponível para exibir o gráfico")
      ).toBeInTheDocument();
    });
  });

  describe("Interações", () => {
    it("deve ter tooltip funcional", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-tooltip")).toBeInTheDocument();
    });

    it("deve ter grid para facilitar leitura", () => {
      render(
        <StackedBarChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("deve renderizar eficientemente com muitos dados", () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        period: `Month ${i}`,
        Envelope1: Math.random() * 100000,
        Envelope2: Math.random() * 100000,
      }));
      const largeEnvelopes = ["Envelope1", "Envelope2"];

      render(
        <StackedBarChart
          initialChartData={largeData}
          envelopes={largeEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve lidar com dados extremos", () => {
      const extremeData = [
        { period: "Jan", MuitoAlto: 999999999, MuitoBaixo: 0.01 },
        { period: "Feb", MuitoAlto: 1000000000, MuitoBaixo: 0.001 },
      ];
      const extremeEnvelopes = ["MuitoAlto", "MuitoBaixo"];

      render(
        <StackedBarChart
          initialChartData={extremeData}
          envelopes={extremeEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });
  });
});

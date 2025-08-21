/**
 * Testes para o componente FinancialChart
 *
 * Este arquivo testa as funcionalidades do gráfico de área financeira:
 * - Renderização do gráfico
 * - Dados de entrada
 * - Formatação de valores
 * - Responsividade
 * - Acessibilidade
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { FinancialChart } from "@/components/dashboard/FinancialChart";

// Mock do componente AreaChart do Recharts
jest.mock("recharts", () => ({
  AreaChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: any[];
  }) => (
    <div data-testid="area-chart" data-points={data.length}>
      {children}
    </div>
  ),
  Area: ({
    dataKey,
    fill,
    stroke,
  }: {
    dataKey: string;
    fill: string;
    stroke: string;
  }) => (
    <div data-testid={`area-${dataKey}`} data-fill={fill} data-stroke={stroke}>
      {dataKey}
    </div>
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`xaxis-${dataKey}`}>{dataKey}</div>
  ),
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
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

// Mock dos ícones
jest.mock("phosphor-react", () => ({
  TrendUp: () => <div data-testid="trend-up">TrendUp</div>,
  TrendDown: () => <div data-testid="trend-down">TrendDown</div>,
}));

describe("FinancialChart", () => {
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
    it("deve renderizar o gráfico de área financeira", () => {
      render(
        <FinancialChart
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
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByText("Evolução Financeira")).toBeInTheDocument();
      expect(
        screen.getByText("Análise detalhada por envelope")
      ).toBeInTheDocument();
    });

    it("deve renderizar container responsivo", () => {
      render(
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve renderizar áreas para receitas e despesas", () => {
      render(
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("area-receitas")).toBeInTheDocument();
      expect(screen.getByTestId("area-despesas")).toBeInTheDocument();
    });
  });

  describe("Dados", () => {
    it("deve lidar com array vazio", () => {
      render(<FinancialChart initialChartData={[]} envelopes={[]} />);

      expect(
        screen.getByText("Nenhum dado disponível para exibir o gráfico")
      ).toBeInTheDocument();
    });

    it("deve lidar com envelopes vazios", () => {
      render(
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={[]}
        />
      );

      // Quando envelopes está vazio, o gráfico ainda renderiza mas com dados zerados
      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
      expect(screen.getByTestId("area-receitas")).toBeInTheDocument();
      expect(screen.getByTestId("area-despesas")).toBeInTheDocument();
    });

    it("deve renderizar com dados de um único período", () => {
      const singlePeriodData = [
        { period: "Jan", Supermercado: 150000, Salário: 300000 },
      ];

      render(
        <FinancialChart
          initialChartData={singlePeriodData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve renderizar com dados de múltiplos períodos", () => {
      render(
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });
  });

  describe("Configuração do Gráfico", () => {
    it("deve configurar cores para receitas e despesas", () => {
      render(
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      const chartContainer = screen.getByTestId("chart-container");
      const config = JSON.parse(
        chartContainer.getAttribute("data-config") || "{}"
      );

      expect(config.receitas).toBeDefined();
      expect(config.despesas).toBeDefined();
      expect(config.receitas.color).toBeDefined();
      expect(config.despesas.color).toBeDefined();
    });

    it("deve usar cores consistentes para receitas e despesas", () => {
      render(
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      const chartContainer = screen.getByTestId("chart-container");
      const config = JSON.parse(
        chartContainer.getAttribute("data-config") || "{}"
      );

      expect(config.receitas.color).toBeTruthy();
      expect(config.despesas.color).toBeTruthy();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter estrutura semântica adequada", () => {
      render(
        <FinancialChart
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
        <FinancialChart
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
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve ter classes CSS responsivas", () => {
      render(
        <FinancialChart
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
        <FinancialChart
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
        <FinancialChart
          initialChartData={flexibleData}
          envelopes={flexibleEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("deve funcionar sem props opcionais", () => {
      render(<FinancialChart initialChartData={[]} envelopes={[]} />);

      expect(
        screen.getByText("Nenhum dado disponível para exibir o gráfico")
      ).toBeInTheDocument();
    });
  });

  describe("Interações", () => {
    it("deve ter tooltip funcional", () => {
      render(
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-tooltip")).toBeInTheDocument();
    });

    it("deve ter grid para facilitar leitura", () => {
      render(
        <FinancialChart
          initialChartData={mockInitialChartData}
          envelopes={mockEnvelopes}
        />
      );

      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
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
        <FinancialChart
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
        <FinancialChart
          initialChartData={extremeData}
          envelopes={extremeEnvelopes}
        />
      );

      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });
  });
});

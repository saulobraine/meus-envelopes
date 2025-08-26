/**
 * Testes para o componente OverviewCards
 *
 * Este arquivo testa as funcionalidades básicas dos cards de overview do dashboard.
 */

// Mocks devem vir antes das importações
jest.mock("@/app/_actions/dashboard/getDashboardOverview", () => ({
  getDashboardOverview: jest.fn(),
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(() => ({
    user: { id: "test-user-123", email: "test@example.com" },
    isAuthenticated: true,
    loading: false,
  })),
}));

jest.mock("@/lib/currency", () => ({
  formatCurrency: jest.fn((value: number) => `R$ ${(value / 100).toFixed(2)}`),
}));

jest.mock("@/lib/utils", () => ({
  ColorUtility: {
    getTrendColorClass: jest.fn(() => "text-green-500"),
    getValueColorClass: jest.fn(() => "text-green-500"),
  },
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { getDashboardOverview } from "@/app/_actions/dashboard/getDashboardOverview";

// Mock da action getDashboardOverview
const mockGetDashboardOverview = getDashboardOverview as jest.Mock;

// Mock dos componentes de UI
jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`card ${className || ""}`} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`card-header ${className || ""}`} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`card-title ${className || ""}`} {...props}>
      {children}
    </div>
  ),
}));

describe("OverviewCards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente sem erros", async () => {
    const mockOverviewData = {
      totalBalance: 150000,
      monthlyIncome: 300000,
      monthlyExpenses: 150000,
      amountToReceive: 50000,
      generalBalance: 200000,
      incomeChange: { value: 10, isPositive: true, stringValue: "+10%" },
      expensesChange: { value: 5, isPositive: false, stringValue: "-5%" },
      balanceChange: { value: 15, isPositive: true, stringValue: "+15%" },
    };

    mockGetDashboardOverview.mockResolvedValue(mockOverviewData);

    render(<OverviewCards />);

    // Aguardar que o componente carregue
    await waitFor(
      () => {
        expect(screen.getByText(/saldo líquido/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Verificar se os cards principais estão sendo renderizados
    expect(screen.getByText(/entradas/i)).toBeInTheDocument();
    expect(screen.getByText(/saídas/i)).toBeInTheDocument();
    expect(screen.getByText(/a receber/i)).toBeInTheDocument();
    expect(screen.getByText(/saldo geral/i)).toBeInTheDocument();
  });

  it("deve lidar com erro ao carregar dados", async () => {
    mockGetDashboardOverview.mockRejectedValue(new Error("Erro de rede"));

    render(<OverviewCards />);

    // O componente não mostra mensagem de erro, apenas valores zerados
    // Vamos verificar se ele renderiza com valores padrão
    await waitFor(
      () => {
        expect(screen.getByText(/saldo líquido/i)).toBeInTheDocument();
        expect(screen.getByText(/entradas/i)).toBeInTheDocument();
        expect(screen.getByText(/saídas/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Verificar se os valores estão zerados (estado de erro)
    // Usar getAllByText pois há múltiplos elementos com R$ 0.00
    const zeroValues = screen.getAllByText("R$ 0.00");
    expect(zeroValues.length).toBeGreaterThan(0);
  });

  it("deve aceitar período customizado como prop", async () => {
    const mockOverviewData = {
      totalBalance: 150000,
      monthlyIncome: 300000,
      monthlyExpenses: 150000,
      amountToReceive: 50000,
      generalBalance: 200000,
      incomeChange: { value: 10, isPositive: true, stringValue: "+10%" },
      expensesChange: { value: 5, isPositive: false, stringValue: "-5%" },
      balanceChange: { value: 15, isPositive: true, stringValue: "+15%" },
    };

    mockGetDashboardOverview.mockResolvedValue(mockOverviewData);

    render(<OverviewCards period="this-month" />);

    await waitFor(
      () => {
        expect(mockGetDashboardOverview).toHaveBeenCalledWith("this-month");
      },
      { timeout: 5000 }
    );
  });
});

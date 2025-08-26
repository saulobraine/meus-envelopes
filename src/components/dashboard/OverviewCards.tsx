"use client";

import { Card } from "@/components/ui/card";
import {
  CurrencyDollar,
  TrendUp,
  TrendDown,
  CreditCard,
  Receipt,
  Cardholder,
} from "phosphor-react";
import { getDashboardOverview } from "@/app/_actions/dashboard/getDashboardOverview";
import { useEffect, useState } from "react";
import { ColorUtility } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";

interface PercentageChange {
  value: number;
  isPositive: boolean;
  stringValue: string;
}

interface OverviewCardsProps {
  period?:
    | "7-days"
    | "this-month"
    | "last-month"
    | "3-months"
    | "6-months"
    | "12-months"
    | "all-time";
}

export const OverviewCards = ({
  period = "this-month",
}: OverviewCardsProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [data, setData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    amountToReceive: 0,
    generalBalance: 0,
    incomeChange: {
      value: 0,
      isPositive: true,
      stringValue: "0%",
    } as PercentageChange,
    expensesChange: {
      value: 0,
      isPositive: true,
      stringValue: "0%",
    } as PercentageChange,
    balanceChange: {
      value: 0,
      isPositive: true,
      stringValue: "0%",
    } as PercentageChange,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!isAuthenticated || authLoading) return;

    const fetchData = async () => {
      try {
        const result = await getDashboardOverview(period);
        setData(result);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        // If authentication error, redirect to login
        if (
          error instanceof Error &&
          error.message === "User not authenticated."
        ) {
          window.location.href = "/";
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, isAuthenticated, authLoading]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-muted rounded mb-4"></div>
              <div className="h-4 w-24 bg-muted rounded mb-2"></div>
              <div className="h-8 w-32 bg-muted rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Saldo Líquido",
      value: formatCurrency(data.totalBalance), // formatCurrency already handles cents conversion
      change: data.balanceChange.stringValue,
      icon: CurrencyDollar,
      colorClass: ColorUtility.getTrendColorClass(
        data.balanceChange.isPositive
      ),
      valueColorClass: ColorUtility.getValueColorClass(data.totalBalance),
      showTrend: data.balanceChange.value !== 0,
      trendIcon: data.balanceChange.isPositive ? TrendUp : TrendDown,
      trendColorClass: ColorUtility.getTrendColorClass(
        data.balanceChange.isPositive
      ),
    },
    {
      title: "Entradas",
      value: formatCurrency(data.monthlyIncome), // formatCurrency already handles cents conversion
      change: data.incomeChange.stringValue,
      icon: TrendUp,
      colorClass: ColorUtility.getTrendColorClass(data.incomeChange.isPositive),
      valueColorClass: ColorUtility.getValueColorClass(data.monthlyIncome),
      showTrend: data.incomeChange.value !== 0,
      trendIcon: data.incomeChange.isPositive ? TrendUp : TrendDown,
      trendColorClass: ColorUtility.getTrendColorClass(
        data.incomeChange.isPositive
      ),
    },
    {
      title: "Saídas",
      value: formatCurrency(data.monthlyExpenses), // formatCurrency already handles cents conversion
      change: data.expensesChange.stringValue,
      icon: CreditCard,
      colorClass: ColorUtility.getTrendColorClass(
        data.expensesChange.isPositive,
        true
      ), // true = isExpense
      valueColorClass: ColorUtility.getValueColorClass(
        data.monthlyExpenses, // Already positive after Math.abs()
        true
      ),
      showTrend: data.expensesChange.value !== 0,
      trendIcon: data.expensesChange.isPositive ? TrendUp : TrendDown,
      trendColorClass: ColorUtility.getTrendColorClass(
        data.expensesChange.isPositive,
        true
      ),
    },
    {
      title: "A Receber",
      value: formatCurrency(data.amountToReceive), // formatCurrency already handles cents conversion
      change: "",
      icon: Receipt,
      colorClass: "",
      valueColorClass: ColorUtility.getValueColorClass(data.amountToReceive),
      showTrend: false,
      trendIcon: TrendUp,
      trendColorClass: "",
    },
    {
      title: "Saldo Geral",
      value: formatCurrency(data.generalBalance), // formatCurrency already handles cents conversion
      change: "",
      icon: Cardholder,
      colorClass: "",
      valueColorClass: ColorUtility.getValueColorClass(data.generalBalance),
      showTrend: false,
      trendIcon: TrendUp,
      trendColorClass: "",
      isGeneralBalance: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {metrics.map((metric) => (
        <Card
          key={metric.title}
          className={`p-6 ${metric.isGeneralBalance ? "xl:col-span-1 lg:col-span-full md:col-span-2" : ""}`}
        >
          <div className="flex items-center justify-between mb-4">
            <metric.icon className="h-8 w-8 text-secondary" />
            {metric.change && (
              <span className={`text-sm font-medium ${metric.colorClass}`}>
                {metric.change}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <p className={`text-2xl font-bold ${metric.valueColorClass}`}>
              {metric.value}
            </p>
            {metric.showTrend && (
              <metric.trendIcon
                className={`h-5 w-5 ${metric.trendColorClass}`}
              />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

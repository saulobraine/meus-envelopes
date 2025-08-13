"use client";

import { Card } from "@/components/ui/card";
import { CurrencyDollar, TrendUp, CreditCard, Receipt } from "phosphor-react";
import { getDashboardOverview } from "@/app/_actions/dashboard/getDashboardOverview";
import { formatCurrency } from "@/lib/currency";
import { useEffect, useState } from "react";

export const OverviewCards = () => {
  const [data, setData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    amountToReceive: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardOverview();
        setData(result);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      title: "Saldo Total",
      value: formatCurrency(data.totalBalance),
      change: "",
      icon: CurrencyDollar,
      trend: "",
    },
    {
      title: "Entradas",
      value: formatCurrency(data.monthlyIncome),
      change: "",
      icon: TrendUp,
      trend: "",
    },
    {
      title: "Saídas",
      value: formatCurrency(data.monthlyExpenses),
      change: "",
      icon: CreditCard,
      trend: "",
    },
    {
      title: "A Receber",
      value: formatCurrency(data.amountToReceive),
      change: "",
      icon: Receipt,
      trend: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card
          key={metric.title}
          className="p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <metric.icon className="h-8 w-8 text-secondary" />
            <span
              className={`text-sm font-medium ${
                metric.trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {metric.change}
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </h3>
          <p className="text-2xl font-bold mt-1">{metric.value}</p>
        </Card>
      ))}
    </div>
  );
};

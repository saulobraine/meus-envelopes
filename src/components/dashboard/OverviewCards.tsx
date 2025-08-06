import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, Receipt } from "lucide-react";
import { getDashboardOverview } from "@/app/_actions/dashboard/getDashboardOverview";
import { formatCurrency } from "@/lib/utils";

export const OverviewCards = async () => {
  const { totalBalance, monthlyIncome, monthlyExpenses, amountToReceive } =
    await getDashboardOverview();

  const metrics = [
    {
      title: "Saldo Total",
      value: formatCurrency(totalBalance),
      change: "", // Change will be calculated or fetched separately if needed
      icon: DollarSign,
      trend: "",
    },
    {
      title: "Entradas",
      value: formatCurrency(monthlyIncome),
      change: "",
      icon: TrendingUp,
      trend: "",
    },
    {
      title: "Saídas",
      value: formatCurrency(monthlyExpenses),
      change: "",
      icon: CreditCard,
      trend: "",
    },
    {
      title: "A Receber",
      value: formatCurrency(amountToReceive),
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
          className="p-6 hover:shadow-lg transition-shadow"
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

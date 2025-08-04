import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, Receipt } from "lucide-react";

const metrics = [
  {
    title: "Saldo Total",
    value: "R$ 84.950,00",
    change: "+12,3%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Entradas",
    value: "R$ 104.950,00",
    change: "+15,2%",
    icon: TrendingUp,
    trend: "up",
  },
  {
    title: "Saídas",
    value: "R$ 20.000,00",
    change: "-2,5%",
    icon: CreditCard,
    trend: "down",
  },
  {
    title: "A Receber",
    value: "R$ 12.500,00",
    change: "+8,1%",
    icon: Receipt,
    trend: "up",
  },
];

export const OverviewCards = () => {
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

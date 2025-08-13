import { Suspense } from "react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { getFinancialChartData } from "@/app/_actions/dashboard/getFinancialChartData";
import { ChartSkeleton } from "@/components/ui/skeletons";

export default async function DashboardPage() {
  const initialChartData = await getFinancialChartData("this-month");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo ao seu Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe suas finanças em um só lugar
        </p>
      </div>
      <OverviewCards />
      <Suspense fallback={<ChartSkeleton />}>
        <div className="p-6 mt-6 bg-card rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Evolução Patrimonial</h3>
          <p className="text-muted-foreground">
            Gráfico temporariamente indisponível
          </p>
        </div>
      </Suspense>
    </div>
  );
}

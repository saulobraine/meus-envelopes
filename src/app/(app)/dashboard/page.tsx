import { Suspense } from "react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { getFinancialChartData } from "@/app/_actions/dashboard";

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
      <Suspense fallback={<div>Loading overview cards...</div>}>
        <OverviewCards />
      </Suspense>
      <Suspense fallback={<div>Loading financial chart...</div>}>
        <FinancialChart initialChartData={initialChartData} />
      </Suspense>

    </div>
  );
}

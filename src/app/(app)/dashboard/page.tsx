"use client";

import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { FinancialChart } from "@/components/dashboard/FinancialChart";

export default function DashboardPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo ao seu Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe suas finanças em um só lugar
        </p>
      </div>
      <OverviewCards />
      <FinancialChart />

    </div>
  );
}

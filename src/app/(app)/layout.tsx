import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MeusEnvelopes",
  description: "Aplicativo de finanças pessoais com orçamento por envelopes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
}

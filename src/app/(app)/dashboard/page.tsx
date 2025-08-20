"use client";

import { useState } from "react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { StackedBarChart } from "@/components/dashboard/StackedBarChart";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { ChartSkeleton } from "@/components/ui/skeletons";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getFinancialChartData } from "@/app/_actions/dashboard/getFinancialChartData";

interface ChartData {
  data: Array<{
    period: string;
    [key: string]: string | number;
  }>;
  envelopes: string[];
}

export default function DashboardPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState<
    | "7-days"
    | "this-month"
    | "last-month"
    | "3-months"
    | "6-months"
    | "12-months"
    | "all-time"
  >("7-days");

  const [chartData, setChartData] = useState<ChartData>({
    data: [],
    envelopes: [],
  });
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!isAuthenticated || authLoading) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response: ChartData = await getFinancialChartData(selectedPeriod);
        setChartData(response);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // If authentication error, redirect to login
        if (
          error instanceof Error &&
          error.message === "User not authenticated."
        ) {
          window.location.href = "/login";
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, isAuthenticated, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Carregando Dashboard...</h1>
            <p className="text-muted-foreground mt-2">
              Verificando autenticação
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo ao seu Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas finanças em um só lugar
          </p>
        </div>
        <PeriodSelector
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
          className="w-full sm:w-48"
        />
      </div>

      <OverviewCards period={selectedPeriod} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <FinancialChart
              initialChartData={chartData.data || []}
              envelopes={chartData.envelopes || []}
            />
            <StackedBarChart
              initialChartData={chartData.data || []}
              envelopes={chartData.envelopes || []}
            />
          </>
        )}
      </div>
    </div>
  );
}

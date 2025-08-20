"use client";

import { TrendUp, TrendDown } from "phosphor-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { useState, useEffect, useMemo } from "react";
import { formatYAxisValue, formatChartValue } from "@/lib/utils";

interface FinancialChartProps {
  initialChartData: Array<{
    period?: string;
    name?: string;
    [key: string]: string | number | undefined;
  }>;
  envelopes: string[];
}

export const FinancialChart = ({
  initialChartData,
  envelopes,
}: FinancialChartProps) => {
  const [rawChartData, setRawChartData] = useState(initialChartData);
  const [currentEnvelopes, setCurrentEnvelopes] = useState(envelopes);

  // Update data when props change
  useEffect(() => {
    setRawChartData(initialChartData);
    setCurrentEnvelopes(envelopes);
  }, [initialChartData, envelopes]);

  // Process data to separate positive and negative values
  const chartData = useMemo(() => {
    if (!rawChartData || rawChartData.length === 0) {
      return [];
    }

    return rawChartData.map((dataPoint) => {
      let positiveTotal = 0;
      let negativeTotal = 0;

      currentEnvelopes.forEach((envelope) => {
        const rawValue = dataPoint[envelope] || 0;
        const value = typeof rawValue === "number" ? rawValue : 0;
        if (value > 0) {
          positiveTotal += value;
        } else if (value < 0) {
          negativeTotal += value;
        }
      });

      return {
        period: dataPoint.period || dataPoint.name || dataPoint.date || "N/A",
        receitas: positiveTotal,
        despesas: negativeTotal,
      };
    });
  }, [rawChartData, currentEnvelopes]);

  // Chart config for the two lines
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      receitas: {
        label: "Receitas",
        color: "#22c55e", // Green
      },
      despesas: {
        label: "Despesas",
        color: "#ef4444", // Red
      },
    };
    return config;
  }, []);

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
          <CardDescription>Análise detalhada por envelope</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Nenhum dado disponível para exibir o gráfico
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend based on net balance (receitas + despesas)
  const calculateTrend = () => {
    if (chartData.length < 2) {
      const saldoUnico =
        chartData.length === 1
          ? (chartData[0].receitas || 0) + (chartData[0].despesas || 0)
          : 0;
      return { trend: 0, isPositive: true, saldo: saldoUnico };
    }

    // Compare first and last periods
    const primeiroPeriodo = chartData[0];
    const ultimoPeriodo = chartData[chartData.length - 1];

    const saldoInicial =
      (primeiroPeriodo.receitas || 0) + (primeiroPeriodo.despesas || 0);
    const saldoFinal =
      (ultimoPeriodo.receitas || 0) + (ultimoPeriodo.despesas || 0);

    const trend =
      saldoInicial !== 0
        ? ((saldoFinal - saldoInicial) / Math.abs(saldoInicial)) * 100
        : 0;

    return { trend: Math.abs(trend), isPositive: trend > 0, saldo: saldoFinal };
  };

  const { trend, isPositive, saldo } = calculateTrend();

  const getPeriodDescription = () => {
    const firstPeriod = rawChartData[0]?.period || rawChartData[0]?.name || "";
    const lastPeriod =
      rawChartData[rawChartData.length - 1]?.period ||
      rawChartData[rawChartData.length - 1]?.name ||
      "";

    if (firstPeriod && lastPeriod) {
      return `${firstPeriod} - ${lastPeriod}`;
    }
    return "Período selecionado";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Financeira</CardTitle>
        <CardDescription>Análise detalhada por envelope</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ChartContainer
          config={chartConfig}
          className="min-h-[250px] max-h-[400px] w-full aspect-auto"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Format based on the data type
                if (value.includes(",")) {
                  // Daily format: "Seg, 15"
                  return value.split(",")[0];
                } else if (value.length <= 3) {
                  // Monthly format: "Jan"
                  return value;
                } else {
                  // Other formats
                  return value.slice(0, 3);
                }
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
              tickFormatter={(value) => formatYAxisValue(Number(value))}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-medium text-sm">{label}</div>
                        {payload.map((entry, index) => {
                          const isNegative = Number(entry.value) < 0;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor: entry.color,
                                }}
                              />
                              <span className="text-muted-foreground">
                                {entry.dataKey === "receitas"
                                  ? "Receitas"
                                  : "Despesas"}
                              </span>
                              <span
                                className={`font-medium tabular-nums ${
                                  isNegative
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {formatChartValue(Number(entry.value))}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <defs>
              <linearGradient id="fillReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-receitas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-receitas)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-despesas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-despesas)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="receitas"
              type="natural"
              fill="url(#fillReceitas)"
              fillOpacity={0.4}
              stroke="var(--color-receitas)"
              strokeWidth={2}
            />
            <Area
              dataKey="despesas"
              type="natural"
              fill="url(#fillDespesas)"
              fillOpacity={0.4}
              stroke="var(--color-despesas)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {isPositive ? (
                <>
                  Tendência positiva de {trend.toFixed(1)}% no período{" "}
                  <TrendUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Tendência negativa de {trend.toFixed(1)}% no período{" "}
                  <TrendDown className="h-4 w-4" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {getPeriodDescription()} • Saldo Total:{" "}
              {formatChartValue(saldo || 0)}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

"use client";

import { TrendUp, TrendDown } from "phosphor-react";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
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
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { formatChartValue, ColorUtility } from "@/lib/utils";

interface StackedBarChartProps {
  initialChartData: any[];
  envelopes: string[];
}

export const StackedBarChart = ({
  initialChartData,
  envelopes,
}: StackedBarChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentEnvelopes, setCurrentEnvelopes] = useState(envelopes);

  // Update chart data when props change
  useEffect(() => {
    setCurrentEnvelopes(envelopes);
    const envelopeAggregator = new EnvelopeAggregator(
      initialChartData,
      envelopes
    );
    const aggregatedData = envelopeAggregator.aggregate();
    setChartData(aggregatedData);
  }, [initialChartData, envelopes]);

  const chartConfig = new ChartConfigBuilder(currentEnvelopes).build();
  const trendCalculator = new TrendCalculator(chartData);
  const { percentage, isPositive } = trendCalculator.calculate();
  const periodDescriptor = new PeriodDescriptor(initialChartData);

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise por Envelopes</CardTitle>
          <CardDescription>
            Distribuição de valores por envelope
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Nenhum dado disponível para exibir o gráfico
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise por Envelopes</CardTitle>
        <CardDescription>Distribuição de valores por envelope</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ChartContainer
          config={chartConfig}
          className="min-h-[250px] max-h-[400px] w-full aspect-auto"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis type="number" dataKey="value" hide />
            <YAxis
              dataKey="envelope"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={120}
              tickFormatter={(value) => value.slice(0, 15)}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isNegative = data.isNegative;
                  const displayValue = formatChartValue(data.originalValue);

                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-medium text-sm">
                          {data.envelope}
                        </div>
                        <div
                          className={`text-sm font-medium ${isNegative ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                        >
                          {displayValue}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={5}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isNegative
                      ? "hsl(0 84% 60%)" // Red for negative
                      : "hsl(142 76% 36%)" // Green for positive
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium items-center">
          {percentage > 0 ? (
            <>
              {isPositive ? "Crescimento" : "Redução"} de{" "}
              {percentage.toFixed(1)}% no período{" "}
              {isPositive ? (
                <TrendUp
                  className={`h-4 w-4 ${ColorUtility.getTrendColorClass(true)}`}
                />
              ) : (
                <TrendDown
                  className={`h-4 w-4 ${ColorUtility.getTrendColorClass(false)}`}
                />
              )}
            </>
          ) : (
            "Sem variação no período"
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          {periodDescriptor.getDescription()} - Distribuição total por envelope
        </div>
      </CardFooter>
    </Card>
  );
};

class EnvelopeAggregator {
  constructor(
    private readonly chartData: any[],
    private readonly envelopes: string[]
  ) {}

  aggregate(): any[] {
    const envelopeTotals = this.calculateEnvelopeTotals();
    return this.createChartEntries(envelopeTotals);
  }

  private calculateEnvelopeTotals(): Map<string, number> {
    const totals = new Map<string, number>();

    this.envelopes.forEach((envelope) => totals.set(envelope, 0));

    this.chartData.forEach((period) => {
      this.envelopes.forEach((envelope) => {
        const currentValue = totals.get(envelope) || 0;
        const periodValue = period[envelope] || 0;
        totals.set(envelope, currentValue + periodValue);
      });
    });

    return totals;
  }

  private createChartEntries(totals: Map<string, number>): any[] {
    const entries: any[] = [];

    totals.forEach((value, envelope) => {
      if (value !== 0) {
        entries.push({
          envelope,
          value: Math.abs(value), // Use absolute value for bar length
          originalValue: value, // Keep original sign for color logic
          isNegative: value < 0,
        });
      }
    });

    return entries.sort((a, b) => b.value - a.value);
  }
}

class ChartConfigBuilder {
  constructor(private readonly envelopes: string[]) {}

  build(): ChartConfig {
    const config: ChartConfig = {};
    const purpleColors = [
      "hsl(290 40% 70%)", // Roxo claro
      "hsl(285 50% 65%)", // Roxo médio
      "hsl(295 60% 60%)", // Roxo vibrante
      "hsl(280 70% 55%)", // Roxo escuro
      "hsl(300 30% 75%)", // Roxo suave
    ];

    this.envelopes.forEach((envelope, index) => {
      const colorIndex = index % purpleColors.length;
      config[envelope] = {
        label: envelope,
        color: purpleColors[colorIndex],
      };
    });

    return config;
  }
}

class TrendCalculator {
  constructor(private readonly chartData: any[]) {}

  calculate(): { percentage: number; isPositive: boolean } {
    if (this.chartData.length < 2) {
      return { percentage: 0, isPositive: true };
    }

    const sortedData = [...this.chartData].sort((a, b) => b.value - a.value);
    const highest = sortedData[0]?.value || 0;
    const lowest = sortedData[sortedData.length - 1]?.value || 0;

    if (lowest === 0) {
      return { percentage: 0, isPositive: true };
    }

    const percentage = ((highest - lowest) / lowest) * 100;
    return {
      percentage: Math.abs(percentage),
      isPositive: percentage > 0,
    };
  }
}

class PeriodDescriptor {
  constructor(private readonly chartData: any[]) {}

  getDescription(): string {
    if (this.chartData.length === 0) {
      return "Período selecionado";
    }

    const firstPeriod = this.chartData[0]?.period || "";
    const lastPeriod = this.chartData[this.chartData.length - 1]?.period || "";

    if (firstPeriod && lastPeriod) {
      return `${firstPeriod} - ${lastPeriod}`;
    }

    return "Período atual";
  }
}

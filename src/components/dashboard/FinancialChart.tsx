"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getFinancialChartData } from "@/app/_actions/dashboard/getFinancialChartData";

interface FinancialChartProps {
  initialChartData: any[];
}

export const FinancialChart = ({ initialChartData }: FinancialChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "this-month" | "last-month" | "6-months" | "12-months" | "all-time"
  >("this-month");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getFinancialChartData(selectedPeriod);
      setChartData(data);
      setLoading(false);
    };
    if (selectedPeriod !== "this-month") {
      // Only fetch if not initial data
      fetchData();
    }
  }, [selectedPeriod]);

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Evolução Patrimonial</h3>
        <Select
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">Este mês</SelectItem>
            <SelectItem value="last-month">Último mês</SelectItem>
            <SelectItem value="6-months">Últimos 6 meses</SelectItem>
            <SelectItem value="12-months">Últimos 12 meses</SelectItem>
            <SelectItem value="all-time">Máximo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={initialChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis
              stroke="#888"
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `R$ ${value.toLocaleString()}`,
                name === "entradas" ? "Entradas" : "Saídas",
              ]}
            />
            <Line
              type="monotone"
              dataKey="entradas"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e" }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="saidas"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444" }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}

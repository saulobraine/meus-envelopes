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
import { useState } from "react";

const periodsData = {
  "this-month": [
    { name: "Sem 1", entradas: 15000, saidas: 8000 },
    { name: "Sem 2", entradas: 18000, saidas: 12000 },
    { name: "Sem 3", entradas: 22000, saidas: 9000 },
    { name: "Sem 4", entradas: 25000, saidas: 11000 },
  ],
  "last-month": [
    { name: "Sem 1", entradas: 12000, saidas: 7000 },
    { name: "Sem 2", entradas: 16000, saidas: 10000 },
    { name: "Sem 3", entradas: 19000, saidas: 8500 },
    { name: "Sem 4", entradas: 21000, saidas: 9500 },
  ],
  "6-months": [
    { name: "Fev", entradas: 72000, saidas: 32000 },
    { name: "Mar", entradas: 69000, saidas: 29000 },
    { name: "Abr", entradas: 83000, saidas: 35000 },
    { name: "Mai", entradas: 78000, saidas: 31000 },
    { name: "Jun", entradas: 91000, saidas: 38000 },
    { name: "Jul", entradas: 95000, saidas: 40000 },
  ],
  "12-months": [
    { name: "Ago", entradas: 45000, saidas: 20000 },
    { name: "Set", entradas: 52000, saidas: 22000 },
    { name: "Out", entradas: 48000, saidas: 21000 },
    { name: "Nov", entradas: 58000, saidas: 25000 },
    { name: "Dez", entradas: 62000, saidas: 28000 },
    { name: "Jan", entradas: 65000, saidas: 30000 },
    { name: "Fev", entradas: 72000, saidas: 32000 },
    { name: "Mar", entradas: 69000, saidas: 29000 },
    { name: "Abr", entradas: 83000, saidas: 35000 },
    { name: "Mai", entradas: 78000, saidas: 31000 },
    { name: "Jun", entradas: 91000, saidas: 38000 },
    { name: "Jul", entradas: 95000, saidas: 40000 },
  ],
  "all-time": [
    { name: "2022", entradas: 580000, saidas: 240000 },
    { name: "2023", entradas: 720000, saidas: 310000 },
    { name: "2024", entradas: 890000, saidas: 380000 },
  ],
};

export const FinancialChart = () => {
  const [selectedPeriod, setSelectedPeriod] =
    useState<keyof typeof periodsData>("this-month");
  const currentData = periodsData[selectedPeriod];

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Evolução Patrimonial</h3>
        <Select
          value={selectedPeriod}
          onValueChange={(value: keyof typeof periodsData) =>
            setSelectedPeriod(value)
          }
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
            data={currentData}
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

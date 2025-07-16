"use client"

import { formatCurrency } from '@/lib/currency';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  budgeted: number;
  spent: number;
}

interface PlanningChartsProps {
  data: ChartData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function PlanningCharts({ data }: PlanningChartsProps) {
  return (
    <div className="bg-white p-4 rounded shadow mb-8">
      <h2 className="text-xl font-semibold mb-2">Visão Geral do Orçamento</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="budgeted"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={110}
            fill="#82ca9d"
            dataKey="spent"
            nameKey="name"
            label
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

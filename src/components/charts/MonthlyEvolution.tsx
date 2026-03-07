"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { MonthStat } from "@/features/dashboard/useExpenseStats";

interface Props {
  data: MonthStat[];
  currentMonth: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-sm">
      <p className="font-medium text-gray-700 mb-0.5">{label}</p>
      <p className="text-gray-900">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function MonthlyEvolution({ data, currentMonth }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={28} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? "k" : ""}`}
          width={38}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.month}
              fill={entry.month === currentMonth ? "#3b82f6" : "#bfdbfe"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

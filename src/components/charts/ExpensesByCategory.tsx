"use client";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { CategoryStat } from "@/features/dashboard/useExpenseStats";
import type { CategoryResponse } from "@/types/api";

interface Props {
  data: CategoryStat[];
  categories: CategoryResponse[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CategoryStat & { resolvedColor: string } }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-sm">
      <p className="font-medium text-gray-800">
        {item.icon} {item.category_name}
      </p>
      <p className="text-gray-600">{formatCurrency(item.total)}</p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  if (!payload) return null;
  return (
    <ul className="flex flex-col gap-1.5 mt-2">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="truncate">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function ExpensesByCategory({ data, categories }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sin datos para mostrar
      </div>
    );
  }

  // Same lookup as the table badge: category color is the source of truth
  const categoryColorMap = new Map(categories.map((c) => [c.id, c.color ?? "#94a3b8"]));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category_name"
          cx="40%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((entry) => {
            const color = categoryColorMap.get(entry.category_id) ?? "#94a3b8";
            return <Cell key={entry.category_id} fill={color} />;
          })}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          content={<CustomLegend />}
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

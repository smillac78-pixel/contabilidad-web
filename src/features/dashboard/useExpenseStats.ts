"use client";

import { useQuery } from "@tanstack/react-query";
import { expensesService } from "@/services/expenses.service";
import type { CategoryResponse } from "@/types/api";

export interface CategoryStat {
  category_id: string;
  category_name: string;
  color: string;
  icon: string | null;
  total: number;
}

export interface MonthStat {
  month: string;
  expenses: number;
  income: number;
}

export interface ExpenseStats {
  byCategory: CategoryStat[];
  byMonth: MonthStat[];
  currentMonthExpenses: number;
  currentMonthIncome: number;
  currentMonthBalance: number;
  previousMonthExpenses: number;
  previousMonthIncome: number;
  deltaPercent: number | null;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("es-ES", { month: "short" });
}

export function useExpenseStats(categories: CategoryResponse[] | undefined) {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const from_date = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;

  return useQuery({
    queryKey: ["expense-stats", from_date],
    queryFn: async (): Promise<ExpenseStats> => {
      const data = await expensesService.list({ from_date, page_size: 500 });
      const items = data.items;

      const categoryMap = new Map(categories?.map((c) => [c.id, c]) ?? []);

      // --- Por categoría (solo gastos para el donut) ---
      const catTotals = new Map<string, number>();
      const catColors = new Map<string, string>();
      for (const e of items) {
        if (e.transaction_type === "expense") {
          catTotals.set(e.category_id, (catTotals.get(e.category_id) ?? 0) + Number(e.amount));
          if (e.color && !catColors.has(e.category_id)) {
            catColors.set(e.category_id, e.color);
          }
        }
      }
      const byCategory: CategoryStat[] = Array.from(catTotals.entries())
        .map(([id, total]) => {
          const cat = categoryMap.get(id);
          return {
            category_id: id,
            category_name: cat?.name ?? "Sin categoría",
            color: catColors.get(id) ?? cat?.color ?? "#94a3b8",
            icon: cat?.icon ?? null,
            total,
          };
        })
        .sort((a, b) => b.total - a.total);

      // --- Por mes (gastos e ingresos separados) ---
      const monthExpenses = new Map<string, number>();
      const monthIncome = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthExpenses.set(key, 0);
        monthIncome.set(key, 0);
      }
      for (const e of items) {
        const key = e.expense_date.slice(0, 7);
        if (e.transaction_type === "income") {
          if (monthIncome.has(key)) monthIncome.set(key, (monthIncome.get(key) ?? 0) + Number(e.amount));
        } else {
          if (monthExpenses.has(key)) monthExpenses.set(key, (monthExpenses.get(key) ?? 0) + Number(e.amount));
        }
      }
      const byMonth: MonthStat[] = Array.from(monthExpenses.keys()).map((key) => {
        const [y, m] = key.split("-").map(Number);
        return {
          month: monthLabel(y, m),
          expenses: monthExpenses.get(key) ?? 0,
          income: monthIncome.get(key) ?? 0,
        };
      });

      // --- KPIs mes actual y anterior ---
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

      const currentMonthExpenses = monthExpenses.get(currentKey) ?? 0;
      const currentMonthIncome = monthIncome.get(currentKey) ?? 0;
      const currentMonthBalance = currentMonthIncome - currentMonthExpenses;
      const previousMonthExpenses = monthExpenses.get(prevKey) ?? 0;
      const previousMonthIncome = monthIncome.get(prevKey) ?? 0;

      const deltaPercent =
        previousMonthExpenses > 0
          ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
          : null;

      return {
        byCategory,
        byMonth,
        currentMonthExpenses,
        currentMonthIncome,
        currentMonthBalance,
        previousMonthExpenses,
        previousMonthIncome,
        deltaPercent,
      };
    },
    enabled: !!categories,
    staleTime: 60_000,
  });
}

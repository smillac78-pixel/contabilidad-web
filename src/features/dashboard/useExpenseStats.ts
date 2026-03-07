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
  month: string;   // "Ene", "Feb", etc.
  total: number;
}

export interface ExpenseStats {
  byCategory: CategoryStat[];
  byMonth: MonthStat[];
  currentMonthTotal: number;
  previousMonthTotal: number;
  deltaPercent: number | null;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("es-ES", { month: "short" });
}

export function useExpenseStats(categories: CategoryResponse[] | undefined) {
  // Fecha inicio: hace 6 meses
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const from_date = sixMonthsAgo.toISOString().split("T")[0];

  return useQuery({
    queryKey: ["expense-stats", from_date],
    queryFn: async (): Promise<ExpenseStats> => {
      const data = await expensesService.list({ from_date, page_size: 500 });
      const expenses = data.items;

      const categoryMap = new Map(categories?.map((c) => [c.id, c]) ?? []);

      // --- Por categoría ---
      const catTotals = new Map<string, number>();
      for (const e of expenses) {
        catTotals.set(e.category_id, (catTotals.get(e.category_id) ?? 0) + e.amount);
      }
      const byCategory: CategoryStat[] = Array.from(catTotals.entries())
        .map(([id, total]) => {
          const cat = categoryMap.get(id);
          return {
            category_id: id,
            category_name: cat?.name ?? "Sin categoría",
            color: cat?.color ?? "#94a3b8",
            icon: cat?.icon ?? null,
            total,
          };
        })
        .sort((a, b) => b.total - a.total);

      // --- Por mes (últimos 6) ---
      const monthTotals = new Map<string, number>();
      // Inicializar los 6 meses a 0 para que aparezcan aunque no haya gastos
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthTotals.set(key, 0);
      }
      for (const e of expenses) {
        const key = e.expense_date.slice(0, 7); // "YYYY-MM"
        if (monthTotals.has(key)) {
          monthTotals.set(key, (monthTotals.get(key) ?? 0) + e.amount);
        }
      }
      const byMonth: MonthStat[] = Array.from(monthTotals.entries()).map(([key, total]) => {
        const [y, m] = key.split("-").map(Number);
        return { month: monthLabel(y, m), total };
      });

      // --- Mes actual vs anterior ---
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
      const currentMonthTotal = monthTotals.get(currentKey) ?? 0;
      const previousMonthTotal = monthTotals.get(prevKey) ?? 0;
      const deltaPercent =
        previousMonthTotal > 0
          ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
          : null;

      return { byCategory, byMonth, currentMonthTotal, previousMonthTotal, deltaPercent };
    },
    enabled: !!categories,
    staleTime: 60_000,
  });
}

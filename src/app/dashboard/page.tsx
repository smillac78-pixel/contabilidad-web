"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenses, useDeleteExpense } from "@/features/expenses/useExpenses";
import { useCategories, useDeleteCategory } from "@/features/categories/useCategories";
import { useExpenseStats } from "@/features/dashboard/useExpenseStats";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDate } from "@/utils/currency";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { ExpenseEditModal } from "@/components/expenses/ExpenseEditModal";
import { APP_NAME } from "@/config/app";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { ExpensesByCategory } from "@/components/charts/ExpensesByCategory";
import { MonthlyEvolution } from "@/components/charts/MonthlyEvolution";
import type { ExpenseResponse } from "@/types/api";

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(null);

  const { data: expensesData, isLoading, error } = useExpenses({ page: 1, page_size: 20 });
  const { data: categories } = useCategories();
  const { data: stats } = useExpenseStats();
  const { mutate: deleteExpense } = useDeleteExpense();
  const { mutate: deleteCategory } = useDeleteCategory();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  function handleDelete(id: string, description: string) {
    if (!confirm(`¿Eliminar "${description}"?`)) return;
    deleteExpense(id);
  }

  function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"? Las transacciones existentes no se verán afectadas.`)) return;
    deleteCategory(id);
  }

  const delta = stats?.deltaPercent;
  const deltaLabel =
    delta === null || delta === undefined ? null
    : delta > 0 ? `+${delta.toFixed(1)}% vs mes ant.`
    : delta < 0 ? `${delta.toFixed(1)}% vs mes ant.`
    : "Igual que mes ant.";
  const deltaColor =
    delta === null || delta === undefined ? "text-gray-400"
    : delta > 0 ? "text-red-500"
    : delta < 0 ? "text-green-600"
    : "text-gray-500";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">{APP_NAME}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Gastos este mes</p>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(stats?.currentMonthExpenses ?? 0)}
            </p>
            {deltaLabel && (
              <p className={`text-xs mt-1 ${deltaColor}`}>{deltaLabel}</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ingresos este mes</p>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(stats?.currentMonthIncome ?? 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Balance</p>
            <p className={`text-2xl font-bold ${
              (stats?.currentMonthBalance ?? 0) >= 0 ? "text-green-600" : "text-red-500"
            }`}>
              {(stats?.currentMonthBalance ?? 0) >= 0 ? "+" : ""}
              {formatCurrency(stats?.currentMonthBalance ?? 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Categorías</p>
            <p className="text-2xl font-bold text-gray-900">{categories?.length ?? "—"}</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Gasto por categoría</h2>
            <ExpensesByCategory
              data={(stats?.byCategory ?? []).map((entry) => ({
                ...entry,
                color: categories?.find((c) => c.name === entry.category_name)?.color ?? entry.color,
              }))}
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Evolución mensual</h2>
            <MonthlyEvolution data={stats?.byMonth ?? []} />
          </div>
        </div>

        {/* Categorías */}
        {categories && categories.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div key={cat.id} className="group flex items-center gap-1">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: cat.color ?? "#94a3b8" }}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    {cat.name}
                    {cat.transaction_type === "income" && (
                      <span className="opacity-75 ml-0.5">↑</span>
                    )}
                  </span>
                  {!cat.is_system && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-sm leading-none"
                      title="Eliminar categoría"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nueva transacción
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            + Nueva categoría
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Últimas transacciones</h2>
          </div>

          {isLoading && (
            <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
          )}
          {error && (
            <div className="p-8 text-center text-red-500 text-sm">Error al cargar.</div>
          )}
          {!isLoading && !error && expensesData?.items.length === 0 && (
            <div className="p-10 text-center space-y-2">
              <p className="text-gray-400 text-sm">No hay transacciones registradas.</p>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="text-blue-600 text-sm hover:underline"
              >
                Añade tu primera transacción →
              </button>
            </div>
          )}
          {!isLoading && !error && (expensesData?.items.length ?? 0) > 0 && (
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left w-6"></th>
                  <th className="px-5 py-3 text-left">Descripción</th>
                  <th className="px-5 py-3 text-left">Categoría</th>
                  <th className="px-5 py-3 text-left">Fecha</th>
                  <th className="px-5 py-3 text-right">Importe</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expensesData?.items.map((expense) => {
                  const cat = categories?.find((c) => c.id === expense.category_id);
                  const badgeColor = expense.color ?? cat?.color ?? "#94a3b8";
                  const isIncome = expense.transaction_type === "income";
                  return (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="pl-5 py-3">
                        <span className={`text-base font-bold ${isIncome ? "text-green-500" : "text-red-400"}`}>
                          {isIncome ? "+" : "−"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-900">{expense.description}</td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {cat?.icon && <span>{cat.icon}</span>}
                          {expense.category_name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(expense.expense_date)}</td>
                      <td className={`px-5 py-3 text-right font-semibold ${isIncome ? "text-green-600" : "text-gray-900"}`}>
                        {isIncome ? "+" : ""}{formatCurrency(expense.amount, expense.currency)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingExpense(expense)}
                            className="text-gray-400 hover:text-blue-500 transition-colors text-sm"
                            title="Editar"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id, expense.description)}
                            className="text-gray-400 hover:text-red-500 transition-colors text-base"
                            title="Eliminar"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <ExpenseFormModal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} />
      <ExpenseEditModal expense={editingExpense} onClose={() => setEditingExpense(null)} />
      <CategoryFormModal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
    </div>
  );
}

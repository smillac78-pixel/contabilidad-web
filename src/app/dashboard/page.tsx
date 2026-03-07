"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenses, useDeleteExpense } from "@/features/expenses/useExpenses";
import { useCategories } from "@/features/categories/useCategories";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDate } from "@/utils/currency";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { data: expensesData, isLoading, error } = useExpenses({ page: 1, page_size: 20 });
  const { data: categories } = useCategories();
  const { mutate: deleteExpense } = useDeleteExpense();

  const totalVisible = expensesData?.items.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  function handleDelete(id: string, description: string) {
    if (!confirm(`¿Eliminar "${description}"?`)) return;
    deleteExpense(id);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Contabilidad Familiar</h1>
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
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total visible</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalVisible)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Gastos registrados</p>
            <p className="text-2xl font-bold text-gray-900">{expensesData?.total ?? "—"}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Categorías</p>
            <p className="text-2xl font-bold text-gray-900">{categories?.length ?? "—"}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nuevo gasto
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            + Nueva categoría
          </button>
        </div>

        {/* Lista de gastos */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Últimos gastos</h2>
          </div>

          {isLoading && (
            <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
          )}

          {error && (
            <div className="p-8 text-center text-red-500 text-sm">
              Error al cargar los gastos.
            </div>
          )}

          {!isLoading && !error && expensesData?.items.length === 0 && (
            <div className="p-10 text-center space-y-2">
              <p className="text-gray-400 text-sm">No hay gastos registrados todavía.</p>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="text-blue-600 text-sm hover:underline"
              >
                Añade tu primer gasto →
              </button>
            </div>
          )}

          {!isLoading && !error && (expensesData?.items.length ?? 0) > 0 && (
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left">Descripción</th>
                  <th className="px-5 py-3 text-left">Categoría</th>
                  <th className="px-5 py-3 text-left">Fecha</th>
                  <th className="px-5 py-3 text-right">Importe</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expensesData?.items.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3 text-gray-900">{expense.description}</td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{
                          backgroundColor:
                            categories?.find((c) => c.id === expense.category_id)?.color ?? "#94a3b8",
                        }}
                      >
                        {expense.category_name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(expense.expense_date)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(expense.id, expense.description)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-base"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <ExpenseFormModal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} />
      <CategoryFormModal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
    </div>
  );
}

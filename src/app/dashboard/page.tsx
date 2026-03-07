"use client";

import { useRouter } from "next/navigation";
import { useExpenses } from "@/features/expenses/useExpenses";
import { useCategories } from "@/features/categories/useCategories";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDate } from "@/utils/currency";

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: expensesData, isLoading: loadingExpenses, error } = useExpenses({ page: 1, page_size: 10 });
  const { data: categories } = useCategories();

  const totalVisible = expensesData?.items.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  async function handleSignOut() {
    await signOut();
    router.push("/login");
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
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
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

        {/* Últimos gastos */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Últimos gastos</h2>
          </div>

          {loadingExpenses && (
            <div className="p-8 text-center text-gray-400">Cargando...</div>
          )}

          {error && (
            <div className="p-8 text-center text-red-500 text-sm">
              Error al cargar los gastos. Comprueba que tu usuario existe en la base de datos.
            </div>
          )}

          {!loadingExpenses && !error && expensesData?.items.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay gastos registrados todavía.
            </div>
          )}

          {!loadingExpenses && !error && (expensesData?.items.length ?? 0) > 0 && (
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left">Descripción</th>
                  <th className="px-5 py-3 text-left">Categoría</th>
                  <th className="px-5 py-3 text-left">Fecha</th>
                  <th className="px-5 py-3 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expensesData?.items.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-900">{expense.description}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {expense.category_name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(expense.expense_date)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

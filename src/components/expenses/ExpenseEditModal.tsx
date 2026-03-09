"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUpdateExpense } from "@/features/expenses/useExpenses";
import { useCategories } from "@/features/categories/useCategories";
import type { ExpenseResponse, TransactionType } from "@/types/api";

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#64748b", "#1a1a2e",
];

interface Props {
  expense: ExpenseResponse | null;
  onClose: () => void;
}

export function ExpenseEditModal({ expense, onClose }: Props) {
  const { data: categories } = useCategories();
  const { mutateAsync: updateExpense, isPending } = useUpdateExpense();

  const [type, setType] = useState<TransactionType>("expense");
  const [form, setForm] = useState({
    category_id: "",
    amount: "",
    currency: "EUR",
    description: "",
    expense_date: "",
    color: null as string | null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setType(expense.transaction_type ?? "expense");
      setForm({
        category_id: expense.category_id,
        amount: String(expense.amount),
        currency: expense.currency,
        description: expense.description,
        expense_date: expense.expense_date,
        color: expense.color ?? null,
      });
      setError(null);
    }
  }, [expense]);

  function set(field: string, value: string | null) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expense) return;
    setError(null);
    try {
      await updateExpense({
        id: expense.id,
        payload: {
          category_id: form.category_id,
          amount: parseFloat(form.amount),
          currency: form.currency,
          description: form.description,
          expense_date: form.expense_date,
          transaction_type: type,
          color: form.color,
        },
      });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Error al actualizar");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal open={!!expense} onClose={onClose} title="Editar transacción">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Toggle gasto / ingreso */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 py-2.5 transition-colors ${
              type === "expense"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            — Gasto
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 py-2.5 transition-colors ${
              type === "income"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            + Ingreso
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
          <select
            required
            value={form.category_id}
            onChange={(e) => set("category_id", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecciona una categoría</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Importe</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Moneda</label>
            <select
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option>EUR</option>
              <option>USD</option>
              <option>GBP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <input
            type="text"
            required
            maxLength={500}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha</label>
          <input
            type="date"
            required
            max={today}
            value={form.expense_date}
            onChange={(e) => set("expense_date", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Color personalizado{" "}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => set("color", null)}
              className={`w-7 h-7 rounded-full border-2 transition-all text-xs flex items-center justify-center ${
                form.color === null ? "border-blue-500 scale-110" : "border-gray-200"
              } bg-white text-gray-400`}
              title="Sin color"
            >
              ∅
            </button>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("color", c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  form.color === c ? "border-blue-500 scale-110" : "border-transparent"
                }`}
              />
            ))}
            <div className="relative w-7 h-7 flex-shrink-0" title="Color personalizado">
              <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300"
                style={{
                  backgroundColor: form.color && !COLORS.includes(form.color) ? form.color : "transparent",
                  outline: form.color && !COLORS.includes(form.color) ? `3px solid ${form.color}` : "none",
                  outlineOffset: "2px",
                }} />
              <input type="color" value={form.color ?? "#6366f1"}
                onChange={(e) => set("color", e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

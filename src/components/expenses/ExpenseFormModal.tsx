"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateExpense } from "@/features/expenses/useExpenses";
import { useCategories } from "@/features/categories/useCategories";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExpenseFormModal({ open, onClose }: Props) {
  const { data: categories } = useCategories();
  const { mutateAsync: createExpense, isPending } = useCreateExpense();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    category_id: "",
    amount: "",
    currency: "EUR",
    description: "",
    expense_date: today,
  });
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.category_id) {
      setError("Selecciona una categoría");
      return;
    }

    try {
      await createExpense({
        category_id: form.category_id,
        amount: parseFloat(form.amount),
        currency: form.currency,
        description: form.description,
        expense_date: form.expense_date,
      });
      setForm({ category_id: "", amount: "", currency: "EUR", description: "", expense_date: today });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Error al guardar el gasto");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo gasto">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="0.00"
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
            placeholder="Ej: Factura de luz enero"
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
            {isPending ? "Guardando..." : "Guardar gasto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateCategory } from "@/features/categories/useCategories";

interface Props {
  open: boolean;
  onClose: () => void;
}

const COLORS = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#f97316", "#ec4899",
  "#14b8a6", "#64748b", "#a855f7", "#94a3b8",
];

export function CategoryFormModal({ open, onClose }: Props) {
  const { mutateAsync: createCategory, isPending } = useCreateCategory();

  const [form, setForm] = useState({ name: "", icon: "", color: COLORS[0] });
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createCategory({
        name: form.name,
        icon: form.icon || undefined,
        color: form.color,
      });
      setForm({ name: "", icon: "", color: COLORS[0] });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Error al crear la categoría");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva categoría">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
          <input
            type="text"
            required
            maxLength={100}
            placeholder="Ej: Gimnasio"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Icono <span className="text-gray-400 font-normal">(emoji, opcional)</span>
          </label>
          <input
            type="text"
            maxLength={4}
            placeholder="🏋️"
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("color", c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                style={{
                  backgroundColor: c,
                  outline: form.color === c ? `3px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
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
            {isPending ? "Creando..." : "Crear categoría"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

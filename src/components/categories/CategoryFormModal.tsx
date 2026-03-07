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

const ICON_GROUPS = [
  {
    label: "Hogar",
    icons: [
      { emoji: "🏠", label: "Casa / Hipoteca" },
      { emoji: "🏡", label: "Alquiler" },
      { emoji: "🔑", label: "Comunidad" },
      { emoji: "🛋️", label: "Muebles" },
      { emoji: "🧹", label: "Limpieza" },
      { emoji: "🔧", label: "Reparaciones" },
    ],
  },
  {
    label: "Suministros",
    icons: [
      { emoji: "⚡", label: "Luz / Electricidad" },
      { emoji: "💧", label: "Agua" },
      { emoji: "🔥", label: "Gas" },
      { emoji: "♨️",  label: "Calefacción" },
      { emoji: "🌡️", label: "Climatización" },
      { emoji: "🗑️", label: "Basuras" },
    ],
  },
  {
    label: "Telecomunicaciones",
    icons: [
      { emoji: "📱", label: "Móvil" },
      { emoji: "☎️", label: "Teléfono fijo" },
      { emoji: "🌐", label: "Internet" },
      { emoji: "📡", label: "TV / Satélite" },
      { emoji: "📺", label: "Streaming" },
      { emoji: "🎵", label: "Música online" },
    ],
  },
  {
    label: "Transporte",
    icons: [
      { emoji: "🚗", label: "Coche" },
      { emoji: "⛽", label: "Gasolina" },
      { emoji: "🅿️", label: "Parking" },
      { emoji: "🚌", label: "Bus / Metro" },
      { emoji: "🚆", label: "Tren" },
      { emoji: "✈️", label: "Viajes" },
    ],
  },
  {
    label: "Alimentación",
    icons: [
      { emoji: "🛒", label: "Supermercado" },
      { emoji: "🍽️", label: "Restaurantes" },
      { emoji: "☕", label: "Café" },
      { emoji: "🥡", label: "Comida a domicilio" },
      { emoji: "🍷", label: "Bebidas" },
      { emoji: "🥦", label: "Mercado" },
    ],
  },
  {
    label: "Salud",
    icons: [
      { emoji: "💊", label: "Farmacia" },
      { emoji: "🏥", label: "Médico" },
      { emoji: "🦷", label: "Dentista" },
      { emoji: "👁️", label: "Óptica" },
      { emoji: "🏋️", label: "Gimnasio" },
      { emoji: "🧘", label: "Bienestar" },
    ],
  },
  {
    label: "Seguros y finanzas",
    icons: [
      { emoji: "🛡️", label: "Seguros" },
      { emoji: "🏦", label: "Banco" },
      { emoji: "💳", label: "Crédito" },
      { emoji: "📈", label: "Inversiones" },
      { emoji: "💰", label: "Ahorro" },
      { emoji: "🧾", label: "Impuestos" },
    ],
  },
  {
    label: "Educación y ocio",
    icons: [
      { emoji: "📚", label: "Educación" },
      { emoji: "🎬", label: "Cine / Teatro" },
      { emoji: "🎮", label: "Videojuegos" },
      { emoji: "📖", label: "Libros" },
      { emoji: "🎨", label: "Arte / Hobbies" },
      { emoji: "🎁", label: "Regalos" },
    ],
  },
  {
    label: "Personal",
    icons: [
      { emoji: "👕", label: "Ropa" },
      { emoji: "💈", label: "Peluquería" },
      { emoji: "💄", label: "Cosmética" },
      { emoji: "🐕", label: "Mascotas" },
      { emoji: "👶", label: "Bebé / Niños" },
      { emoji: "📦", label: "Otros" },
    ],
  },
];

export function CategoryFormModal({ open, onClose }: Props) {
  const { mutateAsync: createCategory, isPending } = useCreateCategory();

  const [form, setForm] = useState({ name: "", icon: "", color: COLORS[0] });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectIcon(emoji: string, label: string) {
    setForm((f) => ({
      ...f,
      icon: emoji,
      name: f.name || label,
    }));
    setPickerOpen(false);
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
      setPickerOpen(false);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Error al crear la categoría");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva categoría">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Icono — selector visual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Icono</label>
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
          >
            {form.icon ? (
              <>
                <span className="text-xl">{form.icon}</span>
                <span className="text-gray-700">Icono seleccionado</span>
              </>
            ) : (
              <span className="text-gray-400">Selecciona un icono...</span>
            )}
            <span className="ml-auto text-gray-400">{pickerOpen ? "▲" : "▼"}</span>
          </button>

          {pickerOpen && (
            <div className="mt-2 border border-gray-200 rounded-xl overflow-y-auto max-h-60 bg-white shadow-sm">
              {ICON_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-6 gap-0.5 p-2">
                    {group.icons.map(({ emoji, label }) => (
                      <button
                        key={emoji}
                        type="button"
                        title={label}
                        onClick={() => selectIcon(emoji, label)}
                        className={`flex items-center justify-center h-10 rounded-lg text-xl transition-colors hover:bg-blue-50 focus:outline-none ${
                          form.icon === emoji ? "bg-blue-100 ring-2 ring-blue-400" : ""
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nombre */}
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

        {/* Color */}
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

        {/* Preview */}
        {(form.icon || form.name) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Vista previa:</span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: form.color }}
            >
              {form.icon && <span>{form.icon}</span>}
              {form.name || "Nombre de categoría"}
            </span>
          </div>
        )}

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

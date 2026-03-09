"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/features/categories/useCategories";
import type { CategoryResponse, TransactionType } from "@/types/api";

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
  { label: "Hogar", icons: [{ emoji: "🏠", label: "Casa / Hipoteca" }, { emoji: "🏡", label: "Alquiler" }, { emoji: "🔑", label: "Comunidad" }, { emoji: "🛋️", label: "Muebles" }, { emoji: "🧹", label: "Limpieza" }, { emoji: "🔧", label: "Reparaciones" }] },
  { label: "Suministros", icons: [{ emoji: "⚡", label: "Luz / Electricidad" }, { emoji: "💧", label: "Agua" }, { emoji: "🔥", label: "Gas" }, { emoji: "♨️", label: "Calefacción" }, { emoji: "🌡️", label: "Climatización" }, { emoji: "🗑️", label: "Basuras" }] },
  { label: "Telecomunicaciones", icons: [{ emoji: "📱", label: "Móvil" }, { emoji: "☎️", label: "Teléfono fijo" }, { emoji: "🌐", label: "Internet" }, { emoji: "📡", label: "TV / Satélite" }, { emoji: "📺", label: "Streaming" }, { emoji: "🎵", label: "Música online" }] },
  { label: "Transporte", icons: [{ emoji: "🚗", label: "Coche" }, { emoji: "⛽", label: "Gasolina" }, { emoji: "🅿️", label: "Parking" }, { emoji: "🚌", label: "Bus / Metro" }, { emoji: "🚆", label: "Tren" }, { emoji: "✈️", label: "Viajes" }] },
  { label: "Alimentación", icons: [{ emoji: "🛒", label: "Supermercado" }, { emoji: "🍽️", label: "Restaurantes" }, { emoji: "☕", label: "Café" }, { emoji: "🥡", label: "Comida a domicilio" }, { emoji: "🍷", label: "Bebidas" }, { emoji: "🥦", label: "Mercado" }] },
  { label: "Salud", icons: [{ emoji: "💊", label: "Farmacia" }, { emoji: "🏥", label: "Médico" }, { emoji: "🦷", label: "Dentista" }, { emoji: "👁️", label: "Óptica" }, { emoji: "🏋️", label: "Gimnasio" }, { emoji: "🧘", label: "Bienestar" }] },
  { label: "Seguros y finanzas", icons: [{ emoji: "🛡️", label: "Seguros" }, { emoji: "🏦", label: "Banco" }, { emoji: "💳", label: "Crédito" }, { emoji: "📈", label: "Inversiones" }, { emoji: "💰", label: "Ahorro" }, { emoji: "🧾", label: "Impuestos" }] },
  { label: "Educación y ocio", icons: [{ emoji: "📚", label: "Educación" }, { emoji: "🎬", label: "Cine / Teatro" }, { emoji: "🎮", label: "Videojuegos" }, { emoji: "📖", label: "Libros" }, { emoji: "🎨", label: "Arte / Hobbies" }, { emoji: "🎁", label: "Regalos" }] },
  { label: "Personal", icons: [{ emoji: "👕", label: "Ropa" }, { emoji: "💈", label: "Peluquería" }, { emoji: "💄", label: "Cosmética" }, { emoji: "🐕", label: "Mascotas" }, { emoji: "👶", label: "Bebé / Niños" }, { emoji: "📦", label: "Otros" }] },
  { label: "Deporte", icons: [{ emoji: "⚽", label: "Fútbol" }, { emoji: "🏀", label: "Baloncesto" }, { emoji: "🎾", label: "Tenis" }, { emoji: "🏊", label: "Natación" }, { emoji: "🚴", label: "Ciclismo" }, { emoji: "🏋️", label: "Pesas" }, { emoji: "🧗", label: "Escalada" }, { emoji: "🏃", label: "Running" }, { emoji: "⛷️", label: "Esquí" }, { emoji: "🏄", label: "Surf" }, { emoji: "🥊", label: "Boxeo" }, { emoji: "🏌️", label: "Golf" }] },
];

type Mode = "list" | "create" | "edit";

const EMPTY_FORM = { name: "", icon: "", color: COLORS[0] };

export function CategoryFormModal({ open, onClose }: Props) {
  const { data: categories } = useCategories();
  const { mutateAsync: createCategory, isPending: creating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: updating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const [mode, setMode] = useState<Mode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>("expense");
  const [form, setForm] = useState(EMPTY_FORM);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isPending = creating || updating;

  function openCreate() {
    setMode("create");
    setType("expense");
    setForm(EMPTY_FORM);
    setPickerOpen(false);
    setError(null);
  }

  function openEdit(cat: CategoryResponse) {
    setMode("edit");
    setEditingId(cat.id);
    setType(cat.transaction_type as TransactionType);
    setForm({ name: cat.name, icon: cat.icon ?? "", color: cat.color ?? COLORS[0] });
    setPickerOpen(false);
    setError(null);
  }

  function backToList() {
    setMode("list");
    setEditingId(null);
    setError(null);
    setPickerOpen(false);
  }

  function handleClose() {
    backToList();
    onClose();
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    setDeleteError(null);
    deleteCategory(id, {
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setDeleteError(msg ?? "No se puede eliminar esta categoría");
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "create") {
        await createCategory({ name: form.name, icon: form.icon || undefined, color: form.color, transaction_type: type });
      } else if (mode === "edit" && editingId) {
        await updateCategory({ id: editingId, payload: { name: form.name, icon: form.icon || null, color: form.color, transaction_type: type } });
      }
      backToList();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Error al guardar la categoría");
    }
  }

  const title = mode === "list" ? "Categorías" : mode === "create" ? "Nueva categoría" : "Editar categoría";

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {mode === "list" ? (
        <div className="space-y-3">
          {/* Lista */}
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden max-h-72 overflow-y-auto">
            {!categories?.length && (
              <p className="text-sm text-gray-400 text-center py-6">Sin categorías</p>
            )}
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color ?? "#94a3b8" }} />
                  <span className="text-sm text-gray-800 truncate">{cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${cat.transaction_type === "income" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {cat.transaction_type === "income" ? "↑" : "↓"}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-blue-500 transition-colors text-sm" title="Editar">✎</button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="text-gray-400 hover:text-red-500 transition-colors text-base leading-none" title="Eliminar">×</button>
                </div>
              </div>
            ))}
          </div>

          {deleteError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{deleteError}</div>
          )}

          {/* Botón nueva */}
          <button
            onClick={openCreate}
            className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            + Nueva categoría
          </button>

          <button onClick={handleClose} className="w-full py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle gasto / ingreso */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
            <button type="button" onClick={() => setType("expense")}
              className={`flex-1 py-2.5 transition-colors ${type === "expense" ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
              — Gasto
            </button>
            <button type="button" onClick={() => setType("income")}
              className={`flex-1 py-2.5 transition-colors ${type === "income" ? "bg-green-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
              + Ingreso
            </button>
          </div>

          {/* Icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Icono</label>
            <button type="button" onClick={() => setPickerOpen((o) => !o)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-left">
              {form.icon ? <><span className="text-xl">{form.icon}</span><span className="text-gray-700">Icono seleccionado</span></> : <span className="text-gray-400">Selecciona un icono...</span>}
              <span className="ml-auto text-gray-400">{pickerOpen ? "▲" : "▼"}</span>
            </button>
            {pickerOpen && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-y-auto max-h-52 bg-white shadow-sm">
                {ICON_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">{group.label}</p>
                    <div className="grid grid-cols-6 gap-0.5 p-2">
                      {group.icons.map(({ emoji, label }) => (
                        <button key={emoji} type="button" title={label}
                          onClick={() => { setForm((f) => ({ ...f, icon: emoji, name: f.name || label })); setPickerOpen(false); }}
                          className={`flex items-center justify-center h-10 rounded-lg text-xl transition-colors hover:bg-blue-50 focus:outline-none ${form.icon === emoji ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}>
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
            <input type="text" required maxLength={100} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2 items-center">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: c, outline: form.color === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }} />
              ))}
              <div className="relative w-7 h-7 flex-shrink-0" title="Color personalizado">
                <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300"
                  style={{
                    backgroundColor: !COLORS.includes(form.color) ? form.color : "transparent",
                    outline: !COLORS.includes(form.color) ? `3px solid ${form.color}` : "none",
                    outlineOffset: "2px",
                  }} />
                <input type="color" value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" />
              </div>
            </div>
          </div>

          {/* Preview */}
          {(form.icon || form.name) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Vista previa:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: form.color }}>
                {form.icon && <span>{form.icon}</span>}
                {form.name || "Nombre de categoría"}
              </span>
            </div>
          )}

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={backToList}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              ← Volver
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isPending ? "Guardando..." : mode === "create" ? "Crear" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

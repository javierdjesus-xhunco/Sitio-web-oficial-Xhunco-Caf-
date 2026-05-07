"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  image_url: "",
  redirect_url: "",
  badge: "",
  active: false,
  sort_order: 0,
  starts_at: "",
  ends_at: "",
};

function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function PromotionsAdminPage({ scope = "admin" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const title = useMemo(
    () => (scope === "super-admin" ? "Promociones globales" : "Promociones"),
    [scope]
  );

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadItems() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/promotions", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Error al cargar promociones");
      }

      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (error) {
      setToast({ type: "error", text: error.message || "No se pudo cargar" });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setSelectedFileName("");
    setOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setSelectedFileName("");
    setForm({
      title: item.title || "",
      description: item.description || "",
      image_url: item.image_url || "",
      redirect_url: item.redirect_url || "",
      badge: item.badge || "",
      active: !!item.active,
      sort_order: Number(item.sort_order || 0),
      starts_at: toDatetimeLocal(item.starts_at),
      ends_at: toDatetimeLocal(item.ends_at),
    });
    setOpen(true);
  }

  function closeModal() {
    if (saving || uploading) return;
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setSelectedFileName("");
  }

  function onChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onUpload(file) {
    if (!file) return;

    try {
      setUploading(true);
      setSelectedFileName(file.name);

      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/promotions/upload", {
        method: "POST",
        body,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo subir la imagen");
      }

      if (!json?.image_url) {
        throw new Error("La API no devolvió la URL pública de la imagen");
      }

      setForm((prev) => ({
        ...prev,
        image_url: json.image_url,
      }));

      setToast({
        type: "success",
        text: "Imagen subida correctamente",
      });
    } catch (error) {
      setToast({
        type: "error",
        text: error.message || "Error al subir imagen",
      });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim(),
        redirect_url: form.redirect_url.trim(),
        badge: form.badge.trim() || null,
        active: !!form.active,
        sort_order: Number(form.sort_order || 0),
        starts_at: fromDatetimeLocal(form.starts_at),
        ends_at: fromDatetimeLocal(form.ends_at),
      };

      const isEdit = !!editing;
      const url = isEdit
        ? `/api/admin/promotions/${editing.id}`
        : "/api/admin/promotions";

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo guardar");
      }

      setToast({
        type: "success",
        text: isEdit ? "Promoción actualizada" : "Promoción creada",
      });

      closeModal();
      loadItems();
    } catch (error) {
      setToast({
        type: "error",
        text: error.message || "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(item) {
    const ok = window.confirm(`¿Eliminar la promoción "${item.title}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/promotions/${item.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo eliminar");
      }

      setToast({ type: "success", text: "Promoción eliminada" });
      loadItems();
    } catch (error) {
      setToast({ type: "error", text: error.message || "Error al eliminar" });
    }
  }

  async function onToggleActive(item) {
    try {
      const res = await fetch(`/api/admin/promotions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !item.active }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo actualizar el estado");
      }

      setToast({
        type: "success",
        text: !item.active ? "Promoción activada" : "Promoción desactivada",
      });

      loadItems();
    } catch (error) {
      setToast({ type: "error", text: error.message || "Error al actualizar" });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#31572c]">
              Panel de administración
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Administra banners promocionales, fechas de vigencia, imagen y destino.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#31572c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#25441f]"
          >
            <Plus className="h-4 w-4" />
            Nueva promoción
          </button>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-sm text-neutral-500">Cargando promociones...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-sm text-neutral-500">
              Aún no hay promociones registradas.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 p-5 lg:grid-cols-[120px_1fr_auto]"
                >
                  <div className="relative h-24 w-full overflow-hidden rounded-2xl bg-neutral-100 lg:w-[120px]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {item.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {item.active ? "Activa" : "Inactiva"}
                      </span>
                      {!!item.badge && (
                        <span className="rounded-full bg-[#31572c]/10 px-2.5 py-1 text-xs font-semibold text-[#31572c]">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {!!item.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-500">
                      <span>Orden: {item.sort_order ?? 0}</span>
                      <span>
                        Inicio:{" "}
                        {item.starts_at
                          ? new Date(item.starts_at).toLocaleString()
                          : "Sin fecha"}
                      </span>
                      <span>
                        Fin:{" "}
                        {item.ends_at
                          ? new Date(item.ends_at).toLocaleString()
                          : "Sin fecha"}
                      </span>
                    </div>

                    <div className="mt-2 truncate text-xs text-neutral-400">
                      Destino: {item.redirect_url}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-start gap-2 lg:justify-end">
                    <button
                      onClick={() => onToggleActive(item)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        item.active
                          ? "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                          : "bg-[#31572c] text-white hover:bg-[#25441f]"
                      }`}
                    >
                      {item.active ? "Desactivar" : "Activar"}
                    </button>

                    <button
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>

                    <button
                      onClick={() => onDelete(item)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {editing ? "Editar promoción" : "Nueva promoción"}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Configura imagen, texto, vigencia y destino del anuncio.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-neutral-800">
                    Título
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#31572c] focus:ring-4 focus:ring-[#31572c]/10"
                    placeholder="Ej. Café en promoción"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-neutral-800">
                    Descripción
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    className="min-h-[110px] w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#31572c] focus:ring-4 focus:ring-[#31572c]/10"
                    placeholder="Texto breve de la promoción"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-neutral-800">
                    URL destino
                  </label>
                  <input
                    value={form.redirect_url}
                    onChange={(e) => onChange("redirect_url", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#31572c] focus:ring-4 focus:ring-[#31572c]/10"
                    placeholder="/suministros/barro-negro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-800">
                    Badge
                  </label>
                  <input
                    value={form.badge}
                    onChange={(e) => onChange("badge", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#31572c] focus:ring-4 focus:ring-[#31572c]/10"
                    placeholder="Promo del mes"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-800">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => onChange("sort_order", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#31572c] focus:ring-4 focus:ring-[#31572c]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-800">
                    Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => onChange("starts_at", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#31572c] focus:ring-4 focus:ring-[#31572c]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-800">
                    Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => onChange("ends_at", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-[#31572c] focus:ring-4 focus:ring-[#31572c]/10"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-neutral-800">
                    Imagen
                  </label>

                  <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-neutral-300 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#31572c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25441f]">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                        {uploading ? "Subiendo imagen..." : "Subir imagen"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          className="hidden"
                          onChange={(e) => onUpload(e.target.files?.[0])}
                          disabled={uploading}
                        />
                      </label>

                      <input
                        value={form.image_url}
                        onChange={(e) => onChange("image_url", e.target.value)}
                        className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#31572c] focus:ring-4 focus:ring-[#31572c]/10"
                        placeholder="URL pública de la imagen"
                        required
                      />
                    </div>

                    {!!selectedFileName && (
                      <p className="text-xs text-neutral-500">
                        Archivo seleccionado: <span className="font-medium">{selectedFileName}</span>
                      </p>
                    )}

                    {uploading && (
                      <div className="rounded-xl bg-[#31572c]/5 px-4 py-3 text-sm text-[#31572c]">
                        Subiendo imagen al bucket de promociones...
                      </div>
                    )}

                    {!!form.image_url && !uploading && (
                      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                        <div className="border-b border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-500">
                          Vista previa cargada
                        </div>
                        <div className="relative h-52">
                          <img
                            src={form.image_url}
                            alt="Vista previa"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <label className="inline-flex items-center gap-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => onChange("active", e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-[#31572c] focus:ring-[#31572c]"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    Activar esta promoción
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#31572c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#25441f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear promoción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[130] inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function num(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const EMPTY = {
  imagen: "",
  sku: "",
  nombre: "",
  categoria: "",
  marca: "",
  presentacion: "",
  precio_original: "",
  precio_web: "",
  precio_publico: "",
  precio_medio: "",
  precio_mayoreo: "",
  unidad: "",
  stock: "",
  activo: true,
};

export default function SuministrosClient() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const [openForm, setOpenForm] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  // upload state
  const [uploading, setUploading] = useState(false);

  // flash
  const [flash, setFlash] = useState(null); // { type, text }
  const flashTimer = useRef(null);

  function showFlash(type, text) {
    setFlash({ type, text });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 2600);
  }

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  async function load({ nextOffset = offset, nextQ = q } = {}) {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (nextQ.trim()) sp.set("q", nextQ.trim());
      sp.set("limit", String(limit));
      sp.set("offset", String(nextOffset));

      const res = await fetch(`/api/superadmin/suministros?${sp.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error al cargar");

      setRows(json.rows || []);
      setTotal(json.total || 0);
      setOffset(json.offset || 0);
    } catch (e) {
      console.error(e);
      showFlash("error", e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({ nextOffset: 0 });
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showing = useMemo(() => {
    if (loading) return "Cargando…";
    const from = Math.min(offset + 1, total || 0);
    const to = Math.min(offset + limit, total || 0);
    return total ? `Mostrando ${from}-${to} de ${total}` : "Sin resultados";
  }, [loading, offset, limit, total]);

  function openCreate() {
    setMode("create");
    setCurrentId(null);
    setForm(EMPTY);
    setOpenForm(true);
  }

  function openEdit(r) {
    setMode("edit");
    setCurrentId(String(r.id));
    setForm({
      imagen: r.imagen ?? "",
      sku: r.sku ?? "",
      nombre: r.nombre ?? "",
      categoria: r.categoria ?? "",
      marca: r.marca ?? "",
      presentacion: r.presentacion ?? "",
      precio_original: r.precio_original ?? "",
      precio_web: r.precio_web ?? "",
      precio_publico: r.precio_publico ?? "",
      precio_medio: r.precio_medio ?? "",
      precio_mayoreo: r.precio_mayoreo ?? "",
      unidad: r.unidad ?? "",
      stock: r.stock ?? "",
      activo: !!r.activo,
    });
    setOpenForm(true);
  }

  async function onPickFile(file) {
    if (!file) return;

    // Validación rápida cliente
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    if (!allowed.has(file.type)) {
      showFlash("error", "Formato no permitido. Usa jpg/png/webp/gif.");
      return;
    }
    const MAX = 3 * 1024 * 1024;
    if (file.size > MAX) {
      showFlash("error", "Archivo muy grande (máx 3MB).");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/superadmin/suministros/upload-image", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error subiendo imagen");

      setForm((s) => ({ ...s, imagen: json.url }));
      showFlash("success", "Imagen subida correctamente");
    } catch (e) {
      console.error(e);
      showFlash("error", e.message || "Error");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (uploading) {
      showFlash("error", "Espera a que termine la subida de la imagen.");
      return;
    }

    if (mode === "edit" && !currentId) {
      showFlash("error", "No se detectó el ID del suministro.");
      return;
    }

    if (mode === "edit") {
      const ok = window.confirm("¿Confirmas guardar los cambios de este suministro?");
      if (!ok) return;
    }

    const payload = {
      imagen: form.imagen || null,
      sku: form.sku || null,
      nombre: form.nombre || null,
      categoria: form.categoria || null,
      marca: form.marca || null,
      presentacion: form.presentacion || null,
      precio_original: num(form.precio_original),
      precio_web: num(form.precio_web),
      precio_publico: num(form.precio_publico),
      precio_medio: num(form.precio_medio),
      precio_mayoreo: num(form.precio_mayoreo),
      unidad: form.unidad || null,
      stock: form.stock === "" ? null : Number(form.stock),
      activo: !!form.activo,
    };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/superadmin/suministros", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/superadmin/suministros/${currentId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error guardando");

      setOpenForm(false);
      await load({ nextOffset: offset, nextQ: q });

      showFlash("success", mode === "create" ? "Suministro agregado correctamente" : "Actualización exitosa");
    } catch (e2) {
      console.error(e2);
      showFlash("error", e2.message || "Error");
    }
  }

  async function onDelete(id) {
    if (!confirm("¿Eliminar este suministro?")) return;
    try {
      const res = await fetch(`/api/superadmin/suministros/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error eliminando");

      showFlash("success", "Eliminación exitosa");
      await load({ nextOffset: Math.max(0, offset - (rows.length === 1 ? limit : 0)), nextQ: q });
    } catch (e) {
      console.error(e);
      showFlash("error", e.message || "Error");
    }
  }

  return (
    <div className="max-w-[1200px]">
      {flash ? (
        <div
          className={cx(
            "mb-4 rounded-2xl border px-4 py-3 text-sm",
            flash.type === "success"
              ? "border-[#31572c]/25 bg-[#31572c]/10 text-[#31572c]"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {flash.text}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-black">Suministros</h1>
          <div className="mt-1 text-sm text-black/60">{showing}</div>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o SKU…"
              className="w-[280px] rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-[#31572c]/40"
            />
          </div>
          <button
            onClick={() => load({ nextOffset: 0, nextQ: q })}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5"
          >
            Buscar
          </button>

          <button
            onClick={openCreate}
            className="rounded-xl bg-[#31572c] px-4 py-2 text-sm text-white hover:bg-[#2a4b27]"
          >
            + Agregar
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-black/5 text-black/70">
              <tr>
                <th className="text-left font-medium px-3 py-3">Imagen</th>
                <th className="text-left font-medium px-3 py-3">Nombre</th>
                <th className="text-left font-medium px-3 py-3">SKU</th>
                <th className="text-left font-medium px-3 py-3">Presentación</th>
                <th className="text-left font-medium px-3 py-3">Público</th>
                <th className="text-left font-medium px-3 py-3">Web</th>
                <th className="text-left font-medium px-3 py-3">Mayoreo</th>
                <th className="text-left font-medium px-3 py-3">Stock</th>
                <th className="text-left font-medium px-3 py-3">Activo</th>
                <th className="text-right font-medium px-3 py-3">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-black/60" colSpan={10}>
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-black/60" colSpan={10}>
                    No hay suministros.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-black/[0.02]">
                    <td className="px-3 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border border-black/10 bg-black/5">
                        {r.imagen ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.imagen} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-black">{r.nombre}</td>
                    <td className="px-3 py-3 text-black/70">{r.sku || "—"}</td>
                    <td className="px-3 py-3 text-black/70">{r.presentacion || "—"}</td>
                    <td className="px-3 py-3 text-black/80">{r.precio_publico ?? "—"}</td>
                    <td className="px-3 py-3 text-black/80">{r.precio_web ?? "—"}</td>
                    <td className="px-3 py-3 text-black/80">{r.precio_mayoreo ?? "—"}</td>
                    <td className="px-3 py-3 text-black/70">{r.stock ?? "—"}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cx(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs border",
                          r.activo
                            ? "border-[#31572c]/30 bg-[#31572c]/10 text-[#31572c]"
                            : "border-black/10 bg-black/5 text-black/60"
                        )}
                      >
                        {r.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm hover:bg-black/5"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(r.id)}
                          className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-black/10">
          <button
            disabled={!canPrev || loading}
            onClick={() => load({ nextOffset: Math.max(0, offset - limit), nextQ: q })}
            className={cx(
              "rounded-xl px-3 py-1.5 text-sm border",
              canPrev && !loading
                ? "border-black/10 bg-white hover:bg-black/5"
                : "border-black/10 bg-black/5 text-black/40 cursor-not-allowed"
            )}
          >
            ← Anterior
          </button>

          <button
            disabled={!canNext || loading}
            onClick={() => load({ nextOffset: offset + limit, nextQ: q })}
            className={cx(
              "rounded-xl px-3 py-1.5 text-sm border",
              canNext && !loading
                ? "border-black/10 bg-white hover:bg-black/5"
                : "border-black/10 bg-black/5 text-black/40 cursor-not-allowed"
            )}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {openForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => !uploading && setOpenForm(false)} />
          <div className="relative w-full max-w-[720px] rounded-2xl border border-black/10 bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-black">
                  {mode === "create" ? "Agregar suministro" : "Editar suministro"}
                </div>
                <div className="text-sm text-black/60">Ahora puedes subir imagen desde tu computadora.</div>
              </div>

              <button
                onClick={() => !uploading && setOpenForm(false)}
                className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
                disabled={uploading}
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nombre *">
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                  required
                />
              </Field>

              <Field label="SKU">
                <input
                  value={form.sku}
                  onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              {/* ✅ Subida de archivo */}
              <Field label="Imagen (archivo)">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={uploading}
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                />
                <div className="mt-1 text-xs text-black/50">
                  {uploading ? "Subiendo imagen..." : "Formatos: jpg/png/webp/gif · Máx 3MB"}
                </div>
              </Field>

              {/* ✅ Preview + URL (por si quieres pegar una URL también) */}
              <Field label="Imagen (URL)">
                <input
                  value={form.imagen}
                  onChange={(e) => setForm((s) => ({ ...s, imagen: e.target.value }))}
                  placeholder="Se llenará automáticamente al subir archivo"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
                {form.imagen ? (
                  <div className="mt-2 h-20 w-20 overflow-hidden rounded-xl border border-black/10 bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imagen} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
              </Field>

              <Field label="Presentación">
                <input
                  value={form.presentacion}
                  onChange={(e) => setForm((s) => ({ ...s, presentacion: e.target.value }))}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Categoría">
                <input
                  value={form.categoria}
                  onChange={(e) => setForm((s) => ({ ...s, categoria: e.target.value }))}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Marca">
                <input
                  value={form.marca}
                  onChange={(e) => setForm((s) => ({ ...s, marca: e.target.value }))}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Precio público">
                <input
                  value={form.precio_publico}
                  onChange={(e) => setForm((s) => ({ ...s, precio_publico: e.target.value }))}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Precio web">
                <input
                  value={form.precio_web}
                  onChange={(e) => setForm((s) => ({ ...s, precio_web: e.target.value }))}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Precio medio">
                <input
                  value={form.precio_medio}
                  onChange={(e) => setForm((s) => ({ ...s, precio_medio: e.target.value }))}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Precio mayoreo">
                <input
                  value={form.precio_mayoreo}
                  onChange={(e) => setForm((s) => ({ ...s, precio_mayoreo: e.target.value }))}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Precio original">
                <input
                  value={form.precio_original}
                  onChange={(e) => setForm((s) => ({ ...s, precio_original: e.target.value }))}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Stock">
                <input
                  value={form.stock}
                  onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <Field label="Unidad">
                <input
                  value={form.unidad}
                  onChange={(e) => setForm((s) => ({ ...s, unidad: e.target.value }))}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#31572c]/40"
                />
              </Field>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="activo"
                  type="checkbox"
                  checked={!!form.activo}
                  onChange={(e) => setForm((s) => ({ ...s, activo: e.target.checked }))}
                />
                <label htmlFor="activo" className="text-sm text-black/80">
                  Activo
                </label>
              </div>

              <div className="mt-2 flex justify-end gap-2 md:col-span-2">
                <button
                  type="button"
                  onClick={() => !uploading && setOpenForm(false)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
                  disabled={uploading}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-xl bg-[#31572c] px-4 py-2 text-sm text-white hover:bg-[#2a4b27] disabled:opacity-50"
                >
                  {uploading ? "Subiendo..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="mb-1 text-xs text-black/60">{label}</div>
      {children}
    </div>
  );
}
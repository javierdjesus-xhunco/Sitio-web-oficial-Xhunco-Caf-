"use client";
import { useEffect, useState } from "react";

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function InventarioPage() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q);

  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => setPage(1), [dq]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const url = `/api/admin/inventario?q=${encodeURIComponent(dq)}&page=${page}&pageSize=${pageSize}`;
        const r = await fetch(url, { signal: ac.signal, cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Error al cargar inventario");
        setRows(j.data || []);
        setMeta({ total: j.total || 0, totalPages: j.totalPages || 1 });
      } catch (e) {
        if (String(e?.name) !== "AbortError") setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [dq, page]);

  const downloadCSV = () => {
    // Exporta respetando búsqueda actual
    const url = `/api/admin/inventario/export?q=${encodeURIComponent(dq)}`;
    window.location.href = url;
  };

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xl font-semibold">Inventario</div>
          <div className="text-sm text-neutral-600">Stock general + export CSV</div>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-end">
          <div className="md:w-[320px]">
            <label className="text-xs font-semibold text-neutral-700">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="SKU o nombre…"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>

          <button
            onClick={downloadCSV}
            className="rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-greenHover"
          >
            Descargar CSV
          </button>
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Presentación</th>
              <th className="px-3 py-2">Stock</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3 text-neutral-500" colSpan={5}>Cargando…</td></tr>
            ) : rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{r.sku || "—"}</td>
                  <td className="px-3 py-2 font-semibold">{r.nombre || "—"}</td>
                  <td className="px-3 py-2">{r.categoria || "—"}</td>
                  <td className="px-3 py-2">{r.presentacion || "—"}</td>
                  <td className="px-3 py-2 font-semibold">{Number(r.stock ?? 0)}</td>
                </tr>
              ))
            ) : (
              <tr><td className="px-3 py-3 text-neutral-500" colSpan={5}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-neutral-500">Total: {meta.total}</div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Anterior
          </button>
          <div className="text-sm font-semibold">{page} / {meta.totalPages}</div>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl bg-brand-green px-3 py-2 text-sm font-semibold text-white hover:bg-brand-greenHover disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
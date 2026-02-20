"use client";
import { useEffect, useMemo, useState } from "react";

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function toIntOrNull(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export default function SuministrosPage() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q);

  const [categoria, setCategoria] = useState("");
  const [lowStock, setLowStock] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // entrada por fila (delta)
  const [entradaDraft, setEntradaDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => setPage(1), [dq, categoria, lowStock]);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const url =
          `/api/admin/suministros?q=${encodeURIComponent(dq)}` +
          `&categoria=${encodeURIComponent(categoria)}` +
          `&lowStock=${lowStock ? "1" : "0"}` +
          `&page=${page}&pageSize=${pageSize}`;

        const r = await fetch(url, { signal: ac.signal, cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Error al cargar suministros");

        setRows(j.data || []);
        setMeta({ total: j.total || 0, totalPages: j.totalPages || 1 });

        setEntradaDraft((prev) => {
          const next = { ...prev };
          for (const it of j.data || []) {
            if (next[it.id] === undefined) next[it.id] = "";
          }
          return next;
        });
      } catch (e) {
        if (String(e?.name) !== "AbortError") setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [dq, categoria, lowStock, page]);

  const categoriasDisponibles = useMemo(() => {
    const set = new Set();
    for (const r of rows) if (r?.categoria) set.add(r.categoria);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [rows]);

  async function aplicarEntrada(id) {
    const delta = toIntOrNull(entradaDraft[id]);

    if (delta === null) {
      setErr("Entrada inválida. Usa un número entero (ej: 5).");
      return;
    }
    if (delta <= 0) {
      setErr("La entrada debe ser un entero > 0.");
      return;
    }

    setSavingId(id);
    setErr("");

    try {
      const r = await fetch(`/api/admin/suministros/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });

      // ✅ robusto para no romperse si devuelve HTML por error
      const text = await r.text();
      let j;
      try {
        j = JSON.parse(text);
      } catch {
        throw new Error(
          "El endpoint /api/admin/suministros/[id] no devolvió JSON. Verifica que exista src/app/api/admin/suministros/[id]/route.js y reinicia el server."
        );
      }

      if (!r.ok) throw new Error(j?.error || "No se pudo aplicar la entrada");

      const newStock = j.data?.stock;

      setRows((prev) =>
        prev.map((x) => (x.id === id ? { ...x, stock: newStock ?? x.stock } : x))
      );
      setEntradaDraft((prev) => ({ ...prev, [id]: "" }));
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xl font-semibold">Suministros</div>
          <div className="text-sm text-neutral-600">
            Catálogo paginado + filtros ·{" "}
            <span className="font-semibold">Entrada suma al stock</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid w-full gap-2 md:grid-cols-3">
        <div>
          <label className="text-xs font-semibold text-neutral-700">Buscar</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="SKU / nombre / marca / categoría…"
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/20"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-700">Categoría</label>
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Ej: Café"
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/20"
          />

          {categoriasDisponibles.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {categoriasDisponibles.slice(0, 8).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoria(c)}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold hover:bg-neutral-50"
                >
                  {c}
                </button>
              ))}
              {categoria ? (
                <button
                  onClick={() => setCategoria("")}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold hover:bg-neutral-50"
                >
                  Limpiar
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <label className="mt-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => setLowStock(e.target.checked)}
          />
          Bajo stock
        </label>
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
              <th className="px-3 py-2">Marca</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Stock actual</th>
              <th className="px-3 py-2">Entrada (+)</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-neutral-500" colSpan={7}>
                  Cargando…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((r) => {
                const busy = savingId === r.id;

                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs">{r.sku || "—"}</td>
                    <td className="px-3 py-2 font-semibold">{r.nombre || "—"}</td>
                    <td className="px-3 py-2">{r.marca || "—"}</td>
                    <td className="px-3 py-2">{r.categoria || "—"}</td>
                    <td className="px-3 py-2 font-semibold">{Number(r.stock ?? 0)}</td>

                    <td className="px-3 py-2">
                      <input
                        value={entradaDraft[r.id] ?? ""}
                        onChange={(e) =>
                          setEntradaDraft((p) => ({ ...p, [r.id]: e.target.value }))
                        }
                        className="w-[120px] rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/20"
                        placeholder="Ej: 5"
                        inputMode="numeric"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <button
                        disabled={busy}
                        onClick={() => aplicarEntrada(r.id)}
                        className="rounded-xl bg-brand-green px-3 py-2 text-sm font-semibold text-white hover:bg-brand-greenHover disabled:opacity-40"
                      >
                        {busy ? "Aplicando…" : "Aplicar"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-3 py-3 text-neutral-500" colSpan={7}>
                  Sin resultados
                </td>
              </tr>
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

          <div className="text-sm font-semibold">
            {page} / {meta.totalPages}
          </div>

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
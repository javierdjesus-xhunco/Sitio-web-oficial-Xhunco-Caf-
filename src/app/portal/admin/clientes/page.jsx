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

export default function ClientesPage() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q);

  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setPage(1);
  }, [dq, pageSize]); // ✅ si luego cambias pageSize, se reinicia

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const url =
          `/api/admin/clientes?q=${encodeURIComponent(dq)}` +
          `&page=${page}&pageSize=${pageSize}`;

        const r = await fetch(url, { signal: ac.signal, cache: "no-store" });

        const text = await r.text();
        let j;
        try {
          j = JSON.parse(text);
        } catch {
          throw new Error(
            "El endpoint /api/admin/clientes no devolvió JSON. Revisa rutas y reinicia el server."
          );
        }

        if (!r.ok) throw new Error(j?.error || "Error al cargar clientes");

        setRows(j.data || []);
        setMeta({ total: j.total || 0, totalPages: j.totalPages || 1 });
      } catch (e) {
        if (String(e?.name) !== "AbortError") setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [dq, page, pageSize]); // ✅ agrega pageSize por consistencia

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xl font-semibold">Socios Xhunco</div>
        </div>

        <div className="w-full md:w-[360px]">
          <label className="text-xs font-semibold text-neutral-700">Buscar</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Negocio, Socio, teléfono o correo…"
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/20"
          />
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
              <th className="px-3 py-2">Negocio</th>
              <th className="px-3 py-2">Socio</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Alta</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-neutral-500" colSpan={5}>
                  Cargando…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((r) => (
                <tr
                  key={r.client_id || r.id} // ✅ futuro-proof si agregamos client_id en API
                  className="border-t"
                >
                  <td className="px-3 py-2 font-semibold">{r.business_name || "—"}</td>
                  <td className="px-3 py-2">{r.owner_name || "—"}</td>
                  <td className="px-3 py-2">{r.phone || "—"}</td>
                  <td className="px-3 py-2">{r.email || "—"}</td>
                  <td className="px-3 py-2">
                    {r.created_at ? new Date(r.created_at).toLocaleString("es-MX") : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-3 text-neutral-500" colSpan={5}>
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
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
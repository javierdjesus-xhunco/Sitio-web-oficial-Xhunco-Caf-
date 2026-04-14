"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Package2,
  MessageSquareText,
  CalendarDays,
  Save,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "seguimiento", label: "Seguimiento" },
  { value: "cerrado", label: "Cerrado" },
  { value: "descartado", label: "Descartado" },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(dateLike) {
  if (!dateLike) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateLike));
  } catch {
    return "—";
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case "nuevo":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "contactado":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "seguimiento":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "cerrado":
      return "border-green-200 bg-green-50 text-green-700";
    case "descartado":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

export default function B2BLeadsManager({
  apiBase,
  title = "Clientes B2B",
  subtitle = "Vista general de clientes comerciales para seguimiento y control.",
}) {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");

  const [selected, setSelected] = useState(null);
  const [drawerStatus, setDrawerStatus] = useState("");
  const [drawerNotes, setDrawerNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(
    async ({ silent = false } = {}) => {
      try {
        setError("");
        if (silent) setRefreshing(true);
        else setLoading(true);

        const res = await fetch(apiBase, { cache: "no-store" });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : null;

        if (!res.ok) {
          throw new Error(data?.error || "No se pudieron cargar los clientes.");
        }

        setAllRows(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        setError(err.message || "Error al cargar clientes.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiBase]
  );

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const rows = useMemo(() => {
    return allRows.filter((item) => {
      const matchesStatus = status === "todos" ? true : item.status === status;

      const text = [
        item.company_name,
        item.contact_name,
        item.email,
        item.phone,
        item.city,
        item.business_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = query.trim()
        ? text.includes(query.trim().toLowerCase())
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [allRows, status, query]);

  const counts = useMemo(() => {
    const base = {
      total: allRows.length,
      nuevo: 0,
      contactado: 0,
      seguimiento: 0,
      cerrado: 0,
      descartado: 0,
    };

    allRows.forEach((r) => {
      if (base[r.status] !== undefined) base[r.status] += 1;
    });

    return base;
  }, [allRows]);

  function openDrawer(item) {
    setSelected(item);
    setDrawerStatus(item.status || "nuevo");
    setDrawerNotes(item.notes || "");
  }

  function closeDrawer() {
    setSelected(null);
    setDrawerStatus("");
    setDrawerNotes("");
  }

  async function saveLead() {
    if (!selected?.id) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${apiBase}/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: drawerStatus,
          notes: drawerNotes,
        }),
      });

      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo actualizar el cliente.");
      }

      setAllRows((prev) =>
        prev.map((item) => (item.id === selected.id ? data.item : item))
      );

      closeDrawer();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el cliente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-[#E7E0D8] bg-white p-6 shadow-[0_12px_40px_rgba(42,26,18,0.04)] sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-[#E7E0D8] bg-[#FCFBF9] px-4 py-2 text-sm font-medium text-[#6B3E26]">
              B2B
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#0F172A] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#475569]">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[270px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar empresa, contacto o correo"
                className="h-11 w-full rounded-2xl border border-[#E7E0D8] bg-white pl-10 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#6B3E26]/30 focus:ring-2 focus:ring-[#6B3E26]/10"
              />
            </div>

            <button
              type="button"
              onClick={() => fetchRows({ silent: true })}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#E7E0D8] bg-white px-4 text-sm font-medium text-[#0F172A] transition hover:bg-[#FCFBF9]"
            >
              <RefreshCw className={cx("h-4 w-4", refreshing && "animate-spin")} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setStatus(item.value)}
              className={cx(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                status === item.value
                  ? "border-[#2A1A12] bg-[#2A1A12] text-white"
                  : "border-[#E7E0D8] bg-white text-[#334155] hover:bg-[#FCFBF9]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total" value={counts.total} />
          <StatCard label="Nuevos" value={counts.nuevo} />
          <StatCard label="Contactados" value={counts.contactado} />
          <StatCard label="Seguimiento" value={counts.seguimiento} />
          <StatCard label="Cerrados" value={counts.cerrado} />
          <StatCard label="Descartados" value={counts.descartado} />
        </div>
      </div>

      {error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[32px] border border-[#E7E0D8] bg-white shadow-[0_12px_40px_rgba(42,26,18,0.04)]">
        {loading ? (
          <div className="p-8 text-sm text-[#64748B]">Cargando clientes…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-sm text-[#64748B]">No se encontraron clientes.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-[#EEE7DE] bg-[#FCFBF9]">
                <tr className="text-xs uppercase tracking-[0.18em] text-[#64748B]">
                  <th className="px-5 py-4 font-semibold">Empresa</th>
                  <th className="px-5 py-4 font-semibold">Contacto</th>
                  <th className="px-5 py-4 font-semibold">Tipo</th>
                  <th className="px-5 py-4 font-semibold">Ciudad</th>
                  <th className="px-5 py-4 font-semibold">Estatus</th>
                  <th className="px-5 py-4 font-semibold">Fecha</th>
                  <th className="px-5 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#F1ECE5] transition hover:bg-[#FCFBF9] last:border-b-0"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-[#0F172A]">
                        {item.company_name || "—"}
                      </div>
                      <div className="mt-1 text-xs text-[#64748B]">
                        {item.email || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="text-sm text-[#0F172A]">
                        {item.contact_name || "—"}
                      </div>
                      <div className="mt-1 text-xs text-[#64748B]">
                        {item.phone || "Sin teléfono"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top text-sm text-[#334155]">
                      {item.business_type || "—"}
                    </td>

                    <td className="px-5 py-4 align-top text-sm text-[#334155]">
                      {item.city || "—"}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <span
                        className={cx(
                          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                          statusBadgeClass(item.status)
                        )}
                      >
                        {item.status || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-top text-sm text-[#334155]">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-5 py-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => openDrawer(item)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E7E0D8] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] transition hover:bg-[#FCFBF9]"
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            aria-label="Cerrar detalle"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-[700px] overflow-y-auto border-l border-[#E7E0D8] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-[#EEE7DE] bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-[#64748B]">Detalle del cliente</div>
                  <div className="mt-1 text-xl font-semibold text-[#0F172A]">
                    {selected.company_name || "Empresa"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E0D8] bg-white text-[#0F172A] transition hover:bg-[#FCFBF9]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard icon={Building2} label="Empresa" value={selected.company_name || "—"} />
                <InfoCard icon={Mail} label="Correo" value={selected.email || "—"} />
                <InfoCard icon={Phone} label="Teléfono" value={selected.phone || "—"} />
                <InfoCard icon={MapPin} label="Ciudad" value={selected.city || "—"} />
                <InfoCard icon={Package2} label="Tipo de negocio" value={selected.business_type || "—"} />
                <InfoCard icon={CalendarDays} label="Fecha de registro" value={formatDate(selected.created_at)} />
              </div>

              <div className="rounded-[28px] border border-[#E7E0D8] bg-[#FCFBF9] p-5">
                <div className="text-sm font-semibold text-[#0F172A]">
                  Volumen mensual estimado
                </div>
                <div className="mt-2 text-sm text-[#475569]">
                  {selected.monthly_volume || "—"}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E7E0D8] bg-[#FCFBF9] p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <MessageSquareText className="h-4 w-4" />
                  Mensaje
                </div>
                <p className="text-sm leading-7 text-[#475569]">
                  {selected.message || "Sin mensaje."}
                </p>
              </div>

              <div className="rounded-[28px] border border-[#E7E0D8] bg-white p-5">
                <label className="text-sm font-semibold text-[#0F172A]">Estatus</label>
                <select
                  value={drawerStatus}
                  onChange={(e) => setDrawerStatus(e.target.value)}
                  className="mt-2 h-11 w-full rounded-2xl border border-[#E7E0D8] bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#6B3E26]/30 focus:ring-2 focus:ring-[#6B3E26]/10"
                >
                  {STATUS_OPTIONS.filter((x) => x.value !== "todos").map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <label className="mt-5 block text-sm font-semibold text-[#0F172A]">
                  Notas internas
                </label>
                <textarea
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  rows={6}
                  placeholder="Escribe aquí seguimiento, acuerdos o contexto comercial..."
                  className="mt-2 w-full rounded-2xl border border-[#E7E0D8] bg-white px-4 py-3 text-sm text-[#0F172A] outline-none transition focus:border-[#6B3E26]/30 focus:ring-2 focus:ring-[#6B3E26]/10"
                />

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={saveLead}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2A1A12] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1E120D] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>

                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="inline-flex items-center justify-center rounded-2xl border border-[#E7E0D8] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-[#FCFBF9]"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-4 text-xs text-[#64748B]">
                  Última actualización: {formatDate(selected.updated_at)}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[#E7E0D8] bg-[#FCFBF9] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[#64748B]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[#0F172A]">{value}</div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-[#E7E0D8] bg-[#FCFBF9] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#64748B]">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-[#0F172A]">{value}</div>
    </div>
  );
}
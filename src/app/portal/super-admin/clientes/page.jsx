"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  User,
  Mail,
  Phone,
  Tag,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Search,
  UploadCloud,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

// ✅ Tu bucket público
const CLIENT_LOGO_BUCKET = "client-logos";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function safeStr(v) {
  return v == null ? "" : String(v);
}

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);

  return v;
}

const PRICE_TIER_OPTIONS = [
  { value: "precio_web", label: "Precio web" },
  { value: "precio_publico", label: "Precio público" },
  { value: "precio_medio", label: "Precio medio" },
  { value: "precio_mayoreo", label: "Precio mayoreo" },
];

const CLIENT_FIELDS = [
  { key: "business_name", label: "Negocio" },
  { key: "owner_first_name", label: "Nombre" },
  { key: "owner_middle_name", label: "2do nombre" },
  { key: "owner_last_name_paterno", label: "Apellido paterno" },
  { key: "owner_last_name_materno", label: "Apellido materno" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Teléfono" },
  { key: "street", label: "Calle" },
  { key: "ext_number", label: "No. Ext" },
  { key: "int_number", label: "No. Int" },
  { key: "neighborhood", label: "Colonia" },
  { key: "municipality", label: "Municipio" },
  { key: "state", label: "Estado" },
  { key: "postal_code", label: "CP" },
  { key: "address", label: "Dirección (legacy)" },
  { key: "price_tier", label: "Tipo de precio" },
  { key: "logo_url", label: "Logo URL" },
];

function pickEditableClientFields(obj) {
  const out = {};

  for (const f of CLIENT_FIELDS) {
    if (f.key in obj) out[f.key] = obj[f.key];
  }

  return out;
}

/* ---------------- Toast (sin librerías) ---------------- */

function Toasts({ toasts, onClose }) {
  return (
    <div className="fixed right-4 top-4 z-[1000] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => {
        const Icon =
          t.type === "success"
            ? CheckCircle2
            : t.type === "error"
            ? AlertTriangle
            : Info;

        const border =
          t.type === "success"
            ? "border-green-200 bg-green-50 text-green-900"
            : t.type === "error"
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-neutral-200 bg-white text-neutral-900";

        return (
          <div
            key={t.id}
            className={cx("rounded-2xl border p-3 shadow-sm", border)}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5" />

              <div className="flex-1">
                <div className="text-sm font-semibold">{t.title}</div>

                {t.message ? (
                  <div className="mt-0.5 text-xs opacity-80">
                    {t.message}
                  </div>
                ) : null}
              </div>

              <button
                onClick={() => onClose(t.id)}
                className="rounded-full px-2 py-1 text-xs font-semibold opacity-70 hover:opacity-100"
                aria-label="Cerrar"
                title="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);

  function pushToast({ type = "info", title, message, ttl = 3200 }) {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const toast = {
      id,
      type,
      title: title || "Info",
      message: message || "",
    };

    setToasts((s) => [toast, ...s].slice(0, 4));

    if (ttl > 0) {
      window.setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== id));
      }, ttl);
    }
  }

  function closeToast(id) {
    setToasts((s) => s.filter((x) => x.id !== id));
  }

  return { toasts, pushToast, closeToast };
}

/* ---------------- UI helpers ---------------- */

function Modal({ open, title, children, onClose, busy }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={busy ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-6">
            <div>
              <div className="text-lg font-semibold text-neutral-900">
                {title}
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                Solo super-admin
              </div>
            </div>

            <button
              onClick={busy ? undefined : onClose}
              className={cx(
                "rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50 transition",
                busy && "opacity-60 cursor-not-allowed"
              )}
            >
              Cerrar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoThumb({ url, name }) {
  const src = safeStr(url).trim();

  const initials = useMemo(() => {
    const s = safeStr(name).trim();

    if (!s) return "—";

    return s
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("");
  }, [name]);

  return (
    <div className="h-10 w-10 rounded-2xl border border-neutral-200 bg-white overflow-hidden flex items-center justify-center">
      {src ? (
        <img
          src={src}
          alt={safeStr(name) || "Logo"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : null}

      {!src ? (
        <div className="text-xs font-semibold text-neutral-500">
          {initials}
        </div>
      ) : null}
    </div>
  );
}

function Th({ icon: Icon, children, right }) {
  return (
    <th
      className={cx(
        "px-4 py-3 text-xs font-semibold text-neutral-700",
        right && "text-right"
      )}
    >
      <span
        className={cx(
          "inline-flex items-center gap-2",
          right && "justify-end w-full"
        )}
      >
        {Icon ? <Icon className="h-4 w-4 text-neutral-500" /> : null}
        {children}
      </span>
    </th>
  );
}

/* ---------------- Upload logo via API ---------------- */

async function uploadClientLogo({ file, clientId }) {
  if (!file) return null;

  const fd = new FormData();
  fd.append("clientId", clientId);
  fd.append("file", file);

  const res = await fetch("/api/superadmin/clientes/upload-logo", {
    method: "POST",
    body: fd,
  });

  const json = await res.json();

  if (!res.ok) throw new Error(json?.error || "No se pudo subir el logo");

  return json.publicUrl || null;
}

function ClientForm({ initial, clientId, onSubmit, submitting, toast }) {
  const [form, setForm] = useState(() => ({
    ...CLIENT_FIELDS.reduce((acc, f) => {
      acc[f.key] = initial?.[f.key] ?? "";
      return acc;
    }, {}),
  }));

  const [logoFile, setLogoFile] = useState(null);
  const [logoLocalPreview, setLogoLocalPreview] = useState("");

  useEffect(() => {
    setForm(
      CLIENT_FIELDS.reduce((acc, f) => {
        acc[f.key] = initial?.[f.key] ?? "";
        return acc;
      }, {})
    );

    setLogoFile(null);
    setLogoLocalPreview("");
  }, [initial]);

  useEffect(() => {
    if (!logoFile) {
      setLogoLocalPreview("");
      return;
    }

    const url = URL.createObjectURL(logoFile);
    setLogoLocalPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const currentLogo = safeStr(form.logo_url).trim();
  const previewLogo = logoLocalPreview || currentLogo;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        let patch = { ...form };

        // ✅ upload primero si hay archivo seleccionado
        if (logoFile && clientId) {
          const url = await uploadClientLogo({ file: logoFile, clientId });
          patch.logo_url = url || patch.logo_url;

          toast?.({
            type: "success",
            title: "Logo subido",
            message: "Se actualizó el logo del cliente.",
          });
        }

        onSubmit(patch);
      }}
      className="space-y-6"
    >
      {/* Logo upload */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            Logo del negocio (PNG/JPG/WebP)
          </div>

          {(logoFile || currentLogo) && (
            <button
              type="button"
              onClick={() => {
                setLogoFile(null);
                setLogoLocalPreview("");
                setForm((s) => ({ ...s, logo_url: "" }));
              }}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
              disabled={submitting}
              title="Quitar logo"
            >
              <X className="h-4 w-4" />
              Quitar
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-[rgba(49,87,44,0.18)]"
              disabled={submitting}
            />

            <div className="mt-2 text-xs text-neutral-500">
              Al guardar, se sube al bucket <b>{CLIENT_LOGO_BUCKET}</b> y se
              actualiza <b>logo_url</b>.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LogoThumb url={previewLogo} name={form.business_name} />

            <div className="text-xs text-neutral-600">
              {previewLogo ? "Preview listo" : "Sin logo"}
            </div>
          </div>
        </div>
      </div>

      {/* Campos: con select para tipo de precio */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CLIENT_FIELDS.map((f) => {
          if (f.key === "logo_url") return null;

          if (f.key === "price_tier") {
            return (
              <label key={f.key} className="block">
                <div className="text-xs text-neutral-600">{f.label}</div>

                <select
                  value={safeStr(form.price_tier)}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      price_tier: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-[rgba(49,87,44,0.18)]"
                  disabled={submitting}
                >
                  <option value="">— Selecciona —</option>

                  {PRICE_TIER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          return (
            <label key={f.key} className="block">
              <div className="text-xs text-neutral-600">{f.label}</div>

              <input
                value={safeStr(form[f.key])}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    [f.key]: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-[rgba(49,87,44,0.18)]"
                placeholder={f.label}
                disabled={submitting}
              />
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: BRAND_GREEN }}
          onMouseEnter={(e) =>
            !e.currentTarget.disabled &&
            (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)
          }
          onMouseLeave={(e) =>
            !e.currentTarget.disabled &&
            (e.currentTarget.style.backgroundColor = BRAND_GREEN)
          }
        >
          {submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

export default function ClientesPage() {
  const router = useRouter();
  const { toasts, pushToast, closeToast } = useToasts();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const dq = useDebounced(q, 350);

  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState("");

  useEffect(() => setPage(1), [dq, pageSize]);

  async function load({ signal } = {}) {
    setLoading(true);
    setError("");

    try {
      const url =
        `/api/superadmin/clientes?q=${encodeURIComponent(dq)}` +
        `&page=${page}&pageSize=${pageSize}`;

      const res = await fetch(url, { cache: "no-store", signal });
      const text = await res.text();
      const json = JSON.parse(text);

      if (!res.ok) throw new Error(json?.error || "Error al cargar clientes");

      setRows(Array.isArray(json?.rows) ? json.rows : []);
      setMeta({
        total: json?.total || 0,
        totalPages: json?.totalPages || 1,
      });
    } catch (e) {
      if (String(e?.name) !== "AbortError") {
        setError(e.message || "Error inesperado");
        setRows([]);
        setMeta({ total: 0, totalPages: 1 });

        pushToast({
          type: "error",
          title: "Error",
          message: e.message || "No se pudo cargar.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    load({ signal: ac.signal });

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq, page, pageSize]);

  async function updateClient(id, patch) {
    if (!id) {
      setError("id requerido");

      pushToast({
        type: "error",
        title: "Error",
        message: "id requerido",
      });

      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/superadmin/clientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "No se pudo actualizar");

      pushToast({
        type: "success",
        title: "Cliente actualizado",
        message: "Cambios guardados correctamente.",
      });

      setEditOpen(false);
      setEditRow(null);

      await load();
    } catch (e) {
      setError(e.message || "Error inesperado");

      pushToast({
        type: "error",
        title: "Error al guardar",
        message: e.message || "Intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteClient(id) {
    const ok = confirm(
      "¿Seguro que deseas eliminar este cliente? Esta acción no se puede deshacer."
    );

    if (!ok) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/superadmin/clientes/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "No se pudo eliminar");

      pushToast({
        type: "success",
        title: "Cliente eliminado",
        message: "Se eliminó correctamente.",
      });

      await load();
    } catch (e) {
      setError(e.message || "Error inesperado");

      pushToast({
        type: "error",
        title: "Error al eliminar",
        message: e.message || "Intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function loadDistributors() {
    try {
      const res = await fetch("/api/superadmin/distribuidores/list");
      const json = await res.json();

      if (!res.ok)
        throw new Error(json?.error || "Error cargando distribuidores");

      setDistributors(json.rows || []);
    } catch (e) {
      pushToast({
        type: "error",
        title: "Error",
        message: e.message,
      });
    }
  }

  async function assignDistributor(forceReplace = false) {
    if (!assignRow?.id || !selectedDistributor) return;

    setSaving(true);

    try {
      const res = await fetch("/api/superadmin/clientes/asignar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: assignRow.id,
          distributor_id: selectedDistributor,
          force_replace: forceReplace,
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "No se pudo asignar");

      // YA EXISTÍA ASIGNACIÓN
      if (json.already_assigned) {
        const ok = confirm(
          `Este cliente ya está asignado a ${json.current_distributor_name}. ¿Deseas reemplazarlo?`
        );

        if (ok) {
          setSaving(false);
          return assignDistributor(true);
        } else {
          setSaving(false);
          return;
        }
      }

      pushToast({
        type: "success",
        title: json.replaced ? "Reasignado" : "Asignado",
        message: json.replaced
          ? "Distribuidor cambiado correctamente."
          : "Distribuidor asignado correctamente.",
      });

      setAssignOpen(false);
      setAssignRow(null);
      setSelectedDistributor("");
    } catch (e) {
      pushToast({
        type: "error",
        title: "Error",
        message: e.message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Toasts toasts={toasts} onClose={closeToast} />

      <div className="w-full min-h-screen flex flex-col">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900">
                Socios Xhunco
              </h1>

              <p className="mt-2 text-sm text-neutral-600">
                Administra Socios: alta, edición, estado y datos de contacto.
              </p>
            </div>

            <Link
              href="/portal/super-admin/clientes/nuevo"
              className="rounded-full px-5 py-2 text-sm font-semibold text-white transition"
              style={{ backgroundColor: BRAND_GREEN }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = BRAND_GREEN)
              }
            >
              + Crear cliente
            </Link>
          </div>

          {/* Buscador */}
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-[rgba(49,87,44,0.18)]"
                  placeholder="Buscar por negocio, email, teléfono, nombre, municipio..."
                />
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              {loading ? "Cargando..." : `Total: ${meta.total}`}
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 text-sm text-neutral-500">
              Cargando Socios…
            </div>
          ) : rows.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-10 text-center">
              <div className="text-lg font-medium text-neutral-900">
                Sin Socios
              </div>

              <div className="mt-2 text-sm text-neutral-600">
                Aún no hay registros. Crea el primer Socio.
              </div>

              <button
                onClick={() =>
                  router.push("/portal/super-admin/clientes/nuevo")
                }
                className="mt-6 rounded-full px-5 py-2 text-sm font-semibold text-white transition"
                style={{ backgroundColor: BRAND_GREEN }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_GREEN)
                }
              >
                + Crear cliente
              </button>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="min-w-[1020px] w-full text-sm">
                  <thead className="bg-neutral-50">
                    <tr className="text-left">
                      <Th icon={ImageIcon}>Logo</Th>
                      <Th icon={Store}>Negocio</Th>
                      <Th icon={User}>Socio</Th>
                      <Th icon={Mail}>Email</Th>
                      <Th icon={Phone}>Teléfono</Th>
                      <Th icon={Tag}>Tipo de precio</Th>
                      <Th icon={User}>Distribuidor</Th>
                      <Th right>Acciones</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((r) => {
                      const distributor = r.distributor_clients?.[0]?.profiles
                        ? `${
                            r.distributor_clients[0].profiles.first_name || ""
                          } ${
                            r.distributor_clients[0].profiles
                              .last_name_paterno || ""
                          }`.trim()
                        : "";

                      const owner = [
                        r.owner_first_name,
                        r.owner_middle_name,
                        r.owner_last_name_paterno,
                        r.owner_last_name_materno,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const tierLabel =
                        PRICE_TIER_OPTIONS.find(
                          (x) => x.value === r.price_tier
                        )?.label ||
                        r.price_tier ||
                        "—";

                      return (
                        <tr
                          key={r.id}
                          className="border-t border-neutral-200 text-neutral-800"
                        >
                          <td className="px-4 py-3">
                            <LogoThumb
                              url={r.logo_url}
                              name={r.business_name}
                            />
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-neutral-900">
                              {r.business_name || "—"}
                            </div>

                            <div className="text-xs text-neutral-500">
                              {r.municipality ? `${r.municipality}, ` : ""}
                              {r.state || ""}
                            </div>
                          </td>

                          <td className="px-4 py-3">{owner || "—"}</td>

                          <td className="px-4 py-3">{r.email || "—"}</td>

                          <td className="px-4 py-3">{r.phone || "—"}</td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
                              {tierLabel}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {distributor ? (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                {distributor}
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                Sin asignar
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditRow(r);
                                  setEditOpen(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ backgroundColor: BRAND_GREEN }}
                                onMouseEnter={(e) =>
                                  !saving &&
                                  (e.currentTarget.style.backgroundColor =
                                    BRAND_GREEN_DARK)
                                }
                                onMouseLeave={(e) =>
                                  !saving &&
                                  (e.currentTarget.style.backgroundColor =
                                    BRAND_GREEN)
                                }
                                disabled={saving}
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </button>

                              <button
                                onClick={() => deleteClient(r.id)}
                                className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={saving}
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>

                              <button
                                onClick={async () => {
                                  setAssignRow(r);
                                  setAssignOpen(true);
                                  await loadDistributors();
                                }}
                                className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                              >
                                Asignar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginación */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="text-xs text-neutral-500">
              Página {page} / {meta.totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                disabled={page >= meta.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: BRAND_GREEN }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_GREEN)
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {/* Editar */}
        <Modal
          open={editOpen}
          title="Editar cliente"
          busy={saving}
          onClose={() => {
            if (saving) return;
            setEditOpen(false);
            setEditRow(null);
          }}
        >
          <ClientForm
            initial={editRow ? pickEditableClientFields(editRow) : {}}
            clientId={editRow?.id || null}
            submitting={saving}
            toast={pushToast}
            onSubmit={(form) => {
              if (!editRow?.id) {
                setError("id requerido");

                pushToast({
                  type: "error",
                  title: "Error",
                  message: "id requerido",
                });

                return;
              }

              updateClient(editRow.id, form);
            }}
          />
        </Modal>

        <Modal
          open={assignOpen}
          title="Asignar distribuidor"
          busy={saving}
          onClose={() => {
            setAssignOpen(false);
            setAssignRow(null);
            setSelectedDistributor("");
          }}
        >
          <div className="space-y-4">
            <div className="text-sm text-neutral-700">
              Cliente:
              <b className="ml-2">{assignRow?.business_name}</b>
            </div>

            <select
              value={selectedDistributor}
              onChange={(e) => setSelectedDistributor(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3"
            >
              <option value="">Selecciona distribuidor</option>

              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.first_name} {d.last_name_paterno}
                </option>
              ))}
            </select>

            <div className="flex justify-end">
              <button
                onClick={() => assignDistributor()}
                disabled={!selectedDistributor || saving}
                className="rounded-full px-5 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                Guardar asignación
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
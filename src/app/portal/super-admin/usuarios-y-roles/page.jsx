"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ShieldCheck,
  Users,
  UserCog,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react";

const BRAND_GREEN = "#31572c";

const ROLE_OPTIONS = [
  { value: "all", label: "Todos los roles" },
  { value: "super_admin", label: "Super admin" },
  { value: "admin", label: "Admin" },
  { value: "cliente", label: "Cliente" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
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

function roleLabel(role) {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  return found?.label || role || "Sin rol";
}

function roleBadgeClasses(role) {
  if (role === "super_admin") {
    return "bg-emerald-100 text-emerald-800 border border-emerald-200";
  }
  if (role === "admin") {
    return "bg-amber-100 text-amber-800 border border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function statusBadgeClasses(active) {
  return active
    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
    : "bg-red-100 text-red-700 border border-red-200";
}

function StatCard({ icon: Icon, title, value, hint }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-black/45">
            {title}
          </div>
          <div className="mt-2 text-3xl font-semibold text-black">{value}</div>
          {hint ? <div className="mt-1 text-sm text-black/55">{hint}</div> : null}
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#eef6ee", color: BRAND_GREEN }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
      <div className="hidden min-w-full md:block">
        <div className="grid grid-cols-12 gap-4 border-b border-black/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
          <div className="col-span-3">Usuario</div>
          <div className="col-span-2">Rol actual</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2">Cambiar rol</div>
          <div className="col-span-2">Registro</div>
          <div className="col-span-1">Acción</div>
        </div>

        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 border-b border-black/5 px-6 py-4"
          >
            <div className="col-span-3">
              <div className="h-4 w-40 animate-pulse rounded bg-black/5" />
              <div className="mt-2 h-3 w-56 animate-pulse rounded bg-black/5" />
            </div>
            <div className="col-span-2">
              <div className="h-8 w-24 animate-pulse rounded-full bg-black/5" />
            </div>
            <div className="col-span-2">
              <div className="h-8 w-24 animate-pulse rounded-full bg-black/5" />
            </div>
            <div className="col-span-2">
              <div className="h-10 w-full animate-pulse rounded-2xl bg-black/5" />
            </div>
            <div className="col-span-2">
              <div className="h-4 w-24 animate-pulse rounded bg-black/5" />
            </div>
            <div className="col-span-1">
              <div className="h-10 w-full animate-pulse rounded-2xl bg-black/5" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 p-4 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-black/10 p-4">
            <div className="h-4 w-40 animate-pulse rounded bg-black/5" />
            <div className="mt-2 h-3 w-52 animate-pulse rounded bg-black/5" />
            <div className="mt-4 h-8 w-24 animate-pulse rounded-full bg-black/5" />
            <div className="mt-3 h-10 animate-pulse rounded-2xl bg-black/5" />
            <div className="mt-3 h-10 animate-pulse rounded-2xl bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#fff4e5", color: "#b45309" }}
          >
            <AlertTriangle size={22} />
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 text-black/55 transition hover:bg-black/[0.03] disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="mt-4 text-xl font-semibold text-black">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-black/60">{description}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black transition hover:bg-black/[0.03] disabled:opacity-40"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {loading ? "Guardando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminUsuariosRolesPage() {
  const [users, setUsers] = useState([]);
  const [draftRoles, setDraftRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    superAdmins: 0,
    admins: 0,
    clientes: 0,
    active: 0,
    inactive: 0,
  });
  const [confirmState, setConfirmState] = useState({
    open: false,
    userId: "",
    currentRole: "",
    nextRole: "",
    userName: "",
  });

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  });

  const abortRef = useRef(null);
  const successTimerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  const clearSuccessLater = useCallback(() => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(meta.pageSize),
        role: roleFilter,
        status: statusFilter,
      });

      if (debouncedQuery) params.set("q", debouncedQuery);

      const res = await fetch(`/api/superadmin/users-roles?${params.toString()}`, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo cargar la lista de usuarios.");
      }

      const incomingUsers = Array.isArray(json?.users) ? json.users : [];
      setUsers(incomingUsers);

      const nextDrafts = {};
      for (const u of incomingUsers) {
        nextDrafts[u.id] = u.role || "cliente";
      }
      setDraftRoles(nextDrafts);

      setMeta({
        total: Number(json?.meta?.total || 0),
        page: Number(json?.meta?.page || page),
        pageSize: Number(json?.meta?.pageSize || meta.pageSize),
        totalPages: Number(json?.meta?.totalPages || 1),
      });

      setStats({
        total: Number(json?.stats?.total || 0),
        superAdmins: Number(json?.stats?.superAdmins || 0),
        admins: Number(json?.stats?.admins || 0),
        clientes: Number(json?.stats?.clientes || 0),
        active: Number(json?.stats?.active || 0),
        inactive: Number(json?.stats?.inactive || 0),
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setErrorMessage(err.message || "Ocurrió un error al cargar usuarios.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, roleFilter, statusFilter, meta.pageSize]);

  useEffect(() => {
    loadUsers();

    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [loadUsers]);

  const hasFiltersApplied = useMemo(() => {
    return !!debouncedQuery || roleFilter !== "all" || statusFilter !== "all";
  }, [debouncedQuery, roleFilter, statusFilter]);

  function openConfirm(userId) {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const currentRole = target.role || "cliente";
    const nextRole = draftRoles[userId] || currentRole;

    if (currentRole === nextRole) return;

    setConfirmState({
      open: true,
      userId,
      currentRole,
      nextRole,
      userName: target.full_name || target.email || "este usuario",
    });
  }

  function closeConfirm() {
    if (savingId) return;
    setConfirmState({
      open: false,
      userId: "",
      currentRole: "",
      nextRole: "",
      userName: "",
    });
  }

  async function handleConfirmSave() {
    const { userId, currentRole, nextRole } = confirmState;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const prevUsers = users;
    const prevStats = stats;

    try {
      setSavingId(userId);
      setErrorMessage("");
      setSuccessMessage("");

      setUsers((curr) =>
        curr.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
      );

      setStats((curr) => {
        const next = { ...curr };
        if (currentRole === "super_admin") next.superAdmins = Math.max(0, next.superAdmins - 1);
        if (currentRole === "admin") next.admins = Math.max(0, next.admins - 1);
        if (currentRole === "cliente") next.clientes = Math.max(0, next.clientes - 1);

        if (nextRole === "super_admin") next.superAdmins += 1;
        if (nextRole === "admin") next.admins += 1;
        if (nextRole === "cliente") next.clientes += 1;

        return next;
      });

      const res = await fetch("/api/superadmin/users-roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo actualizar el rol.");
      }

      setSuccessMessage("Rol actualizado correctamente.");
      clearSuccessLater();
      closeConfirm();
    } catch (err) {
      setUsers(prevUsers);
      setStats(prevStats);
      setDraftRoles((curr) => ({
        ...curr,
        [userId]: currentRole,
      }));
      setErrorMessage(err.message || "No se pudo actualizar el rol.");
    } finally {
      setSavingId(null);
    }
  }

  const confirmTitle = useMemo(() => {
    if (!confirmState.open) return "";
    return "Confirmar cambio de rol";
  }, [confirmState.open]);

  const confirmDescription = useMemo(() => {
    if (!confirmState.open) return "";
    return `Vas a cambiar el rol de ${confirmState.userName} de ${roleLabel(
      confirmState.currentRole
    )} a ${roleLabel(confirmState.nextRole)}. Esta acción impacta los permisos de acceso dentro del sistema.`;
  }, [confirmState]);

  return (
    <div className="w-full max-w-none p-4 md:p-6">
      <ConfirmModal
        open={confirmState.open}
        title={confirmTitle}
        description={confirmDescription}
        confirmText="Sí, guardar cambio"
        cancelText="Cancelar"
        loading={!!savingId}
        onConfirm={handleConfirmSave}
        onClose={closeConfirm}
      />

      <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ backgroundColor: "#eef6ee", color: BRAND_GREEN }}
            >
              <ShieldCheck size={14} />
              Administración de accesos
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black md:text-4xl">
              Usuarios y roles
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60 md:text-[15px]">
              Visualiza los usuarios registrados y administra sus permisos
            </p> 
          </div>

          <button
            onClick={loadUsers}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black transition hover:bg-black/[0.03]"
          >
            <RefreshCw size={17} />
            Recargar
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          title="Usuarios totales"
          value={stats.total}
          hint="Usuarios registrados en el sistema"
        />
        <StatCard
          icon={ShieldCheck}
          title="Super admins"
          value={stats.superAdmins}
          hint="Máximo nivel de control"
        />
        <StatCard
          icon={UserCog}
          title="Admins"
          value={stats.admins}
          hint="Gestión operativa"
        />
        <StatCard
          icon={BadgeCheck}
          title="Clientes"
          value={stats.clientes}
          hint="Usuarios del portal"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid w-full gap-4 xl:grid-cols-[minmax(280px,1fr)_220px_220px]">
            <div className="relative w-full">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, correo, teléfono o rol..."
                className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-black/50">
            Página {meta.page} de {meta.totalPages}
          </div>
        </div>

        {hasFiltersApplied ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {debouncedQuery ? (
              <span className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                Búsqueda: {debouncedQuery}
              </span>
            ) : null}

            {roleFilter !== "all" ? (
              <span className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                Rol: {roleLabel(roleFilter)}
              </span>
            ) : null}

            {statusFilter !== "all" ? (
              <span className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                Estado: {statusFilter === "active" ? "Activo" : "Inactivo"}
              </span>
            ) : null}

            <button
              onClick={() => {
                setQuery("");
                setDebouncedQuery("");
                setRoleFilter("all");
                setStatusFilter("all");
                setPage(1);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/70 transition hover:bg-black/[0.03]"
            >
              <X size={12} />
              Limpiar filtros
            </button>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
            <div className="hidden md:block">
              <div className="grid grid-cols-12 gap-4 border-b border-black/5 bg-black/[0.02] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                <div className="col-span-3">Usuario</div>
                <div className="col-span-2">Rol actual</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-2">Cambiar rol</div>
                <div className="col-span-2">Registro</div>
                <div className="col-span-1">Acción</div>
              </div>

              {users.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="text-lg font-medium text-black">
                    No se encontraron usuarios
                  </div>
                  <div className="mt-2 text-sm text-black/55">
                    Ajusta los filtros o recarga la información.
                  </div>
                </div>
              ) : (
                users.map((user) => {
                  const currentRole = user.role || "cliente";
                  const draftRole = draftRoles[user.id] || currentRole;
                  const changed = draftRole !== currentRole;
                  const isSaving = savingId === user.id;

                  return (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 gap-4 border-b border-black/5 px-6 py-5 last:border-b-0"
                    >
                      <div className="col-span-3 min-w-0">
                        <div className="truncate text-sm font-semibold text-black">
                          {user.full_name || "Sin nombre"}
                        </div>
                        <div className="mt-1 truncate text-sm text-black/55">
                          {user.email || "Sin correo"}
                        </div>
                        {user.phone ? (
                          <div className="mt-1 truncate text-xs text-black/40">
                            {user.phone}
                          </div>
                        ) : null}
                      </div>

                      <div className="col-span-2">
                        <span
                          className={cx(
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            roleBadgeClasses(currentRole)
                          )}
                        >
                          {roleLabel(currentRole)}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                            statusBadgeClasses(user.active)
                          )}
                        >
                          {user.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <select
                          value={draftRole}
                          onChange={(e) =>
                            setDraftRoles((curr) => ({
                              ...curr,
                              [user.id]: e.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5"
                        >
                          {ROLE_OPTIONS.filter((r) => r.value !== "all").map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2 text-sm text-black/55">
                        {formatDate(user.created_at)}
                      </div>

                      <div className="col-span-1">
                        <button
                          onClick={() => openConfirm(user.id)}
                          disabled={!changed || isSaving}
                          className={cx(
                            "inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold transition",
                            !changed || isSaving
                              ? "cursor-not-allowed border border-black/10 bg-black/[0.04] text-black/35"
                              : "text-white shadow-sm hover:opacity-95"
                          )}
                          style={
                            !changed || isSaving
                              ? undefined
                              : { backgroundColor: BRAND_GREEN }
                          }
                        >
                          {isSaving ? "..." : "Guardar"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-4 p-4 md:hidden">
              {users.length === 0 ? (
                <div className="rounded-3xl border border-black/10 p-6 text-center">
                  <div className="text-base font-semibold text-black">
                    No se encontraron usuarios
                  </div>
                  <div className="mt-2 text-sm text-black/55">
                    Intenta con otro filtro o búsqueda.
                  </div>
                </div>
              ) : (
                users.map((user) => {
                  const currentRole = user.role || "cliente";
                  const draftRole = draftRoles[user.id] || currentRole;
                  const changed = draftRole !== currentRole;
                  const isSaving = savingId === user.id;

                  return (
                    <div
                      key={user.id}
                      className="rounded-3xl border border-black/10 bg-white p-4"
                    >
                      <div className="text-sm font-semibold text-black">
                        {user.full_name || "Sin nombre"}
                      </div>
                      <div className="mt-1 break-all text-sm text-black/55">
                        {user.email || "Sin correo"}
                      </div>
                      {user.phone ? (
                        <div className="mt-1 text-xs text-black/40">{user.phone}</div>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={cx(
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            roleBadgeClasses(currentRole)
                          )}
                        >
                          {roleLabel(currentRole)}
                        </span>

                        <span
                          className={cx(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                            statusBadgeClasses(user.active)
                          )}
                        >
                          {user.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div className="mt-4 text-xs uppercase tracking-[0.14em] text-black/40">
                        Cambiar rol
                      </div>

                      <select
                        value={draftRole}
                        onChange={(e) =>
                          setDraftRoles((curr) => ({
                            ...curr,
                            [user.id]: e.target.value,
                          }))
                        }
                        className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none"
                      >
                        {ROLE_OPTIONS.filter((r) => r.value !== "all").map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <div className="mt-3 text-sm text-black/50">
                        Registro: {formatDate(user.created_at)}
                      </div>

                      <button
                        onClick={() => openConfirm(user.id)}
                        disabled={!changed || isSaving}
                        className={cx(
                          "mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold transition",
                          !changed || isSaving
                            ? "cursor-not-allowed border border-black/10 bg-black/[0.04] text-black/35"
                            : "text-white shadow-sm hover:opacity-95"
                        )}
                        style={
                          !changed || isSaving
                            ? undefined
                            : { backgroundColor: BRAND_GREEN }
                        }
                      >
                        {isSaving ? "Guardando..." : "Guardar cambio"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-black/55">
          Mostrando {users.length} usuario{users.length === 1 ? "" : "s"} de {meta.total}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <div className="min-w-[92px] text-center text-sm font-medium text-black">
            {page} / {meta.totalPages}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
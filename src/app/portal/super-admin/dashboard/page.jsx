"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  BadgeDollarSign,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

const BRAND_GREEN = "#31572c";

export default function SuperAdminDashboardPage() {
  const [firstName, setFirstName] = useState("Usuario");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setFirstName(String(json?.first_name || "Usuario"));
      } catch {
        if (!alive) return;
        setFirstName("Usuario");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Buenos días";
    if (h >= 12 && h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-0px)] flex flex-col">
      {/* Header */}
      <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7 lg:p-8">
        <div className="text-sm text-black/60">
       <div className="text-sm text-black/60">Bienvenido, {firstName}</div>
       <div className="mt-1 text-xs text-black/40">{greeting}</div>
</div>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black">
              Panel de control
            </h1>
            <p className="mt-2 max-w-xl text-sm text-black/60">
              Administra clientes, productos y pedidos en un solo lugar. Todo el equipo puede operar
              desde móvil o escritorio con accesibilidad garantizada.
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
            <ActionButton
              href="/portal/super-admin/clientes/nuevo"
              label="Crear cliente"
              icon={UserPlus}
              desc="Alta de clientes y datos comerciales"
            />
            <ActionButton
              href="/portal/super-admin/suministros"
              label="Actualizar precios"
              icon={BadgeDollarSign}
              desc="Catálogo, costos y listas"
            />
            <ActionButton
              href="/portal/super-admin/usuarios"
              label="Asignar roles"
              icon={ShieldCheck}
              desc="Permisos y usuarios internos"
            />
            <ActionButton
              href="/portal/super-admin/pedidos"
              label="Revisar pedidos"
              icon={ClipboardList}
              desc="Seguimiento y estatus"
            />
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-7 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI title="CLIENTES ACTIVOS" value="128" note="+12 este mes" />
          <KPI title="PEDIDOS ACTIVOS" value="24" note="6 con entrega hoy" />
          <KPI title="INGRESOS DEL MES" value="$182,430" note="MXN · +8.4%" />
          <KPI title="PRODUCTOS" value="56" note="4 sin stock" />
        </div>
      </div>

      {/* Inferior */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 flex-1 auto-rows-fr">
        <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6 h-full">
          <div className="text-sm font-medium text-black/80">Actividad reciente</div>
          <div className="mt-2 text-sm text-black/60">
            (Luego conectamos: pedidos recientes, altas de clientes, cambios de precios.)
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6 h-full">
          <div className="text-sm font-medium text-black/80">Alertas</div>
          <div className="mt-2 text-sm text-black/60">
            (Luego conectamos: productos sin stock, pedidos en atraso, pagos pendientes.)
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ href, label, desc, icon: Icon }) {
  return (
    <Link
      href={href}
      className={[
        "group rounded-2xl border border-black/10 bg-white",
        "px-4 py-3 transition",
        "hover:border-black/15 hover:shadow-sm",
        "active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {/* Icon badge */}
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "border border-black/10 bg-black/[0.02]",
            "transition",
            "group-hover:bg-black/[0.03]",
          ].join(" ")}
          aria-hidden="true"
        >
          <Icon size={18} strokeWidth={2} style={{ color: BRAND_GREEN }} />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-black truncate">{label}</div>
            <div
              className={[
                "ml-auto hidden sm:block text-xs",
                "text-black/40 group-hover:text-black/50 transition",
              ].join(" ")}
            >
              Ver →
            </div>
          </div>
          <div className="mt-0.5 text-xs text-black/55 line-clamp-1">{desc}</div>
        </div>
      </div>
    </Link>
  );
}

function KPI({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-xs tracking-wider text-black/50">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-black">{value}</div>
      <div className="mt-2 text-xs" style={{ color: BRAND_GREEN }}>
        {note}
      </div>
    </div>
  );
}
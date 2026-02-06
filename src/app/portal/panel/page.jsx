"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const quickStats = [
  { label: "Clientes activos", value: "128", helper: "+12 este mes" },
  { label: "Pedidos activos", value: "24", helper: "6 con entrega hoy" },
  { label: "Ingresos del mes", value: "$182,430", helper: "MXN · +8.4%" },
  { label: "Productos", value: "56", helper: "4 sin stock" },
];

const quickActions = ["Crear cliente", "Actualizar precios", "Asignar roles", "Revisar pedidos"];

const recommendedSections = [
  {
    title: "Usuarios y roles",
    description: "Permisos granulares por negocio, auditoría de accesos y control de sesiones.",
  },
  {
    title: "Facturación y pagos",
    description: "Gestión de facturas, métodos de pago, cuentas por cobrar y cierres contables.",
  },
  {
    title: "Reportes y analítica",
    description: "Ventas por cliente, productos top, alertas de baja rotación y KPIs clave.",
  },
  {
    title: "Inventario y logística",
    description: "Alertas de stock, fechas de tostado, rutas de entrega y tiempos de preparación.",
  },
  {
    title: "Configuración esencial",
    description: "Parámetros globales, catálogos, costos base y reglas de precios.",
  },
  {
    title: "Soporte y comunicación",
    description: "Mensajería con clientes, tickets y notificaciones automatizadas.",
  },
];

const products = [
  { name: "Café Veracruz 1 kg", sku: "CAF-VER-1KG", price: "$380", status: "Activo" },
  { name: "Café Chiapas 500 g", sku: "CAF-CHI-500", price: "$220", status: "Activo" },
  { name: "Café Puebla 250 g", sku: "CAF-PUE-250", price: "$140", status: "Actualización" },
  { name: "Café Oaxaca 1 kg", sku: "CAF-OAX-1KG", price: "$410", status: "Sin stock" },
];

const activeOrders = [
  { id: "XP-2045", client: "Café Nómada", total: "$3,200", status: "En preparación" },
  { id: "XP-2046", client: "Barista Hub", total: "$1,820", status: "Listo para envío" },
  { id: "XP-2047", client: "Brújula Café", total: "$4,560", status: "Pendiente de pago" },
];

const completedOrders = [
  { id: "XP-2024", client: "Café Santo", total: "$2,760", status: "Entregado" },
  { id: "XP-2025", client: "Comedor 5 Sur", total: "$980", status: "Finalizado" },
];

export default function PanelDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("Resumen");
  const [formState, setFormState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) router.replace("/portal");
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/portal");
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [router]);

  const handleCreateClient = async (event) => {
    event.preventDefault();
    setFormState({ status: "loading", message: "" });

    const formData = new FormData(event.currentTarget);
    const payload = {
      businessName: String(formData.get("businessName") || "").trim(),
      ownerName: String(formData.get("ownerName") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
      role: String(formData.get("role") || "cliente").trim().toLowerCase(),
    };

    try {
      const response = await fetch("/api/suministros/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormState({
          status: "error",
          message: result.error || "No se pudo crear el cliente.",
        });
        return;
      }

      event.currentTarget.reset();
      setFormState({ status: "success", message: "Cliente creado correctamente." });
    } catch (error) {
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido.",
      });
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Alta de clientes":
        return (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Alta de clientes</h3>
              <p className="text-sm text-white/60">
                Captura la información esencial del negocio y asigna el rol adecuado.
              </p>
            </div>

            <form className="mt-6 grid gap-4 text-sm" onSubmit={handleCreateClient}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-white/70">Nombre del negocio</span>
                  <input
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-300 focus:outline-none"
                    placeholder="Café Horizonte"
                    type="text"
                    name="businessName"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-white/70">Responsable</span>
                  <input
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-300 focus:outline-none"
                    placeholder="Nombre completo"
                    type="text"
                    name="ownerName"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-white/70">Domicilio completo</span>
                <input
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-300 focus:outline-none"
                  placeholder="Calle, número, colonia, ciudad"
                  type="text"
                  name="address"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-white/70">Teléfono</span>
                  <input
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-300 focus:outline-none"
                    placeholder="55 1234 5678"
                    type="tel"
                    name="phone"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-white/70">Correo</span>
                  <input
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-300 focus:outline-none"
                    placeholder="correo@negocio.com"
                    type="email"
                    name="email"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-white/70">Contraseña genérica</span>
                  <input
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-300 focus:outline-none"
                    placeholder="XHUNCO-2025"
                    type="text"
                    name="password"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-white/70">Tipo de rol</span>
                  <select
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-white focus:border-emerald-300 focus:outline-none"
                    name="role"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>
                    <option value="super_admin">Super administrador</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-semibold text-slate-950"
                >
                  {formState.status === "loading" ? "Guardando..." : "Guardar cliente"}
                </button>
                <button
                  type="reset"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white"
                  onClick={() => setFormState({ status: "idle", message: "" })}
                >
                  Limpiar formulario
                </button>
              </div>

              {formState.message ? (
                <p
                  className={`text-xs ${
                    formState.status === "success" ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {formState.message}
                </p>
              ) : null}
            </form>
          </section>
        );

      case "Productos":
        return (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Productos</h3>
            <p className="mt-2 text-sm text-white/60">
              Visualiza el catálogo y ajusta precios o descripciones de inmediato.
            </p>
            <div className="mt-4 space-y-3">
              {products.map((product) => (
                <div
                  key={product.sku}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{product.name}</p>
                    <span className="rounded-full border border-white/20 px-2 py-1 text-xs text-white/70">
                      {product.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">SKU: {product.sku}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-emerald-200">{product.price}</p>
                    <button
                      type="button"
                      className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "Pedidos":
        return (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold">Pedidos activos</h3>
                <p className="text-sm text-white/60">
                  Seguimiento de pedidos pendientes de atención o pago.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{order.client}</p>
                      <span className="text-xs text-white/50">{order.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/50">{order.status}</p>
                      <p className="text-base font-semibold text-emerald-200">{order.total}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80"
                      >
                        Ver detalle
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-emerald-300/60 px-3 py-1 text-xs text-emerald-200"
                      >
                        Marcar avance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold">Pedidos finalizados</h3>
                <p className="text-sm text-white/60">Historial reciente de entregas completas.</p>
              </div>
              <div className="mt-4 space-y-3">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{order.client}</p>
                      <span className="text-xs text-white/50">{order.id}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-white/50">{order.status}</p>
                      <p className="text-base font-semibold text-emerald-200">{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "Usuarios y roles":
      case "Configuración":
      case "Reportes":
        return (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">{activeSection}</h3>
            <p className="mt-2 text-sm text-white/60">
              Esta sección está lista para configurarse con la información y controles específicos del portal.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendedSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                >
                  <p className="text-sm font-semibold">{section.title}</p>
                  <p className="mt-2 text-xs text-white/50">{section.description}</p>
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:gap-6 md:px-6 lg:px-8">
        <aside className="flex h-fit flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 md:sticky md:top-8 md:w-64">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Portal</p>
            <h1 className="mt-2 text-2xl font-semibold">Super administrador</h1>
          </div>

          <nav className="space-y-2 text-sm">
            {["Resumen", "Alta de clientes", "Productos", "Pedidos", "Usuarios y roles", "Configuración", "Reportes"].map(
              (item) => {
                const isActive = item === activeSection;
                return (
                  <button
                    key={item}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-emerald-300/60 bg-emerald-300/10 text-white"
                        : "border-transparent text-white/80 hover:border-white/20 hover:bg-white/5"
                    }`}
                    type="button"
                    onClick={() => setActiveSection(item)}
                  >
                    <span>{item}</span>
                    <span className="text-xs text-white/40">→</span>
                  </button>
                );
              },
            )}
          </nav>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-white/70">
            <p className="font-semibold text-white">Estado del sistema</p>
            <p className="mt-2">Sincronización con Supabase activa.</p>
            <p className="mt-1 text-white/50">Última actualización: hace 3 min</p>
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          {activeSection === "Resumen" ? (
            <section className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm text-white/60">Bienvenido, Paulina</p>
                  <h2 className="text-3xl font-semibold">Panel de control</h2>
                  <p className="mt-2 max-w-2xl text-sm text-white/60">
                    Administra clientes, productos y pedidos en un solo lugar. Todo el equipo puede operar desde móvil o escritorio con accesibilidad garantizada.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-slate-950"
                      onClick={() => {
                        if (action === "Crear cliente") return setActiveSection("Alta de clientes");
                        if (action === "Actualizar precios") return setActiveSection("Productos");
                        if (action === "Asignar roles") return setActiveSection("Usuarios y roles");
                        if (action === "Revisar pedidos") return setActiveSection("Pedidos");
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-slate-900/80 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-white/50">{stat.label}</p>
                    <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs text-emerald-300/80">{stat.helper}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            renderSection()
          )}
        </main>
      </div>
    </div>
  );
}

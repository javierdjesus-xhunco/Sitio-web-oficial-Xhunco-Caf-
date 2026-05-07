"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

import {
  Search,
  ShoppingCart,
  Package2,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Tags,
  Layers3,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

const PLACEHOLDER = "/placeholder.svg";
const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";
const INITIAL_VISIBLE = 12;
const LOAD_MORE_STEP = 12;

type Suministro = {
  id: string;
  sku: string | null;
  nombre: string;
  categoria: string | null;
  marca: string | null;
  presentacion: string | null;
  precio_web: number | null;
  unidad: string | null;
  stock: number;
  activo: boolean;
  imagen: string | null;
};

type ProductoUI = {
  key: string;
  id: string;
  sku: string | null;
  nombre: string;
  categoria: string;
  marca: string;
  descripcion: string;
  precio: number;
  imagen: string;
  stock: number;
  activo: boolean;
  presentacion?: string | null;
  unidad?: string | null;
  marcaLogo: string;
  usoSugerido: string;
  tipPreparacion: string;
  idealPara: string[];
};

type MarcaUI = {
  nombre: string;
  logo: string;
};

const ordenarOpciones = [
  { value: "az", label: "A-Z" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "stock_desc", label: "Mayor stock" },
] as const;

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function money(n: number) {
  return Number(n || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function slugifyBrand(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeImage(src?: string | null) {
  const value = String(src || "").trim();

  if (!value || value === "null" || value === "undefined") {
    return PLACEHOLDER;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return PLACEHOLDER;
}

function getBrandLogo(brand: string) {
  const slug = slugifyBrand(brand || "sin marca");
  return `/marcasss/${slug}.png`;
}

function inferBrandFromName(nombre: string) {
  const n = (nombre || "").toLowerCase();

  if (n.includes("davinci")) return "DaVinci Gourmet";
  if (n.includes("monin")) return "Monin";
  if (n.includes("hershey")) return "Hersheys";
  if (n.includes("fontana")) return "Fontana";
  if (n.includes("torani")) return "Torani";
  if (n.includes("big train")) return "Big Train";
  if (n.includes("soy te")) return "Soy Te";
  if (n.includes("golden dipt")) return "Golden Dipt";
  if (n.includes("boduo")) return "Boduo";

  return null;
}

function buildSupplyInsights(params: {
  nombre: string;
  categoria: string;
  marca: string;
  presentacion?: string | null;
  unidad?: string | null;
}) {
  const nombre = (params.nombre || "").toLowerCase();
  const categoria = (params.categoria || "").toLowerCase();
  const presentacion = (params.presentacion || "").toLowerCase();
  const marca = params.marca || "Sin marca";

  let usoSugerido =
    "Suministro pensado para mejorar la operación diaria, mantener consistencia y facilitar la preparación en barra.";
  let tipPreparacion =
    "Úsalo con dosificación constante y verifica siempre la presentación para mantener estandarización en cada bebida.";
  let idealPara = ["Bebidas frías", "Bebidas calientes", "Operación de barra"];

  if (
    nombre.includes("jarabe") ||
    nombre.includes("syrup") ||
    categoria.includes("jarabe") ||
    categoria.includes("saborizante")
  ) {
    usoSugerido =
      "Ideal para dar sabor y personalización a cafés, frappés, sodas italianas, tés y bebidas de temporada.";
    tipPreparacion =
      "Comienza con una dosificación base y ajusta según el perfil de dulzor de tu receta para conservar consistencia.";
    idealPara = ["Lattes saborizados", "Frappés", "Sodas italianas", "Bebidas especiales"];
  } else if (
    nombre.includes("salsa") ||
    nombre.includes("topping") ||
    categoria.includes("salsa")
  ) {
    usoSugerido =
      "Perfecto para decorar, intensificar sabor y elevar la presentación visual de bebidas y postres.";
    tipPreparacion =
      "Aplícalo como acabado o mezcla parcial según la receta; funciona mejor si se dosifica de forma uniforme.";
    idealPara = ["Mochas", "Frappés", "Postres", "Decoración de bebidas"];
  } else if (
    nombre.includes("té") ||
    nombre.includes("te ") ||
    categoria.includes("té") ||
    categoria.includes("infusion")
  ) {
    usoSugerido =
      "Diseñado para bebidas infusionadas con perfil aromático limpio y opciones de servicio frías o calientes.";
    tipPreparacion =
      "Controla tiempo de infusión y temperatura para evitar sobreextracción y mantener un sabor balanceado.";
    idealPara = ["Tés fríos", "Tés calientes", "Mixología sin alcohol"];
  } else if (
    nombre.includes("polvo") ||
    categoria.includes("base") ||
    categoria.includes("mezcla")
  ) {
    usoSugerido =
      "Útil para estandarizar recetas de alto volumen y lograr textura, sabor y rendimiento consistentes.";
    tipPreparacion =
      "Mézclalo con la proporción recomendada del líquido base y licúa o agita hasta obtener una integración homogénea.";
    idealPara = ["Frappés", "Bebidas batidas", "Menú de temporada"];
  } else if (
    nombre.includes("vaso") ||
    nombre.includes("tapa") ||
    nombre.includes("popote") ||
    categoria.includes("empaque") ||
    categoria.includes("desechable")
  ) {
    usoSugerido =
      "Accesorio clave para servicio, presentación, higiene y operación ágil en punto de venta.";
    tipPreparacion =
      "Selecciona el tamaño correcto de acuerdo con el volumen de la bebida para evitar mermas y mejorar experiencia del cliente.";
    idealPara = ["Take away", "Servicio en barra", "Entrega rápida"];
  } else if (nombre.includes("café") || categoria.includes("cafe")) {
    usoSugerido =
      "Pensado para preparaciones base de café donde la consistencia del perfil y el rendimiento son clave.";
    tipPreparacion =
      "Respeta gramaje, molienda y método de extracción para obtener un resultado uniforme en cada servicio.";
    idealPara = ["Espresso", "Americano", "Lattes", "Bebidas de especialidad"];
  }

  if (presentacion.includes("1 l") || presentacion.includes("1l")) {
    tipPreparacion +=
      " La presentación de 1 litro es conveniente para operación continua y recetas repetitivas.";
  }

  return {
    usoSugerido: `${usoSugerido} Marca: ${marca}.`,
    tipPreparacion,
    idealPara,
  };
}

function ImageModal(props: {
  open: boolean;
  onClose: () => void;
  producto: ProductoUI | null;
}) {
  const { open, onClose, producto } = props;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFlipped(false);
  }, [open, producto]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "r" || e.key === "Enter") {
        setFlipped((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !producto) return null;

  const estado = !producto.activo
    ? "Inactivo"
    : producto.stock > 0
    ? "Disponible"
    : "Agotado";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada del producto"
    >
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.18em] text-gray-500">
              {producto.categoria} · {producto.marca}
            </p>
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {producto.nombre}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-white p-4 md:p-6">
            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              className="group relative block h-[420px] w-full rounded-3xl text-left [perspective:1400px] md:h-[560px]"
              aria-label="Voltear tarjeta del producto"
            >
              <div
                className={cx(
                  "relative h-full w-full rounded-3xl transition-transform duration-700 [transform-style:preserve-3d]",
                  flipped ? "[transform:rotateY(180deg)]" : ""
                )}
              >
                <div className="absolute inset-0 overflow-hidden rounded-3xl bg-[#f8fafc] [backface-visibility:hidden]">
                  <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Clic para girar
                  </div>

                  <img
                    src={producto.imagen || PLACEHOLDER}
                    alt={producto.nombre}
                    className="h-full w-full object-contain p-5"
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src.includes(PLACEHOLDER)) return;
                      img.src = PLACEHOLDER;
                    }}
                  />
                </div>

                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#f7faf7] via-white to-[#eef5ee] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">
                          Información del suministro
                        </p>
                        <h4 className="mt-2 text-2xl font-semibold text-gray-950">
                          {producto.nombre}
                        </h4>
                      </div>

                      <span
                        className={cx(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          estado === "Disponible"
                            ? "bg-emerald-50 text-emerald-700"
                            : estado === "Agotado"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {estado}
                      </span>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-gray-200 bg-white/80 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                          Uso sugerido
                        </div>
                        <p className="mt-2 text-sm leading-7 text-gray-700">
                          {producto.usoSugerido}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white/80 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                          Ideal para
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {producto.idealPara.map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-[#31572c]/8 px-3 py-1.5 text-xs font-medium text-[#31572c]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white/80 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                          Tip de preparación
                        </div>
                        <p className="mt-2 text-sm leading-7 text-gray-700">
                          {producto.tipPreparacion}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                        <div className="text-xs text-gray-500">Presentación</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">
                          {producto.presentacion || "No especificada"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                        <div className="text-xs text-gray-500">Unidad</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">
                          {producto.unidad || "No especificada"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                        <div className="text-xs text-gray-500">SKU</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">
                          {producto.sku || "Sin SKU"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                        <div className="text-xs text-gray-500">Precio web</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">
                          {money(producto.precio)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="border-t border-gray-200 bg-[#fbfbfb] p-5 lg:border-l lg:border-t-0">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={producto.marcaLogo}
                  alt={producto.marca}
                  className="h-16 w-16 rounded-2xl border border-gray-100 bg-white object-contain p-2"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "/marcasss/sin-marca.png";
                  }}
                />
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-gray-500">
                    Marca
                  </div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {producto.marca}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-600">Stock</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {producto.stock}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-600">Categoría</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {producto.categoria}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {estado}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-[#31572c]/30 bg-[#31572c]/5 px-4 py-4">
                <p className="text-sm leading-7 text-gray-700">
                  Puedes usar esta vista para mostrar una segunda cara del producto:
                  recetas rápidas, sugerencias de uso, rendimiento, compatibilidades o
                  aplicaciones dentro de barra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogosStrip(props: {
  marcas: MarcaUI[];
  marcaActiva: string;
  onSelect: (m: string) => void;
}) {
  const { marcas, marcaActiva, onSelect } = props;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {marcas.map((marca) => {
        const active = marcaActiva === marca.nombre;

        return (
          <button
            key={marca.nombre}
            type="button"
            onClick={() => onSelect(marca.nombre)}
            title={marca.nombre}
            aria-label={marca.nombre}
            className={cx(
              "flex h-24 items-center justify-center rounded-2xl border bg-white px-3 transition",
              active
                ? "border-[#31572c] ring-2 ring-[#31572c]/15 shadow-sm"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            )}
          >
            <img
              src={marca.logo}
              alt={marca.nombre}
              className="h-16 w-full object-contain"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "/marcasss/sin-marca.png";
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

function DesktopSidebar(props: {
  categorias: string[];
  categoriaActiva: string;
  setCategoriaActiva: (v: string) => void;
  marcas: MarcaUI[];
  marcaActiva: string;
  setMarcaActiva: (v: string) => void;
  disponibilidad: string;
  setDisponibilidad: (v: string) => void;
  orden: string;
  setOrden: (v: string) => void;
  busquedaRaw: string;
  setBusquedaRaw: (v: string) => void;
  sugerencias: string[];
  onClearFilters: () => void;
}) {
  const {
    categorias,
    categoriaActiva,
    setCategoriaActiva,
    marcas,
    marcaActiva,
    setMarcaActiva,
    disponibilidad,
    setDisponibilidad,
    orden,
    setOrden,
    busquedaRaw,
    setBusquedaRaw,
    sugerencias,
    onClearFilters,
  } = props;

  return (
   <aside className="hidden xl:block h-full overflow-hidden">
      <div className="sticky top-5 h-full overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </div>

            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              <Tags className="h-4 w-4" />
              Marca
            </div>

            <div className="grid grid-cols-2 gap-3">
              {marcas.map((marca) => {
                const active = marcaActiva === marca.nombre;
                return (
                  <button
                    key={marca.nombre}
                    type="button"
                    onClick={() => setMarcaActiva(marca.nombre)}
                    title={marca.nombre}
                    aria-label={marca.nombre}
                    className={cx(
                      "flex h-28 items-center justify-center rounded-2xl border bg-white px-3 transition",
                      active
                        ? "border-[#31572c] ring-2 ring-[#31572c]/15 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    <img
                      src={marca.logo}
                      alt={marca.nombre}
                      className="h-16 w-full object-contain"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "/marcasss/sin-marca.png";
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              <Layers3 className="h-4 w-4" />
              Categoría
            </div>

            <select
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800"
              value={categoriaActiva}
              onChange={(e) => setCategoriaActiva(e.target.value)}
            >
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-gray-500">
              {marcaActiva === "Todas"
                ? "Mostrando categorías de todo el catálogo."
                : `Mostrando categorías disponibles para ${marcaActiva}.`}
            </p>
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Búsqueda
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-300"
                placeholder="Nombre, marca, SKU…"
                value={busquedaRaw}
                onChange={(e) => setBusquedaRaw(e.target.value)}
              />

              {busquedaRaw && sugerencias.length > 0 && (
                <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  {sugerencias.map((s, idx) => (
                    <li
                      key={`${s}-${idx}`}
                      className="cursor-pointer px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                      onClick={() => setBusquedaRaw(s)}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Disponibilidad
            </div>
            <select
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800"
              value={disponibilidad}
              onChange={(e) => setDisponibilidad(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="disponible">Disponible</option>
              <option value="agotado">Agotado</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Ordenar
            </div>
            <select
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              {ordenarOpciones.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProductCard(props: {
  producto: ProductoUI;
  cantidad: number;
  onIncrementar: (key: string, stock: number) => void;
  onDecrementar: (key: string) => void;
  onAgregarCarrito: (p: ProductoUI) => void;
  onAbrirImagen: (p: ProductoUI) => void;
}) {
  const {
    producto,
    cantidad,
    onIncrementar,
    onDecrementar,
    onAgregarCarrito,
    onAbrirImagen,
  } = props;

  const estado = !producto.activo
    ? "Inactivo"
    : producto.stock > 0
    ? "Disponible"
    : "Agotado";

  const sinInventario = !producto.activo || producto.stock <= 0;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
       <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-[0.18em] text-gray-500">
            {producto.categoria}
          </p>
          <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-gray-900">
            {producto.nombre}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{producto.descripcion}</p>
        </div>

        <span
          className={cx(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
            estado === "Disponible"
              ? "bg-emerald-50 text-emerald-700"
              : estado === "Agotado"
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {estado}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onAbrirImagen(producto)}
        className="relative block h-48 w-full overflow-hidden rounded-2xl bg-[#f8fafc] sm:h-56"
        aria-label={`Ver imagen de ${producto.nombre}`}
      >
        <img
          src={producto.imagen || PLACEHOLDER}
          alt={producto.nombre}
          className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src.includes(PLACEHOLDER)) return;
            img.src = PLACEHOLDER;
          }}
        />
      </button>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2"
          title={producto.marca}
        >
          <img
            src={producto.marcaLogo}
            alt={producto.marca}
            className="h-12 w-12 object-contain bg-white"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/marcasss/sin-marca.png";
            }}
          />
        </div>

        <div className="text-right">
          <div className="text-[11px] text-gray-500">Stock</div>
          <div className="text-sm font-semibold text-gray-900">{producto.stock}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-[#fafafa] p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500">Precio web</div>
            <div className="mt-1 text-xl font-semibold text-gray-950">
              {money(producto.precio)}
            </div>
          </div>

          <div className="text-right text-xs text-gray-500">
            {producto.presentacion ? <div>Presentación: {producto.presentacion}</div> : null}
            {producto.unidad ? <div>Unidad: {producto.unidad}</div> : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => onDecrementar(producto.key)}
            disabled={sinInventario || cantidad === 0}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
            aria-label={`Disminuir cantidad de ${producto.nombre}`}
          >
            -
          </button>

          <div className="min-w-[48px] text-center">
            <div className="text-[11px] text-gray-500">Cant.</div>
            <div className="text-sm font-semibold text-gray-900">{cantidad}</div>
          </div>

          <button
            type="button"
            onClick={() => onIncrementar(producto.key, producto.stock)}
            disabled={sinInventario || cantidad >= producto.stock}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
            aria-label={`Aumentar cantidad de ${producto.nombre}`}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => onAgregarCarrito(producto)}
          disabled={sinInventario || cantidad === 0}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-gray-300"
          style={{
            backgroundColor:
              sinInventario || cantidad === 0 ? undefined : BRAND_GREEN,
          }}
          onMouseEnter={(e) => {
            if (!(sinInventario || cantidad === 0)) {
              e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
            }
          }}
          onMouseLeave={(e) => {
            if (!(sinInventario || cantidad === 0)) {
              e.currentTarget.style.backgroundColor = BRAND_GREEN;
            }
          }}
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}

export default function SuministrosPage() {
  const [categoriaActiva, setCategoriaActiva] = useState("General");
  const [marcaActiva, setMarcaActiva] = useState("Todas");
  const [disponibilidad, setDisponibilidad] = useState("todas");
  const [orden, setOrden] = useState("az");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [busquedaRaw, setBusquedaRaw] = useState("");
  const busqueda = useDebouncedValue(busquedaRaw, 180);

  const [cantidades, setCantidades] = useState<Record<string, number>>({});

const { addItem, totalItems } = useCart();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productosDb, setProductosDb] = useState<ProductoUI[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const [modalOpen, setModalOpen] = useState(false);
  const [productoModal, setProductoModal] = useState<ProductoUI | null>(null);

  const abrirImagen = (p: ProductoUI) => {
    setProductoModal(p);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setCategoriaActiva("General");
    setMarcaActiva("Todas");
    setDisponibilidad("todas");
    setOrden("az");
    setBusquedaRaw("");
  };

  useEffect(() => {
    let cancelado = false;

    async function load() {
      try {
        setCargando(true);
        setError(null);

        const res = await fetch("/api/suministros", { cache: "no-store" });
        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data = (await res.json()) as Suministro[];

        const mapped: ProductoUI[] = data.map((s) => {
          const skuLimpio = s.sku?.toString().trim() || null;
          const key = skuLimpio ? skuLimpio : `id:${s.id}`;

          const marcaNormalizada =
            s.marca?.toString().trim() || inferBrandFromName(s.nombre) || "Sin marca";

          const insights = buildSupplyInsights({
            nombre: s.nombre,
            categoria: (s.categoria ?? "General").toString().trim() || "General",
            marca: marcaNormalizada,
            presentacion: s.presentacion,
            unidad: s.unidad,
          });

          return {
            key,
            id: s.id,
            sku: skuLimpio,
            nombre: s.nombre,
            categoria: (s.categoria ?? "General").toString().trim() || "General",
            marca: marcaNormalizada,
            descripcion:
              s.presentacion?.toString().trim() ||
              "Producto disponible para tu barra de café.",
            precio: Number(s.precio_web ?? 0),
            imagen: normalizeImage(s.imagen),
            stock: Number(s.stock ?? 0),
            activo: Boolean(s.activo),
            presentacion: s.presentacion,
            unidad: s.unidad,
            marcaLogo: getBrandLogo(marcaNormalizada),
            usoSugerido: insights.usoSugerido,
            tipPreparacion: insights.tipPreparacion,
            idealPara: insights.idealPara,
          };
        });

        if (!cancelado) setProductosDb(mapped);
      } catch (e: any) {
        if (!cancelado) {
          setError(e?.message ?? "Error cargando catálogo");
          setProductosDb([]);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    load();

    return () => {
      cancelado = true;
    };
  }, []);

  const marcas = useMemo(() => {
    const map = new Map<string, MarcaUI>();
    map.set("Todas", {
      nombre: "Todas",
      logo: "/marcasss/todas.png",
    });

    for (const p of productosDb) {
      const nombreMarca = p.marca?.trim();
      if (!nombreMarca || nombreMarca.toLowerCase() === "sin marca") continue;

      if (!map.has(nombreMarca)) {
        map.set(nombreMarca, {
          nombre: nombreMarca,
          logo: p.marcaLogo || getBrandLogo(nombreMarca),
        });
      }
    }

    return Array.from(map.values());
  }, [productosDb]);

  const categorias = useMemo(() => {
    const base =
      marcaActiva === "Todas"
        ? productosDb
        : productosDb.filter((p) => p.marca === marcaActiva);

    const set = new Set<string>();
    set.add("General");

    for (const p of base) {
      if (p.categoria?.trim()) set.add(p.categoria.trim());
    }

    return Array.from(set).sort((a, b) => {
      if (a === "General") return -1;
      if (b === "General") return 1;
      return a.localeCompare(b, "es");
    });
  }, [productosDb, marcaActiva]);

  useEffect(() => {
    if (!categorias.includes(categoriaActiva)) {
      setCategoriaActiva("General");
    }
  }, [categorias, categoriaActiva]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const resultado = productosDb.filter((p) => {
      const coincideCategoria =
        categoriaActiva === "General" || p.categoria === categoriaActiva;

      const coincideMarca = marcaActiva === "Todas" || p.marca === marcaActiva;

      const estado = !p.activo ? "inactivo" : p.stock > 0 ? "disponible" : "agotado";
      const coincideDisponibilidad =
        disponibilidad === "todas" || disponibilidad === estado;

      const coincideBusqueda =
        texto === "" ||
        p.nombre.toLowerCase().includes(texto) ||
        p.marca.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto) ||
        (p.sku ?? "").toLowerCase().includes(texto);

      return coincideCategoria && coincideMarca && coincideDisponibilidad && coincideBusqueda;
    });

    return resultado.sort((a, b) => {
      if (orden === "precio_asc") return a.precio - b.precio;
      if (orden === "precio_desc") return b.precio - a.precio;
      if (orden === "stock_desc") return b.stock - a.stock;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [productosDb, busqueda, categoriaActiva, marcaActiva, disponibilidad, orden]);

  const productosVisibles = useMemo(() => {
    return productosFiltrados.slice(0, visibleCount);
  }, [productosFiltrados, visibleCount]);

  const sugerencias = useMemo(() => {
    const raw = busquedaRaw.trim().toLowerCase();
    if (!raw) return [];

    const unicos = new Set<string>();

    for (const p of productosDb) {
      if (
        p.nombre.toLowerCase().includes(raw) ||
        p.marca.toLowerCase().includes(raw) ||
        p.categoria.toLowerCase().includes(raw) ||
        (p.sku ?? "").toLowerCase().includes(raw)
      ) {
        unicos.add(p.nombre);
      }

      if (unicos.size >= 6) break;
    }

    return Array.from(unicos);
  }, [busquedaRaw, productosDb]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [categoriaActiva, marcaActiva, disponibilidad, orden, busqueda]);

  const actualizarCantidad = (key: string, delta: number, maxStock?: number) => {
    setCantidades((prev) => {
      const actual = prev[key] ?? 0;
      const limite =
        typeof maxStock === "number" ? Math.max(0, maxStock) : Number.POSITIVE_INFINITY;
      const siguiente = Math.min(limite, Math.max(0, actual + delta));
      return { ...prev, [key]: siguiente };
    });
  };

 const agregarAlCarrito = (producto: ProductoUI) => {
  const key = producto.key;
  const cantidad = cantidades[key] ?? 0;

  const stock = Number(producto.stock ?? 0);
  const activo = Boolean(producto.activo);

  if (!activo || stock <= 0 || cantidad <= 0) return;

  for (let i = 0; i < cantidad; i++) {
    addItem({
      id: producto.key,
      suministro_id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      categoria: producto.categoria,
      sku: producto.sku || undefined,
    });
  }

  setCantidades((prev) => ({ ...prev, [key]: 0 }));
};

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <ImageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        producto={productoModal}
      />

      <section className="w-full px-4 pt-6 md:px-6 xl:px-8">
        <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-7 shadow-sm md:px-8 md:py-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-[980px]">
              <p className="text-[11px] uppercase tracking-[0.32em] text-gray-500">
                Catálogo de suministros
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] leading-[0.95] text-gray-950 md:text-5xl xl:whitespace-nowrap xl:text-[58px] 2xl:text-[64px]">
                Abastece tu barra desde un solo catálogo
              </h1>

              <p className="mt-5 max-w-[760px] text-base leading-8 text-gray-600 md:text-lg">
                Encuentra insumos, accesorios y productos esenciales para operar con mayor
                agilidad, orden y consistencia. Filtra por marca, categoría y disponibilidad
                para comprar más rápido.
              </p>
            </div>

        <a
              href="/suministros/carrito"
              id="cart-button"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-sm transition"
              style={{ backgroundColor: "#31572c" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#25441f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#31572c";
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Carrito
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {totalItems}
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-8 md:px-6 xl:px-8">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)] h-[calc(100vh-220px)]">
          <DesktopSidebar
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            setCategoriaActiva={setCategoriaActiva}
            marcas={marcas}
            marcaActiva={marcaActiva}
            setMarcaActiva={setMarcaActiva}
            disponibilidad={disponibilidad}
            setDisponibilidad={setDisponibilidad}
            orden={orden}
            setOrden={setOrden}
            busquedaRaw={busquedaRaw}
            setBusquedaRaw={setBusquedaRaw}
            sugerencias={sugerencias}
            onClearFilters={clearFilters}
          />
<div className="min-w-0 h-full overflow-y-auto pr-2">
            <section className="sticky top-3 z-30 mb-6 xl:hidden">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros del catálogo
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltersOpen((v) => !v)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      {filtersOpen ? (
                        <>
                          Ocultar <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Mostrar <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className={filtersOpen ? "block" : "hidden"}>
                  <div className="border-b border-gray-100 px-4 py-4">
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                        <Layers3 className="h-4 w-4" />
                        Categoría
                      </div>

                      <select
                        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800"
                        value={categoriaActiva}
                        onChange={(e) => setCategoriaActiva(e.target.value)}
                      >
                        {categorias.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                        <Tags className="h-4 w-4" />
                        Marca
                      </div>

                      <LogosStrip
                        marcas={marcas}
                        marcaActiva={marcaActiva}
                        onSelect={setMarcaActiva}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_auto_auto]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-300"
                        placeholder="Buscar por nombre, marca, categoría o SKU…"
                        value={busquedaRaw}
                        onChange={(e) => setBusquedaRaw(e.target.value)}
                      />

                      {busquedaRaw && sugerencias.length > 0 && (
                        <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                          {sugerencias.map((s, idx) => (
                            <li
                              key={`${s}-${idx}`}
                              className="cursor-pointer px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                              onClick={() => setBusquedaRaw(s)}
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <select
                      className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800"
                      value={disponibilidad}
                      onChange={(e) => setDisponibilidad(e.target.value)}
                    >
                      <option value="todas">Todas</option>
                      <option value="disponible">Disponible</option>
                      <option value="agotado">Agotado</option>
                      <option value="inactivo">Inactivo</option>
                    </select>

                    <select
                      className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800"
                      value={orden}
                      onChange={(e) => setOrden(e.target.value)}
                    >
                      {ordenarOpciones.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">
                Resultados
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-950">
                {categoriaActiva === "General" ? "Todos los productos" : categoriaActiva}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {productosFiltrados.length} producto
                {productosFiltrados.length === 1 ? "" : "s"} encontrados
                {marcaActiva !== "Todas" ? ` · Marca: ${marcaActiva}` : ""}
              </p>
            </div>

            {cargando ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <div className="text-sm text-gray-600">Cargando catálogo...</div>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
                <div className="text-sm font-medium text-red-700">{error}</div>
              </div>
            ) : productosVisibles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {productosVisibles.map((producto) => {
                    const cantidad = cantidades[producto.key] ?? 0;

                    return (
                      <ProductCard
                        key={producto.key}
                        producto={producto}
                        cantidad={cantidad}
                        onIncrementar={(key, stock) => actualizarCantidad(key, 1, stock)}
                        onDecrementar={(key) => actualizarCantidad(key, -1)}
                        onAgregarCarrito={agregarAlCarrito}
                        onAbrirImagen={abrirImagen}
                      />
                    );
                  })}
                </div>

                {visibleCount < productosFiltrados.length ? (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
                      className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                    >
                      Cargar más productos
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <Package2 className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No encontramos productos con esos filtros
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Intenta con otra categoría, marca, disponibilidad o término de búsqueda.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
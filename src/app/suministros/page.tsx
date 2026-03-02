"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const PLACEHOLDER = "/suministros/placeholder.svg"; // ✅ asegúrate que exista en /public
// Si no existe, cambia por uno que sí exista, por ejemplo: const PLACEHOLDER = "/logo-xhunco.png";

type Suministro = {
  id: string;
  sku: string | null;
  nombre: string;
  categoria: string | null;
  presentacion: string | null;
  precio: number;
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
  descripcion: string;

  precio: number;
  imagen: string;

  stock: number;
  activo: boolean;

  presentacion?: string | null;
  unidad?: string | null;
};

const ordenarOpciones = [
  { value: "az", label: "A-Z" },
  { value: "precio", label: "Precio" },
] as const;

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

/** debounce simple para que no filtre en cada tecla (mejora performance percibida) */
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

/** Modal simple para ver imagen */
function ImageModal(props: {
  open: boolean;
  onClose: () => void;
  src: string;
  title: string;
  subtitle?: string;
}) {
  const { open, onClose, src, title, subtitle } = props;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 md:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada del producto"
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-3 md:p-4">
          <div className="min-w-0">
            <div className="truncate text-xs text-gray-500">{subtitle ?? ""}</div>
            <div className="truncate text-base md:text-lg font-semibold text-gray-900">
              {title}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="bg-black">
          <img
            src={src}
            alt={title}
            className="max-h-[75vh] w-full object-contain"
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
      </div>
    </div>
  );
}

/** Categorías: una sola fila con scroll horizontal */
function CategoriasBar(props: {
  categorias: string[];
  categoriaActiva: string;
  onSelect: (c: string) => void;
}) {
  const { categorias, categoriaActiva, onSelect } = props;
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Flechas solo md+ para no estorbar en mobile */}
      <button
        type="button"
        onClick={() => scrollBy("left")}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
        aria-label="Categorías izquierda"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => scrollBy("right")}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
        aria-label="Categorías derecha"
      >
        ›
      </button>

      <div
        ref={scrollerRef}
        className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar md:px-10"
      >
        {categorias.map((c) => {
          const active = categoriaActiva === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onSelect(c)}
              className={cx(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm transition",
                active
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
              )}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FiltrosCompactos(props: {
  disponibilidad: string;
  setDisponibilidad: (v: string) => void;
  orden: string;
  setOrden: (v: string) => void;
  busqueda: string;
  setBusqueda: (v: string) => void;
  sugerencias: string[];
  onElegirSugerencia: (v: string) => void;
}) {
  const {
    disponibilidad,
    setDisponibilidad,
    orden,
    setOrden,
    busqueda,
    setBusqueda,
    sugerencias,
    onElegirSugerencia,
  } = props;

  return (
    <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[auto_auto_1fr] md:items-center">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="hidden sm:inline">Disponibilidad</span>
        <select
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800"
          value={disponibilidad}
          onChange={(e) => setDisponibilidad(e.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="disponible">Disponible</option>
          <option value="agotado">Agotado</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="hidden sm:inline">Ordenar</span>
        <select
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
        >
          {ordenarOpciones.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="relative">
        <input
          className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400"
          placeholder="Buscar producto…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {busqueda && sugerencias.length > 0 && (
          <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {sugerencias.map((s) => (
              <li
                key={s}
                className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => onElegirSugerencia(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CatalogoSeccion(props: {
  titulo: string;
  descripcion?: string;
  categoria: string;
  productos: ProductoUI[];
  cantidades: Record<string, number>;
  onIncrementar: (key: string, stock: number) => void;
  onDecrementar: (key: string) => void;
  onAgregarCarrito: (p: ProductoUI) => void;
  onAbrirImagen: (p: ProductoUI) => void;
}) {
  const {
    titulo,
    descripcion,
    categoria,
    productos,
    cantidades,
    onIncrementar,
    onDecrementar,
    onAgregarCarrito,
    onAbrirImagen,
  } = props;

  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">{titulo}</h2>
          {descripcion ? <p className="mt-1 text-sm text-gray-600">{descripcion}</p> : null}
        </div>
        <span className="text-xs md:text-sm text-gray-500">{categoria}</span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {productos.length > 0 ? (
          productos.map((producto) => {
            const cantidad = cantidades[producto.key] ?? 0;

            const estado = !producto.activo
              ? "Inactivo"
              : producto.stock > 0
              ? "Disponible"
              : "Agotado";

            const sinInventario = !producto.activo || producto.stock <= 0;

            return (
              <article
                key={producto.key}
                className="rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition bg-white"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate">{producto.categoria}</span>
                  <span>{estado}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onAbrirImagen(producto)}
                  className="mt-3 block h-36 w-full overflow-hidden rounded-xl bg-gray-100"
                  aria-label={`Ver imagen de ${producto.nombre}`}
                >
                  <img
                    src={producto.imagen || PLACEHOLDER}
                    alt={producto.nombre}
                    className="h-full w-full object-cover"
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

                <h3 className="mt-4 text-base font-semibold">{producto.nombre}</h3>

                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {producto.descripcion}
                </p>

                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {producto.presentacion ? (
                    <div>Presentación: {producto.presentacion}</div>
                  ) : null}
                  {producto.unidad ? <div>Unidad: {producto.unidad}</div> : null}
                  <div>Stock: {producto.stock}</div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold text-gray-900">
                      ${Number(producto.precio).toFixed(2)} MXN
                    </span>

                    <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2">
                      <span className="text-xs text-gray-500">Cant.</span>
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center text-sm font-semibold">{cantidad}</span>

                        <div className="flex flex-col overflow-hidden rounded-md border border-gray-200">
                          <button
                            type="button"
                            onClick={() => onIncrementar(producto.key, producto.stock)}
                            disabled={sinInventario || cantidad >= producto.stock}
                            className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                            aria-label={`Agregar ${producto.nombre}`}
                          >
                            ▲
                          </button>

                          <button
                            type="button"
                            onClick={() => onDecrementar(producto.key)}
                            disabled={sinInventario || cantidad === 0}
                            className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                            aria-label={`Quitar ${producto.nombre}`}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAgregarCarrito(producto)}
                    disabled={sinInventario || cantidad === 0}
                    className="w-full rounded-full border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-600">
            No hay productos con estos filtros.
          </div>
        )}
      </div>
    </section>
  );
}

export default function SuministrosPage() {
  const [categoriaActiva, setCategoriaActiva] = useState("General");
  const [disponibilidad, setDisponibilidad] = useState("todas");
  const [orden, setOrden] = useState("az");

  // ✅ búsqueda con debounce (menos trabajo por tecla)
  const [busquedaRaw, setBusquedaRaw] = useState("");
  const busqueda = useDebouncedValue(busquedaRaw, 180);

  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [carrito, setCarrito] = useState<Record<string, any>>({});
  const [carritoCargado, setCarritoCargado] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productosDb, setProductosDb] = useState<ProductoUI[]>([]);

  // ✅ modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(PLACEHOLDER);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubtitle, setModalSubtitle] = useState<string | undefined>(undefined);

  const abrirImagen = (p: ProductoUI) => {
    setModalSrc(p.imagen || PLACEHOLDER);
    setModalTitle(p.nombre);
    setModalSubtitle(p.categoria);
    setModalOpen(true);
  };

  // 1) Cargar desde API
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

          return {
            key,
            id: s.id,
            sku: skuLimpio,

            nombre: s.nombre,
            categoria: (s.categoria ?? "General").toString().trim() || "General",
            descripcion:
              s.presentacion?.toString().trim() ||
              "Producto disponible para tu barra de café.",

            precio: Number(s.precio ?? 0),
            imagen: (s.imagen && s.imagen.trim()) || PLACEHOLDER,

            stock: Number(s.stock ?? 0),
            activo: Boolean(s.activo),

            presentacion: s.presentacion,
            unidad: s.unidad,
          };
        });

        if (!cancelado) setProductosDb(mapped);
      } catch (e: any) {
        if (!cancelado) setError(e?.message ?? "Error cargando catálogo");
        if (!cancelado) setProductosDb([]);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    load();
    return () => {
      cancelado = true;
    };
  }, []);

  // 2) Cargar carrito
  useEffect(() => {
    if (typeof window === "undefined") return;
    const guardado = window.localStorage.getItem("suministrosCarrito");
    if (guardado) {
      try {
        setCarrito(JSON.parse(guardado));
      } catch {
        // ignore
      }
    }
    setCarritoCargado(true);
  }, []);

  // 3) Persistir carrito
  useEffect(() => {
    if (!carritoCargado || typeof window === "undefined") return;
    window.localStorage.setItem("suministrosCarrito", JSON.stringify(carrito));
  }, [carrito, carritoCargado]);

  // 4) Categorías
  const categorias = useMemo(() => {
    const set = new Set<string>();
    set.add("General");
    for (const p of productosDb) {
      if (p.categoria) set.add(p.categoria);
    }
    return Array.from(set);
  }, [productosDb]);

  // 5) Filtrado + orden (usa busqueda debounced)
  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const resultado = productosDb.filter((p) => {
      const coincideCategoria =
        categoriaActiva === "General" || p.categoria === categoriaActiva;

      const estado = !p.activo ? "inactivo" : p.stock > 0 ? "disponible" : "agotado";
      const coincideDisponibilidad = disponibilidad === "todas" || disponibilidad === estado;

      const coincideBusqueda = texto === "" || p.nombre.toLowerCase().includes(texto);

      return coincideCategoria && coincideDisponibilidad && coincideBusqueda;
    });

    return resultado.sort((a, b) => {
      if (orden === "precio") return a.precio - b.precio;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [productosDb, busqueda, categoriaActiva, disponibilidad, orden]);

  const sugerencias = useMemo(() => {
    const raw = busquedaRaw.trim().toLowerCase(); // sugerencias con lo que el usuario escribe
    if (!raw) return [];
    return productosDb
      .filter((p) => p.nombre.toLowerCase().includes(raw))
      .slice(0, 6)
      .map((p) => p.nombre);
  }, [busquedaRaw, productosDb]);

  const productosPorCategoria = useMemo(() => {
    const acc: Record<string, ProductoUI[]> = {};
    for (const c of categorias) {
      if (c === "General") acc[c] = productosFiltrados;
      else acc[c] = productosFiltrados.filter((p) => p.categoria === c);
    }
    return acc;
  }, [categorias, productosFiltrados]);

  const totalCarrito = useMemo(() => {
    return Object.values(carrito).reduce(
      (total: number, item: any) => total + (item?.cantidad ?? 0),
      0
    );
  }, [carrito]);

  // Helpers
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

    setCarrito((prev) => {
      const existente = prev[key];
      const yaEnCarrito = Number(existente?.cantidad ?? 0);

      const permitido = Math.max(0, stock - yaEnCarrito);
      const aAgregar = Math.min(cantidad, permitido);

      if (aAgregar <= 0) return prev;

      return {
        ...prev,
        [key]: {
          ...producto,
          cantidad: yaEnCarrito + aAgregar,
        },
      };
    });

    setCantidades((prev) => ({ ...prev, [key]: 0 }));
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ✅ Header MUCHO más compacto (menos blanco) */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-3">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
          Suministros
        </p>

        <h1 className="mt-2 text-2xl md:text-4xl font-semibold">
          Catálogo de productos para tu barra de café
        </h1>

        <p className="mt-2 text-sm md:text-base text-gray-600 max-w-3xl">
          Explora por categoría o usa los filtros para encontrar lo que necesitas.
        </p>

        {cargando ? (
          <p className="mt-2 text-sm text-gray-500">Cargando catálogo…</p>
        ) : error ? (
          <p className="mt-2 text-sm text-red-600">Error cargando catálogo: {error}</p>
        ) : null}
      </section>

      {/* ✅ Sticky más angosto y menos alto */}
      <section className="sticky top-3 md:top-5 z-30 border-y border-white bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-2.5">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <CategoriasBar
                categorias={categorias}
                categoriaActiva={categoriaActiva}
                onSelect={setCategoriaActiva}
              />
            </div>

            <a
              href="/suministros/carrito"
              className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-gray-400"
              aria-label="Ir al carrito"
            >
              <span className="text-base">🛒</span>
              <span className="hidden sm:inline">Carrito</span>
              <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                {totalCarrito}
              </span>
            </a>
          </div>

          <FiltrosCompactos
            disponibilidad={disponibilidad}
            setDisponibilidad={setDisponibilidad}
            orden={orden}
            setOrden={setOrden}
            busqueda={busquedaRaw}
            setBusqueda={setBusquedaRaw}
            sugerencias={sugerencias}
            onElegirSugerencia={(v) => setBusquedaRaw(v)}
          />
        </div>
      </section>

      {/* Modal */}
      <ImageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        src={modalSrc}
        title={modalTitle}
        subtitle={modalSubtitle}
      />

      {/* Secciones */}
      {categorias.map((categoria) => (
        <div
          key={categoria}
          id={categoria.toLowerCase().replace(/\s+/g, "-")}
          className="scroll-mt-36"
        >
          <CatalogoSeccion
            titulo={categoria}
            descripcion={
              categoria === "General"
                ? "Todos los productos del catálogo."
                : "Productos filtrados por categoría."
            }
            categoria={categoria}
            productos={productosPorCategoria[categoria] ?? []}
            cantidades={cantidades}
            onIncrementar={(key, stock) => actualizarCantidad(key, 1, stock)}
            onDecrementar={(key) => actualizarCantidad(key, -1)}
            onAgregarCarrito={agregarAlCarrito}
            onAbrirImagen={abrirImagen}
          />
        </div>
      ))}
    </main>
  );
}
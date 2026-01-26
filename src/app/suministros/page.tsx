"use client";

import { useEffect, useMemo, useState } from "react";

type Suministro = {
  id: number;
  sku: string;
  nombre: string;
  categoria: string | null;
  presentacion: string | null;
  precio: number;
  unidad: string | null;
  stock: number;
  activo: boolean;
};

type ProductoUI = {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  imagen: string;
  disponible: boolean;
  stock: number;
  activo: boolean;
  presentacion?: string | null;
  unidad?: string | null;
};

const ordenarOpciones = [
  { value: "az", label: "Alfabéticamente A-Z" },
  { value: "precio", label: "Precio" },
] as const;

function Filtros(props: {
  disponibilidad: string;
  setDisponibilidad: (v: string) => void;
  orden: string;
  setOrden: (v: string) => void;
  busqueda: string;
  setBusqueda: (v: string) => void;
  sugerencias: string[];
}) {
  const {
    disponibilidad,
    setDisponibilidad,
    orden,
    setOrden,
    busqueda,
    setBusqueda,
    sugerencias,
  } = props;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <label className="flex flex-col text-sm text-gray-600">
        Disponibilidad
        <select
          className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
          value={disponibilidad}
          onChange={(event) => setDisponibilidad(event.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="disponible">Disponible</option>
          <option value="agotado">Agotado</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </label>

      <label className="flex flex-col text-sm text-gray-600">
        Ordenar
        <select
          className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
          value={orden}
          onChange={(event) => setOrden(event.target.value)}
        >
          {ordenarOpciones.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </label>

      <div className="relative flex-1 min-w-[220px]">
        <label className="flex flex-col text-sm text-gray-600">
          Buscar
          <input
            className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
            placeholder="Busca por nombre del producto"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </label>

        {busqueda && sugerencias.length > 0 && (
          <ul className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            {sugerencias.map((sugerencia) => (
              <li
                key={sugerencia}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {sugerencia}
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
  onIncrementar: (sku: string, stock: number) => void;
  onDecrementar: (sku: string) => void;

  onAgregarCarrito: (p: ProductoUI) => void;
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
  } = props;

  return (
    <section className="max-w-6xl mx-auto px-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{titulo}</h2>
          {descripcion ? (
            <p className="mt-2 text-gray-600">{descripcion}</p>
          ) : null}
        </div>
        <span className="text-sm text-gray-500">{categoria}</span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {productos.length > 0 ? (
          productos.map((producto) => {
            const cantidad = cantidades[producto.sku] ?? 0;

            const estado = !producto.activo
              ? "Inactivo"
              : producto.stock > 0
              ? "Disponible"
              : "Agotado";

            const sinInventario =
              !producto.activo || producto.stock <= 0;

            return (
              <article
                key={producto.sku}
                className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{producto.categoria}</span>
                  <span>{estado}</span>
                </div>

                <div className="mt-4 h-32 rounded-xl bg-gray-100" />

                <h3 className="mt-6 text-lg font-semibold">{producto.nombre}</h3>

                <p className="mt-2 text-sm text-gray-600">
                  {producto.descripcion}
                </p>

                <div className="mt-3 text-xs text-gray-500">
                  {producto.presentacion ? (
                    <div>Presentación: {producto.presentacion}</div>
                  ) : null}
                  {producto.unidad ? <div>Unidad: {producto.unidad}</div> : null}
                  <div>Stock: {producto.stock}</div>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold text-gray-900">
                      ${Number(producto.precio).toFixed(2)} MXN
                    </span>

                    <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2">
                      <span className="text-xs text-gray-500">Cantidad</span>
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center text-sm font-semibold">
                          {cantidad}
                        </span>

                        <div className="flex flex-col overflow-hidden rounded-md border border-gray-200">
                          <button
                           type="button"
                           onClick={() => onIncrementar(producto.sku, producto.stock)}
                           disabled={sinInventario || cantidad >= producto.stock}
                           className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                            aria-label={`Agregar ${producto.nombre}`}
                           >
                           ▲
                           </button>

                          <button
                            type="button"
                            onClick={() => onDecrementar(producto.sku)}
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
                    className="rounded-full border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
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
  const [busqueda, setBusqueda] = useState("");

  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [carrito, setCarrito] = useState<Record<string, any>>({});
  const [carritoCargado, setCarritoCargado] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productosDb, setProductosDb] = useState<ProductoUI[]>([]);

  // 1) Cargar desde API
  useEffect(() => {
    let cancelado = false;

    async function load() {
      try {
        setCargando(true);
        setError(null);

        const res = await fetch("/api/suministros", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }
        const data = (await res.json()) as Suministro[];

        const mapped: ProductoUI[] = data.map((s) => ({
          id: s.id,
          sku: s.sku,
          nombre: s.nombre,
          categoria: (s.categoria ?? "General").toString().trim() || "General",
          descripcion:
            s.presentacion?.toString().trim() ||
            "Producto disponible para tu barra de café.",
          precio: Number(s.precio ?? 0),
          imagen: "/suministros/placeholder.svg",
          disponible: s.activo && (s.stock ?? 0) > 0,
          stock: Number(s.stock ?? 0),
          activo: Boolean(s.activo),
          presentacion: s.presentacion,
          unidad: s.unidad,
        }));

        if (!cancelado) setProductosDb(mapped);
      } catch (e: any) {
        if (!cancelado) setError(e?.message ?? "Error cargando catálogo");
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    load();
    return () => {
      cancelado = true;
    };
  }, []);

  // 2) Cargar carrito de localStorage
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

  // 4) Categorías dinámicas (desde la BD)
  const categorias = useMemo(() => {
    const set = new Set<string>();
    set.add("General");
    for (const p of productosDb) {
      if (p.categoria) set.add(p.categoria);
    }
    return Array.from(set);
  }, [productosDb]);

  // 5) Filtrado + orden
  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const resultado = productosDb.filter((p) => {
      const coincideCategoria =
        categoriaActiva === "General" || p.categoria === categoriaActiva;

      const estado =
        !p.activo ? "inactivo" : p.stock > 0 ? "disponible" : "agotado";

      const coincideDisponibilidad =
        disponibilidad === "todas" || disponibilidad === estado;

      const coincideBusqueda =
        texto === "" || p.nombre.toLowerCase().includes(texto);

      return coincideCategoria && coincideDisponibilidad && coincideBusqueda;
    });

    return resultado.sort((a, b) => {
      if (orden === "precio") return a.precio - b.precio;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [productosDb, busqueda, categoriaActiva, disponibilidad, orden]);

  const sugerencias = useMemo(() => {
    if (!busqueda.trim()) return [];
    const texto = busqueda.toLowerCase();
    return productosDb
      .filter((p) => p.nombre.toLowerCase().includes(texto))
      .slice(0, 6)
      .map((p) => p.nombre);
  }, [busqueda, productosDb]);

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
      (total: number, item: any) => total + (item.cantidad ?? 0),
      0,
    );
  }, [carrito]);

  // Helpers
  const actualizarCantidad = (sku: string, delta: number, maxStock?: number) => {
  setCantidades((prev) => {
    const actual = prev[sku] ?? 0;
    const limite =
      typeof maxStock === "number" ? Math.max(0, maxStock) : Number.POSITIVE_INFINITY;

    const siguiente = Math.min(limite, Math.max(0, actual + delta));
    return { ...prev, [sku]: siguiente };
  });
};

const agregarAlCarrito = (producto: ProductoUI) => {
  const sku = producto.sku;
  const cantidad = cantidades[sku] ?? 0;

  const stock = Number(producto.stock ?? 0);
  const activo = Boolean(producto.activo);

  if (!activo || stock <= 0 || cantidad <= 0) return;

  setCarrito((prev) => {
    const existente = prev[sku];
    const yaEnCarrito = Number(existente?.cantidad ?? 0);

    // lo que todavía se puede agregar sin exceder stock
    const permitido = Math.max(0, stock - yaEnCarrito);
    const aAgregar = Math.min(cantidad, permitido);

    if (aAgregar <= 0) return prev;

    return {
      ...prev,
      [sku]: {
        ...producto,
        cantidad: yaEnCarrito + aAgregar,
      },
    };
  });

  setCantidades((prev) => ({ ...prev, [sku]: 0 }));
};


  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="max-w-6xl mx-auto px-8 pt-32 pb-12">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          Suministros
        </p>

        <h1 className="mt-4 text-4xl md:text-5xl font-semibold">
          Catálogo de productos para tu barra de café
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-3xl">
          Explora los productos por categoría o utiliza los filtros para
          encontrar lo que necesitas. La lista se carga dinámicamente desde la
          base de datos.
        </p>

        {cargando ? (
          <p className="mt-6 text-sm text-gray-500">Recordando catálogo…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">
            Error cargando catálogo: {error}
          </p>
        ) : null}
      </section>

      <section className="sticky top-24 z-20 bg-white/95 backdrop-blur border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  type="button"
                  onClick={() => setCategoriaActiva(categoria)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    categoriaActiva === categoria
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {categoria}
                </button>
              ))}
            </div>

            <a
              href="/suministros/carrito"
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-gray-400"
              aria-label="Ir al carrito"
            >
              <span className="text-base">🛒</span>
              <span>Carrito</span>
              <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                {totalCarrito}
              </span>
            </a>
          </div>

          <Filtros
            disponibilidad={disponibilidad}
            setDisponibilidad={setDisponibilidad}
            orden={orden}
            setOrden={setOrden}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            sugerencias={sugerencias}
          />
        </div>
      </section>

      {categorias.map((categoria) => (
        <div key={categoria} id={categoria.toLowerCase().replace(/\s+/g, "-")}>
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
          onIncrementar={(sku, stock) => actualizarCantidad(sku, 1, stock)}
            onDecrementar={(sku) => actualizarCantidad(sku, -1)}
            onAgregarCarrito={agregarAlCarrito}
          />
        </div>
      ))}
    </main>
  );
}

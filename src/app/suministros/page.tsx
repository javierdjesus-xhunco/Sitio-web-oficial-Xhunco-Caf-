"use client";

import { useEffect, useMemo, useState } from "react";

type SuministroDB = {
  id: number;
  sku: string | null;
  nombre: string;
  categoria: string | null;
  presentacion: string | null;
  precio: number;
  unidad: string | null;
  stock: number;
  activo: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

type ProductoUI = {
  key: string; // sku si existe, si no "id:<id>"
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  unidad?: string;
  stock: number;
  activo: boolean;
  imagen: string;
};

const categoriasBase = [
  "GENERAL",
];

const ordenarOpciones = [
  { value: "az", label: "Alfabéticamente A-Z" },
  { value: "precio", label: "Precio" },
];

function Filtros({
  disponibilidad,
  setDisponibilidad,
  orden,
  setOrden,
  busqueda,
  setBusqueda,
  sugerencias,
}: {
  disponibilidad: string;
  setDisponibilidad: (v: string) => void;
  orden: string;
  setOrden: (v: string) => void;
  busqueda: string;
  setBusqueda: (v: string) => void;
  sugerencias: string[];
}) {
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

function CatalogoSeccion({
  titulo,
  descripcion,
  categoria,
  productos,
  cantidades,
  onIncrementar,
  onDecrementar,
  onAgregarCarrito,
}: {
  titulo: string;
  descripcion?: string | null;
  categoria: string;
  productos: ProductoUI[];
  cantidades: Record<string, number>;
  onIncrementar: (key: string) => void;
  onDecrementar: (key: string) => void;
  onAgregarCarrito: (producto: ProductoUI) => void;
}) {
  return (
    <section className="max-w-6xl mx-auto px-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{titulo}</h2>
          {descripcion ? <p className="mt-2 text-gray-600">{descripcion}</p> : null}
        </div>
        <span className="text-sm text-gray-500">{categoria}</span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {productos.length > 0 ? (
          productos.map((producto) => {
            const cantidad = cantidades[producto.key] ?? 0;

            const estado = !producto.activo
              ? "Inactivo"
              : producto.stock > 0
              ? "Disponible"
              : "Agotado";

            const sinInventario = estado !== "Disponible";

            return (
              <article
                key={producto.key}
                className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{producto.categoria}</span>
                  <span>
                    {estado}
                    {producto.activo ? ` · Stock: ${producto.stock}` : ""}
                  </span>
                </div>

                <div className="mt-4 h-32 rounded-xl bg-gray-100" />

                <h3 className="mt-6 text-lg font-semibold">{producto.nombre}</h3>

                <p className="mt-2 text-sm text-gray-600">
                  {producto.descripcion}
                </p>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold text-gray-900">
                      ${producto.precio} MXN
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
                            onClick={() => onIncrementar(producto.key)}
                            disabled={sinInventario}
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

  const [productos, setProductos] = useState<ProductoUI[]>([]);
  const [cargando, setCargando] = useState(true);

  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [carrito, setCarrito] = useState<Record<string, ProductoUI & { cantidad: number }>>({});
  const [carritoCargado, setCarritoCargado] = useState(false);

  // 1) Cargar productos reales desde la API
  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const res = await fetch("/api/suministros", { cache: "no-store" });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        const data = (await res.json()) as SuministroDB[];

        const mapeados: ProductoUI[] = data.map((s) => ({
          key: s.sku?.trim() ? s.sku.trim() : `id:${s.id}`,
          nombre: s.nombre,
          categoria: s.categoria ?? "General",
          descripcion: s.presentacion ?? "",
          precio: Number(s.precio ?? 0),
          unidad: s.unidad ?? undefined,
          stock: Number(s.stock ?? 0),
          activo: Boolean(s.activo),
          imagen: "/suministros/placeholder.svg",
        }));

        if (activo) setProductos(mapeados);
      } catch (e) {
        console.error("No se pudo cargar /api/suministros", e);
        if (activo) setProductos([]);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  // 2) Categorías (base + las que vengan de BD)
  const categorias = useMemo(() => {
    const set = new Set(categoriasBase);
    for (const p of productos) {
      if (p.categoria && !set.has(p.categoria)) set.add(p.categoria);
    }
    return Array.from(set);
  }, [productos]);

  // 3) Filtrado + orden
  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const resultado = productos.filter((producto) => {
      const estado = !producto.activo
        ? "Inactivo"
        : producto.stock > 0
        ? "Disponible"
        : "Agotado";

      const coincideCategoria =
        categoriaActiva === "General" || producto.categoria === categoriaActiva;

      const coincideDisponibilidad =
        disponibilidad === "todas" ||
        (disponibilidad === "disponible" && estado === "Disponible") ||
        (disponibilidad === "agotado" && estado === "Agotado") ||
        (disponibilidad === "inactivo" && estado === "Inactivo");

      const coincideBusqueda =
        texto === "" || producto.nombre.toLowerCase().includes(texto);

      return coincideCategoria && coincideDisponibilidad && coincideBusqueda;
    });

    return resultado.sort((a, b) => {
      if (orden === "precio") return a.precio - b.precio;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [busqueda, categoriaActiva, disponibilidad, orden, productos]);

  const sugerencias = useMemo(() => {
    if (!busqueda.trim()) return [];
    const texto = busqueda.toLowerCase();
    return productos
      .filter((producto) => producto.nombre.toLowerCase().includes(texto))
      .slice(0, 6)
      .map((producto) => producto.nombre);
  }, [busqueda, productos]);

  const productosPorCategoria = useMemo(() => {
    return categorias.reduce((acc, categoria) => {
      if (categoria === "General") {
        acc[categoria] = productosFiltrados;
      } else {
        acc[categoria] = productosFiltrados.filter(
          (producto) => producto.categoria === categoria,
        );
      }
      return acc;
    }, {} as Record<string, ProductoUI[]>);
  }, [categorias, productosFiltrados]);

  const totalCarrito = Object.values(carrito).reduce(
    (total, item) => total + item.cantidad,
    0,
  );

  // 4) Cargar carrito desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const guardado = window.localStorage.getItem("suministrosCarrito");
    if (guardado) {
      try {
        setCarrito(JSON.parse(guardado));
      } catch (error) {
        console.error("No se pudo leer el carrito guardado.", error);
      }
    }
    setCarritoCargado(true);
  }, []);

  // 5) Guardar carrito
  useEffect(() => {
    if (!carritoCargado || typeof window === "undefined") return;
    window.localStorage.setItem("suministrosCarrito", JSON.stringify(carrito));
  }, [carrito, carritoCargado]);

  const actualizarCantidad = (key: string, delta: number) => {
    setCantidades((prev) => {
      const actual = prev[key] ?? 0;
      const siguiente = Math.max(0, actual + delta);
      return { ...prev, [key]: siguiente };
    });
  };

  const agregarAlCarrito = (producto: ProductoUI) => {
    const cantidad = cantidades[producto.key] ?? 0;

    const estado = !producto.activo
      ? "Inactivo"
      : producto.stock > 0
      ? "Disponible"
      : "Agotado";

    if (cantidad === 0 || estado !== "Disponible") return;

    setCarrito((prev) => {
      const existente = prev[producto.key];
      const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad;

      return {
        ...prev,
        [producto.key]: {
          ...producto,
          cantidad: nuevaCantidad,
        },
      };
    });

    setCantidades((prev) => ({ ...prev, [producto.key]: 0 }));
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
          encontrar lo que necesitas. Este catálogo ya está conectado a la base
          de datos.
        </p>

        {cargando ? (
          <p className="mt-6 text-sm text-gray-500">Cargando productos…</p>
        ) : (
          <p className="mt-6 text-sm text-gray-500">
            Productos cargados: <span className="font-semibold">{productos.length}</span>
          </p>
        )}
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
        <div key={categoria} id={categoria.toLowerCase().replaceAll(" ", "-")}>
          <CatalogoSeccion
            titulo={categoria}
            descripcion={
              categoria === "General"
                ? "Todos los productos del catálogo."
                : "Filtra y busca dentro de esta categoría."
            }
            categoria={categoria}
            productos={productosPorCategoria[categoria] ?? []}
            cantidades={cantidades}
            onIncrementar={(key) => actualizarCantidad(key, 1)}
            onDecrementar={(key) => actualizarCantidad(key, -1)}
            onAgregarCarrito={agregarAlCarrito}
          />
        </div>
      ))}
    </main>
  );
}

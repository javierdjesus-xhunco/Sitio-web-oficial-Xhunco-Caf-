"use client";

import { useEffect, useMemo, useState } from "react";

const categorias = [
  "General",
  "Jarabes",
  "Salsas",
  "Bases en polvo",
  "Bubble",
  "Té y tisanas",
];

const productos = [
  {
    nombre: "Jarabe de vainilla",
    categoria: "Jarabes",
    descripcion: "Ideal para lattes y bebidas frías.",
    disponible: true,
    precio: 210,
    imagen: "/suministros/placeholder.svg",
  },
  {
    nombre: "Jarabe de caramelo",
    categoria: "Jarabes",
    descripcion: "Dulce, con notas tostadas.",
    disponible: false,
    precio: 225,
    imagen: "/suministros/placeholder.svg",
  },
  {
    nombre: "Salsa de chocolate",
    categoria: "Salsas",
    descripcion: "Perfecta para mocha y frappés.",
    disponible: true,
    precio: 240,
    imagen: "/suministros/placeholder.svg",
  },
  {
    nombre: "Base chai",
    categoria: "Bases en polvo",
    descripcion: "Especias y té negro en polvo.",
    disponible: true,
    precio: 320,
    imagen: "/suministros/placeholder.svg",
  },
  {
    nombre: "Base matcha",
    categoria: "Bases en polvo",
    descripcion: "Matcha ceremonial para bebidas.",
    disponible: true,
    precio: 390,
    imagen: "/suministros/placeholder.svg",
  },
  {
    nombre: "Perlas tapioca",
    categoria: "Bubble",
    descripcion: "Textura suave para bubble tea.",
    disponible: false,
    precio: 180,
    imagen: "/suministros/placeholder.svg",
  },
  {
    nombre: "Té verde jazmín",
    categoria: "Té y tisanas",
    descripcion: "Aroma floral con notas suaves.",
    disponible: true,
    precio: 160,
    imagen: "/suministros/placeholder.svg",
  },
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
}) {
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
            const cantidad = cantidades[producto.nombre] ?? 0;
            const sinInventario = !producto.disponible;
            return (
            <article
              key={producto.nombre}
              className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{producto.categoria}</span>
                <span>{producto.disponible ? "Disponible" : "Agotado"}</span>
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
                          onClick={() => onIncrementar(producto.nombre)}
                          disabled={sinInventario}
                          className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                          aria-label={`Agregar ${producto.nombre}`}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => onDecrementar(producto.nombre)}
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
          )})
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
  const [cantidades, setCantidades] = useState({});
  const [carrito, setCarrito] = useState({});
  const [carritoCargado, setCarritoCargado] = useState(false);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const resultado = productos.filter((producto) => {
      const coincideCategoria =
        categoriaActiva === "General" || producto.categoria === categoriaActiva;
      const coincideDisponibilidad =
        disponibilidad === "todas" ||
        (disponibilidad === "disponible" && producto.disponible) ||
        (disponibilidad === "agotado" && !producto.disponible);
      const coincideBusqueda =
        texto === "" || producto.nombre.toLowerCase().includes(texto);

      return coincideCategoria && coincideDisponibilidad && coincideBusqueda;
    });

    return resultado.sort((a, b) => {
      if (orden === "precio") {
        return a.precio - b.precio;
      }
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [busqueda, categoriaActiva, disponibilidad, orden]);

  const sugerencias = useMemo(() => {
    if (!busqueda.trim()) {
      return [];
    }
    const texto = busqueda.toLowerCase();
    return productos
      .filter((producto) => producto.nombre.toLowerCase().includes(texto))
      .slice(0, 6)
      .map((producto) => producto.nombre);
  }, [busqueda]);

  const productosPorCategoria = categorias.reduce((acc, categoria) => {
    if (categoria === "General") {
      acc[categoria] = productosFiltrados;
    } else {
      acc[categoria] = productosFiltrados.filter(
        (producto) => producto.categoria === categoria,
      );
    }
    return acc;
  }, {});

  const totalCarrito = Object.values(carrito).reduce(
    (total, item) => total + item.cantidad,
    0,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
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

  useEffect(() => {
    if (!carritoCargado || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("suministrosCarrito", JSON.stringify(carrito));
  }, [carrito, carritoCargado]);

  const actualizarCantidad = (nombre, delta) => {
    setCantidades((prev) => {
      const actual = prev[nombre] ?? 0;
      const siguiente = Math.max(0, actual + delta);
      return { ...prev, [nombre]: siguiente };
    });
  };

  const agregarAlCarrito = (producto) => {
    const cantidad = cantidades[producto.nombre] ?? 0;
    if (cantidad === 0 || !producto.disponible) {
      return;
    }
    setCarrito((prev) => {
      const existente = prev[producto.nombre];
      const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad;
      return {
        ...prev,
        [producto.nombre]: {
          ...producto,
          cantidad: nuevaCantidad,
        },
      };
    });
    setCantidades((prev) => ({ ...prev, [producto.nombre]: 0 }));
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
          encontrar lo que necesitas. Cada sección ya está preparada para
          conectarse con una base de datos SQL.
        </p>
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
        <div key={categoria} id={categoria.toLowerCase().replace(" ", "-")}>
          <CatalogoSeccion
            titulo={categoria}
            descripcion={
              categoria === "General"
                ? "Todos los productos disponibles en el catálogo."
                : "Filtra y busca dentro de esta categoría."
            }
            categoria={categoria}
            productos={productosPorCategoria[categoria]}
            cantidades={cantidades}
            onIncrementar={(nombre) => actualizarCantidad(nombre, 1)}
            onDecrementar={(nombre) => actualizarCantidad(nombre, -1)}
            onAgregarCarrito={agregarAlCarrito}
          />
        </div>
      ))}

      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="rounded-2xl border border-dashed border-gray-300 p-8">
          <h2 className="text-2xl font-semibold">¿Cómo lo conectaremos?</h2>
          <p className="mt-4 text-gray-600">
            La idea es guardar los productos en una tabla SQL con campos como
            nombre, descripción, precio, categoría e inventario. Después los
            consumimos desde una API interna y renderizamos aquí el catálogo.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-gray-700 md:grid-cols-3">
            <div>
              <p className="font-semibold">1. Base de datos</p>
              <p className="mt-2">
                MySQL o PostgreSQL con una tabla{" "}
                <span className="font-medium">productos</span>.
              </p>
            </div>
            <div>
              <p className="font-semibold">2. API</p>
              <p className="mt-2">
                Rutas en <span className="font-medium">/api/suministros</span>{" "}
                para listar y crear.
              </p>
            </div>
            <div>
              <p className="font-semibold">3. Catálogo</p>
              <p className="mt-2">
                Esta vista consume la API y muestra tarjetas dinámicas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
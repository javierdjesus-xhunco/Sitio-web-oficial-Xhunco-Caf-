"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function norm(s) {
  return String(s || "").toLowerCase().trim();
}

const LS_DRAFT = "xhunco_cart_draft";
const LS_DRAFT_NO = "xhunco_cart_draft_no";
const LS_RESUMEN = "xhunco_nuevo_pedido";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export default function NuevoPedidoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [priceTier, setPriceTier] = useState("");

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});

  const [category, setCategory] = useState("ALL");
  const [q, setQ] = useState("");
  const [orderBy, setOrderBy] = useState("nombre"); // nombre | precio | stock

  // consecutivo local del pedido en preparación
  const [draftNo, setDraftNo] = useState(null);

  // modal imagen
  const [imgOpen, setImgOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgAlt, setImgAlt] = useState("");

  const loadSuministros = async () => {
    setError("");
    const res = await fetch("/api/cliente/suministros", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "No se pudieron cargar suministros");
      return false;
    }
    setItems(data.items || []);
    setPriceTier(data.price_tier || "");
    return true;
  };

  // 1) Cargar suministros
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadSuministros();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Restaurar carrito (draft) al entrar a la pantalla
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDraftNo = localStorage.getItem(LS_DRAFT_NO);
    if (savedDraftNo) setDraftNo(Number(savedDraftNo));

    const saved = localStorage.getItem(LS_DRAFT);
    if (saved) {
      const data = safeParse(saved, null);
      if (data?.cart && typeof data.cart === "object") {
        setCart(data.cart);
      }
      if (data?.draftNo && !savedDraftNo) {
        setDraftNo(Number(data.draftNo));
      }
    }
  }, []);

  // 3) Guardar carrito automáticamente en localStorage (persistente)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasItems = Object.keys(cart || {}).length > 0;

    // Si el usuario agrega su primer producto y aún no hay draftNo, genera consecutivo
    if (hasItems && !draftNo) {
      const current = Number(localStorage.getItem(LS_DRAFT_NO) || "0");
      const next = current + 1;
      localStorage.setItem(LS_DRAFT_NO, String(next));
      setDraftNo(next);
    }

    const persistedNo =
      draftNo || Number(localStorage.getItem(LS_DRAFT_NO) || "0") || null;

    localStorage.setItem(
      LS_DRAFT,
      JSON.stringify({
        draftNo: persistedNo,
        cart,
        updatedAt: Date.now(),
      }),
    );
  }, [cart, draftNo]);

  // categorías dinámicas
  const categories = useMemo(() => {
    const set = new Set();
    for (const it of items) {
      if (it?.categoria) set.add(String(it.categoria).trim());
    }
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b, "es"))];
  }, [items]);

  const cartItems = useMemo(() => Object.values(cart), [cart]);

  const total = useMemo(() => {
    return cartItems.reduce(
      (acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0),
      0,
    );
  }, [cartItems]);

  const getStock = (id) => {
    const p = items.find((x) => x.id === id);
    return Number(p?.stock ?? 0);
  };

  const getInCart = (id) => Number(cart[id]?.qty || 0);

  const setQty = (p, nextQty) => {
    setError("");
    setNotice("");

    const stock = Number(p?.stock ?? 0);
    if (!Number.isFinite(stock) || stock < 0) {
      setNotice("Stock inválido.");
      return;
    }

    const qty = Math.max(0, Math.min(nextQty, stock));

    setCart((prev) => {
      const next = { ...prev };

      if (qty <= 0) {
        delete next[p.id];
        return next;
      }

      next[p.id] = { id: p.id, nombre: p.nombre, price: p.price, qty };
      return next;
    });

    if (nextQty > stock) {
      setNotice(`Stock insuficiente. Máximo disponible: ${stock}.`);
    }
  };

  const addOne = (p) => {
    const current = getInCart(p.id);
    setQty(p, current + 1);
  };

  const removeOne = (p) => {
    const current = getInCart(p.id);
    setQty(p, current - 1);
  };

  const clearCart = () => {
    setCart({});
    setError("");
    setNotice("");
    // OJO: NO tocamos LS_DRAFT_NO, solo borramos el draft actual
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_DRAFT);
      localStorage.removeItem(LS_RESUMEN);
    }
    setDraftNo(null);
  };

  const openImage = (src, alt) => {
    if (!src) return;
    setImgSrc(src);
    setImgAlt(alt || "Imagen");
    setImgOpen(true);
  };

  const closeImage = () => {
    setImgOpen(false);
    setImgSrc("");
    setImgAlt("");
  };

  // filtro combinado: categoría + búsqueda + orden
  const filteredItems = useMemo(() => {
    const query = norm(q);

    const filtered = items.filter((it) => {
      if (category !== "ALL" && String(it.categoria || "").trim() !== category) {
        return false;
      }
      if (!query) return true;

      const haystack = [
        it.nombre,
        it.marca,
        it.categoria,
        it.presentacion,
        it.unidad,
        it.sku,
      ]
        .map(norm)
        .join(" ");

      return haystack.includes(query);
    });

    filtered.sort((a, b) => {
      const aStock = Number(a?.stock ?? 0);
      const bStock = Number(b?.stock ?? 0);

      // con stock primero
      const aHas = Number.isFinite(aStock) && aStock > 0 ? 1 : 0;
      const bHas = Number.isFinite(bStock) && bStock > 0 ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas;

      if (orderBy === "precio") return Number(b?.price || 0) - Number(a?.price || 0);
      if (orderBy === "stock") return bStock - aStock;

      const an = String(a?.nombre || "").toLowerCase();
      const bn = String(b?.nombre || "").toLowerCase();
      return an.localeCompare(bn, "es");
    });

    return filtered;
  }, [items, category, q, orderBy]);

  const goToResumen = () => {
    setError("");
    setNotice("");

    if (cartItems.length === 0) {
      setNotice("Agrega al menos un producto al carrito.");
      return;
    }

    // Validación extra por si cambió stock
    for (const it of cartItems) {
      const stock = getStock(it.id);
      if (it.qty > stock) {
        setError(`El producto "${it.nombre}" excede stock (${stock}). Ajusta tu carrito.`);
        return;
      }
    }

    const currentDraftNo =
      draftNo || Number(localStorage.getItem(LS_DRAFT_NO) || "0") || null;

    const payload = {
      draftNo: currentDraftNo,
      items: cartItems,
      total,
      priceTier,
      ts: Date.now(),
    };

    localStorage.setItem(LS_RESUMEN, JSON.stringify(payload));
    router.push("/portal/cliente/pedidos/resumen");
  };

  if (loading) {
    return <div className="text-gray-600">Cargando suministros...</div>;
  }

  return (
    <div className="max-w-[1200px] w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Nuevo pedido{" "}
            {draftNo ? <span className="text-gray-500">#{draftNo}</span> : null}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Precios aplicados:{" "}
            <span className="text-gray-900 font-medium">{priceTier || "—"}</span>
          </p>
        </div>

        <a
          href="/portal/cliente/dashboard"
          className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          Volver
        </a>
      </div>

      {/* Alerts */}
      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm font-semibold text-gray-900">Suministros</div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Categoría */}
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600">Categoría</div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "ALL" ? "General" : c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ordenar */}
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600">Ordenar</div>
                  <select
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:border-emerald-500"
                  >
                    <option value="nombre">Nombre A–Z</option>
                    <option value="precio">Precio (mayor → menor)</option>
                    <option value="stock">Stock (mayor → menor)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buscador */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, marca, categoría o SKU…"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setQ("")}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Limpiar
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Mostrando: <span className="text-gray-900">{filteredItems.length}</span> productos
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((p) => {
              const stock = Number(p?.stock ?? 0);
              const outOfStock = !Number.isFinite(stock) || stock <= 0;
              const inCart = getInCart(p.id);
              const atMax = inCart >= stock && stock > 0;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4 flex flex-col"
                >
                  {/* Imagen centrada */}
                  <button
                    type="button"
                    onClick={() => openImage(p.imagen, p.nombre)}
                    className="mb-3 flex justify-center"
                    title={p.imagen ? "Ver imagen" : "Sin imagen"}
                  >
                    <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      {p.imagen ? (
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-[11px] text-gray-400">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Info */}
                  <div className="flex-1 text-center">
                    <div className="text-gray-900 font-medium leading-tight line-clamp-2">
                      {p.nombre}
                    </div>

                    <div className="mt-1 text-[11px] text-gray-600">{p.categoria || ""}</div>

                    <div className="mt-1 text-[11px] text-gray-500">
                      {p.marca ? `${p.marca} · ` : ""}
                      {p.presentacion ? `${p.presentacion}` : ""}
                      {p.unidad ? ` · ${p.unidad}` : ""}
                      {p.sku ? ` · ${p.sku}` : ""}
                    </div>

                    <div className="mt-2 text-base sm:text-lg font-semibold text-gray-900">
                      {formatMoney(p.price)}
                    </div>

                    <div className="mt-1 text-[11px]">
                      {outOfStock ? (
                        <span className="text-red-700">Sin stock</span>
                      ) : (
                        <span className="text-gray-600">
                          Stock: {stock} {inCart ? `· En carrito: ${inCart}` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controles +/- */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => removeOne(p)}
                      disabled={inCart <= 0}
                      className="rounded-xl border border-gray-200 bg-white py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      −
                    </button>

                    <div className="rounded-xl border border-gray-200 bg-white py-2 text-sm text-gray-900 text-center">
                      {inCart}
                    </div>

                    <button
                      type="button"
                      onClick={() => addOne(p)}
                      disabled={outOfStock || atMax}
                      className="rounded-xl bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title={outOfStock ? "Sin stock" : atMax ? "Máximo por stock" : "Agregar"}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrito */}
        <div className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">
              Carrito {draftNo ? <span className="text-gray-500">· #{draftNo}</span> : null}
            </div>

            <button
              onClick={() => {
                setQ("");
                setCategory("ALL");
                setOrderBy("nombre");
                clearCart();
              }}
              className="text-xs text-gray-600 hover:text-gray-900 transition"
              type="button"
              title="Vaciar carrito"
            >
              Vaciar
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-sm text-gray-600">Aún no agregas productos.</div>
            ) : (
              cartItems.map((it) => {
                const stock = getStock(it.id);
                const atMax = it.qty >= stock;

                return (
                  <div key={it.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-gray-900 truncate">{it.nombre}</div>
                        <div className="text-xs text-gray-600">
                          {formatMoney(it.price)} c/u · Stock: {stock}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const p = items.find((x) => x.id === it.id);
                            if (p) removeOne(p);
                          }}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 transition"
                          type="button"
                        >
                          -
                        </button>

                        <div className="w-8 text-center text-sm text-gray-900">{it.qty}</div>

                        <button
                          disabled={atMax || stock <= 0}
                          onClick={() => {
                            const p = items.find((x) => x.id === it.id);
                            if (p) addOne(p);
                          }}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      Subtotal: {formatMoney(Number(it.price || 0) * Number(it.qty || 0))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="text-gray-900 font-semibold">{formatMoney(total)}</span>
            </div>

            <button
              disabled={cartItems.length === 0}
              onClick={goToResumen}
              className="mt-4 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm text-white hover:bg-emerald-700 disabled:opacity-60 transition"
              type="button"
            >
              Resumen del pedido
            </button>

            <div className="mt-2 text-[11px] text-gray-500">
              Tu carrito se guarda automáticamente aunque cambies de sección.
            </div>
          </div>
        </div>
      </div>

      {/* Modal imagen */}
      {imgOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={closeImage} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-[720px] rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-900 truncate">{imgAlt}</div>
                <button
                  type="button"
                  onClick={closeImage}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {imgSrc ? (
                  <img src={imgSrc} alt={imgAlt} className="w-full h-auto object-contain" />
                ) : (
                  <div className="p-8 text-center text-sm text-gray-600">Sin imagen</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

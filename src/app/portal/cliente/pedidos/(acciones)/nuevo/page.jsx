"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function norm(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function isCafe1Kg(it) {
  const nombre = norm(it?.nombre);
  const categoria = norm(it?.categoria);
  const presentacion = norm(it?.presentacion);

  const looks1kg =
    presentacion === "1kg" ||
    presentacion === "1 kg" ||
    nombre.includes("1kg") ||
    nombre.includes("1 kg") ||
    nombre.includes("1000g") ||
    nombre.includes("1000 g");

  const looksCafe = categoria.includes("cafe") || nombre.includes("cafe");
  return looksCafe && looks1kg;
}

const LS_DRAFT = "xhunco_cart_draft";
const LS_DRAFT_NO = "xhunco_cart_draft_no";
const LS_RESUMEN = "xhunco_nuevo_pedido";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

const DISCOUNT_PER_KG = 9;

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

  const [draftNo, setDraftNo] = useState(null);

  // ✅ evita sobrescribir LS_DRAFT vacío al montar
  const [hydrated, setHydrated] = useState(false);

  // ✅ NUEVO: regla Barro Negro (solo UI; backend ya la aplica real)
  const [barroNegroDiscount, setBarroNegroDiscount] = useState(false);

  // modal imagen
  const [imgOpen, setImgOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const imgCardRef = useRef(null);

  // ✅ Modal resumen móvil
  const [cartModalOpen, setCartModalOpen] = useState(false);

  // ✅ Solicitudes (solo pendientes) - ultra ligero
  const [reqOpen, setReqOpen] = useState(false);
  const [reqProduct, setReqProduct] = useState(null);
  const [reqQty, setReqQty] = useState(1);
  const [reqSending, setReqSending] = useState(false);
  const [reqError, setReqError] = useState("");
  const [myPendingRequests, setMyPendingRequests] = useState([]);

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
    setBarroNegroDiscount(Boolean(data.barro_negro_discount));
    return true;
  };

  const loadMyPendingRequests = async () => {
    const res = await fetch("/api/cliente/suministros/solicitudes", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    setMyPendingRequests(data.items || []);
  };

  // 1) Cargar suministros
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadSuministros();
      await loadMyPendingRequests(); // ✅ solicitudes pendientes
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Restaurar carrito
  useEffect(() => {
    if (typeof window === "undefined") return;

    setHydrated(false);

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

    setHydrated(true);
  }, []);

  // 3) Persistir carrito
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydrated) return;

    const hasItems = Object.keys(cart || {}).length > 0;

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
  }, [cart, draftNo, hydrated]);

  // ✅ Mejora modal imagen: bloquear scroll del fondo + cerrar con ESC
  useEffect(() => {
    if (!imgOpen || typeof window === "undefined") return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeImage();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [imgOpen]);

  // categorías dinámicas
  const categories = useMemo(() => {
    const set = new Set();
    for (const it of items) {
      if (it?.categoria) set.add(String(it.categoria).trim());
    }
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b, "es"))];
  }, [items]);

  const cartItems = useMemo(() => Object.values(cart), [cart]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + Number(it?.qty || 0), 0);
  }, [cartItems]);

  const effectiveUnitPrice = (it) => {
    const base = Number(it?.price || 0);
    if (!barroNegroDiscount) return { base, final: base, applies: false };
    if (!isCafe1Kg(it)) return { base, final: base, applies: false };
    const final = Math.max(0, base - DISCOUNT_PER_KG);
    return { base, final, applies: true };
  };

  const total = useMemo(() => {
    return cartItems.reduce((acc, it) => {
      const { final } = effectiveUnitPrice(it);
      return acc + final * Number(it.qty || 0);
    }, 0);
  }, [cartItems, barroNegroDiscount]); // eslint-disable-line react-hooks/exhaustive-deps

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

      // ✅ guardamos también categoria/presentacion para poder detectar 1kg
      next[p.id] = {
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        presentacion: p.presentacion,
        price: p.price,
        qty,
      };
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
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_DRAFT);
      localStorage.removeItem(LS_RESUMEN);
    }
    setDraftNo(null);
    setCartModalOpen(false);
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

  // ✅ Map de solicitudes pendientes por suministro (O(1) en render)
  const pendingReqBySuministro = useMemo(() => {
    const m = new Map();
    for (const r of myPendingRequests || []) {
      if (r?.suministro_id) m.set(r.suministro_id, r);
    }
    return m;
  }, [myPendingRequests]);

  const openRequestModal = (p) => {
    setReqError("");
    setReqQty(1);
    setReqProduct(p);
    setReqOpen(true);
  };

  const closeRequestModal = () => {
    setReqOpen(false);
    setReqProduct(null);
    setReqQty(1);
    setReqError("");
  };

  const sendRequest = async () => {
    if (!reqProduct?.id) return;
    setReqSending(true);
    setReqError("");
    setNotice("");
    setError("");

    try {
      const res = await fetch("/api/cliente/suministros/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suministro_id: reqProduct.id, qty: reqQty }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReqError(data?.error || "No se pudo enviar la solicitud");
        setReqSending(false);
        return;
      }

      await loadMyPendingRequests(); // ✅ refresco ligero
      setNotice("Solicitud enviada. Te avisaremos cuando sea confirmada.");
      closeRequestModal();
    } catch (e) {
      setReqError("Error de red al enviar solicitud");
    } finally {
      setReqSending(false);
    }
  };

  // filtro combinado
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
      barroNegroDiscount,
    };

    localStorage.setItem(LS_RESUMEN, JSON.stringify(payload));
    setCartModalOpen(false);
    router.push("/portal/cliente/pedidos/resumen");
  };

  if (loading) {
    return <div className="text-gray-600">Cargando suministros...</div>;
  }

  return (
    <div className="w-full max-w-none text-black">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
            Nuevo Pedido
          </h1>
        </div>

        <a
          href="/portal/cliente/dashboard"
          className="rounded-full border px-5 py-2 text-sm transition"
          style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, backgroundColor: "white" }}
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
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600">Categoría</div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none"
                    style={{ borderColor: "rgba(0,0,0,0.12)" }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "ALL" ? "General" : c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600">Ordenar</div>
                  <select
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none"
                    style={{ borderColor: "rgba(0,0,0,0.12)" }}
                  >
                    <option value="nombre">Nombre A–Z</option>
                    <option value="precio">Precio (mayor → menor)</option>
                    <option value="stock">Stock (mayor → menor)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, marca, categoría o SKU…"
                className="w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none"
                style={{ borderColor: "rgba(0,0,0,0.12)" }}
              />
              <button
                type="button"
                onClick={() => setQ("")}
                className="rounded-xl border bg-white px-4 py-3 text-sm transition"
                style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
              >
                Limpiar
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Mostrando: <span className="text-gray-900">{filteredItems.length}</span>{" "}
              productos
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

                  <div className="flex-1 text-center">
                    <div className="text-gray-900 font-medium leading-tight line-clamp-2">
                      {p.nombre}
                    </div>

                    <div className="mt-1 text-[11px] text-gray-600">
                      {p.categoria || ""}
                    </div>

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

                  {/* ✅ Acciones */}
                  {outOfStock ? (
                    <div className="mt-3">
                      {pendingReqBySuministro.has(p.id) ? (
                        <div className="mb-2 text-center text-[11px] text-amber-800">
                          Solicitud pendiente · Cantidad:{" "}
                          <span className="font-semibold">
                            {pendingReqBySuministro.get(p.id)?.qty}
                          </span>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => openRequestModal(p)}
                        className="w-full rounded-xl py-2 text-sm text-white transition"
                        style={{ backgroundColor: BRAND_GREEN }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = BRAND_GREEN;
                        }}
                      >
                        Solicitar
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => removeOne(p)}
                        disabled={inCart <= 0}
                        className="rounded-xl border bg-white py-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
                      >
                        −
                      </button>

                      <div
                        className="rounded-xl border bg-white py-2 text-sm text-gray-900 text-center"
                        style={{ borderColor: "rgba(0,0,0,0.12)" }}
                      >
                        {inCart}
                      </div>

                      <button
                        type="button"
                        onClick={() => addOne(p)}
                        disabled={outOfStock || atMax}
                        className="rounded-xl py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        style={{ backgroundColor: BRAND_GREEN }}
                        onMouseEnter={(e) => {
                          if (!outOfStock && !atMax)
                            e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = BRAND_GREEN;
                        }}
                        title={outOfStock ? "Sin stock" : atMax ? "Máximo por stock" : "Agregar"}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrito (desktop) */}
        <div className="lg:sticky lg:top-6 self-start rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 hidden lg:block">
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
              className="text-xs transition"
              type="button"
              title="Vaciar carrito"
              style={{ color: BRAND_GREEN }}
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

                const { base, final, applies } = effectiveUnitPrice(it);

                return (
                  <div key={it.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-gray-900 truncate">{it.nombre}</div>
                        <div className="text-xs text-gray-600">
                          {applies ? (
                            <>
                              <span className="line-through text-gray-500">{formatMoney(base)}</span>{" "}
                              <span className="text-emerald-700 font-semibold">{formatMoney(final)}</span>{" "}
                              <span className="text-emerald-700">(-$9 Barro Negro)</span>
                            </>
                          ) : (
                            <>{formatMoney(base)}</>
                          )}{" "}
                          c/u · Stock: {stock}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const p = items.find((x) => x.id === it.id);
                            if (p) removeOne(p);
                          }}
                          className="rounded-full border bg-white px-3 py-1 text-xs transition"
                          style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
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
                          className="rounded-full border bg-white px-3 py-1 text-xs disabled:opacity-60 transition"
                          style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      Subtotal: {formatMoney(final * Number(it.qty || 0))}
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
              className="mt-4 w-full rounded-full px-6 py-3 text-sm text-white disabled:opacity-60 transition"
              style={{ backgroundColor: BRAND_GREEN }}
              onMouseEnter={(e) => {
                if (cartItems.length) e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = BRAND_GREEN;
              }}
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

      {/* ✅ Botón flotante móvil */}
      {cartCount > 0 ? (
        <button
          type="button"
          onClick={() => setCartModalOpen(true)}
          className="lg:hidden fixed z-40 right-4 bottom-4 rounded-full shadow-lg border transition active:scale-[0.98]"
          style={{ borderColor: "rgba(0,0,0,0.12)", backgroundColor: "white" }}
          aria-label="Ver carrito"
          title="Ver carrito"
        >
          <div className="relative p-3">
            <img src="/carrito.png" alt="Carrito" className="h-8 w-8 object-contain" loading="eager" />

            <span
              className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full grid place-items-center text-[11px] font-semibold"
              style={{ backgroundColor: BRAND_GREEN, color: "white" }}
            >
              {cartCount}
            </span>
          </div>
        </button>
      ) : null}

      {/* ✅ Modal resumen móvil */}
      {cartModalOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartModalOpen(false)} />

          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
            <div className="w-full max-w-[560px] rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    Carrito {draftNo ? <span className="text-gray-500">· #{draftNo}</span> : null}
                  </div>
                  <div className="text-xs text-gray-500">
                    {cartCount} producto(s) · Total:{" "}
                    <span className="text-gray-900 font-semibold">{formatMoney(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCartModalOpen(false)}
                  className="rounded-full border px-4 py-2 text-sm transition"
                  style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN, backgroundColor: "white" }}
                >
                  Cerrar
                </button>
              </div>

              <div className="border-t border-gray-200" />

              <div className="p-4 max-h-[55vh] overflow-auto">
                {cartItems.length === 0 ? (
                  <div className="text-sm text-gray-600">Aún no agregas productos.</div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((it) => {
                      const stock = getStock(it.id);
                      const atMax = it.qty >= stock;

                      const { base, final, applies } = effectiveUnitPrice(it);

                      return (
                        <div key={it.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900">{it.nombre}</div>
                              <div className="mt-1 text-xs text-gray-600">
                                {applies ? (
                                  <>
                                    <span className="line-through text-gray-500">{formatMoney(base)}</span>{" "}
                                    <span className="text-emerald-700 font-semibold">{formatMoney(final)}</span>{" "}
                                    <span className="text-emerald-700">(-$9 Barro Negro)</span>
                                  </>
                                ) : (
                                  <>{formatMoney(base)}</>
                                )}{" "}
                                c/u · Stock: {stock}
                              </div>
                              <div className="mt-1 text-xs text-gray-600">
                                Subtotal: {formatMoney(final * Number(it.qty || 0))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const p = items.find((x) => x.id === it.id);
                                  if (p) removeOne(p);
                                }}
                                className="rounded-full border bg-white px-3 py-1 text-xs transition"
                                style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
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
                                className="rounded-full border bg-white px-3 py-1 text-xs disabled:opacity-60 transition"
                                style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
                                type="button"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200" />

              <div className="p-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-1/2 rounded-full border px-6 py-3 text-sm transition"
                  style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN, backgroundColor: "white" }}
                >
                  Vaciar
                </button>

                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={goToResumen}
                  className="w-1/2 rounded-full px-6 py-3 text-sm text-white disabled:opacity-60 transition"
                  style={{ backgroundColor: BRAND_GREEN }}
                  onMouseEnter={(e) => {
                    if (cartItems.length) e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_GREEN;
                  }}
                >
                  Ir a resumen
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ Modal solicitar */}
      {reqOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={closeRequestModal} />

          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
            <div className="w-full max-w-[520px] rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">Solicitar suministro</div>
                  <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {reqProduct?.nombre || "—"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeRequestModal}
                  className="rounded-full border px-4 py-2 text-sm transition"
                  style={{
                    borderColor: "rgba(0,0,0,0.12)",
                    color: BRAND_GREEN,
                    backgroundColor: "white",
                  }}
                >
                  Cerrar
                </button>
              </div>

              <div className="border-t border-gray-200" />

              <div className="p-4">
                <div className="text-xs text-gray-600 mb-2">Selecciona cantidad</div>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReqQty((q) => Math.max(1, Number(q || 1) - 1))}
                    className="rounded-xl border bg-white py-2 text-sm transition"
                    style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
                    disabled={reqSending}
                  >
                    −
                  </button>

                  <div
                    className="rounded-xl border bg-white py-2 text-sm text-gray-900 text-center"
                    style={{ borderColor: "rgba(0,0,0,0.12)" }}
                  >
                    {reqQty}
                  </div>

                  <button
                    type="button"
                    onClick={() => setReqQty((q) => Math.min(999, Number(q || 1) + 1))}
                    className="rounded-xl py-2 text-sm text-white transition disabled:opacity-60"
                    style={{ backgroundColor: BRAND_GREEN }}
                    disabled={reqSending}
                    onMouseEnter={(e) => {
                      if (!reqSending) e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = BRAND_GREEN;
                    }}
                  >
                    +
                  </button>
                </div>

                <div className="mt-2 text-[11px] text-gray-500">
                  Cantidad mínima: 1 · Máxima: 999
                </div>

                {reqError ? (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {reqError}
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={reqSending}
                  onClick={sendRequest}
                  className="mt-4 w-full rounded-full px-6 py-3 text-sm text-white disabled:opacity-60 transition"
                  style={{ backgroundColor: BRAND_GREEN }}
                  onMouseEnter={(e) => {
                    if (!reqSending) e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_GREEN;
                  }}
                >
                  {reqSending ? "Enviando..." : "Enviar solicitud"}
                </button>

                <div className="mt-2 text-[11px] text-gray-500">
                  El admin confirmará tu solicitud para que puedas dar seguimiento.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ Modal imagen mejorado */}
      {imgOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeImage();
          }}
        >
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <div
              ref={imgCardRef}
              className="w-full max-w-[980px] max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl flex flex-col"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-3 py-3 sm:px-4">
                <div className="min-w-0 text-sm font-medium text-gray-900 truncate">
                  {imgAlt}
                </div>

                <button
                  type="button"
                  onClick={closeImage}
                  className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm transition"
                  style={{ color: BRAND_GREEN }}
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-auto bg-gray-50 p-2 sm:p-4 overscroll-contain">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={imgAlt}
                    className="mx-auto block max-w-full w-auto h-auto max-h-[calc(92vh-96px)] object-contain rounded-2xl"
                    loading="eager"
                    draggable={false}
                  />
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
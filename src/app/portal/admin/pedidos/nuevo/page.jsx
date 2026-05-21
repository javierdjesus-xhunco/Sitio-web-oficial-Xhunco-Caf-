"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const BRAND_GREEN = "#31572c";

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function normalizeTier(tier) {
  const t = String(tier || "").toLowerCase().trim();

  if (t === "precio_web" || t === "web") return "precio_web";
  if (
    t === "precio_publico" ||
    t === "publico" ||
    t === "público" ||
    t === "lista" ||
    t === "precio_lista"
  )
    return "precio_publico";
  if (t === "precio_mayoreo" || t === "mayoreo") return "precio_mayoreo";
  if (t === "precio_medio" || t === "medio") return "precio_medio";

  return "precio_publico";
}

function priceFromTier(product, tier) {
  const t = normalizeTier(tier);

  if (t === "precio_web") return Number(product?.precio_web ?? 0);
  if (t === "precio_publico") return Number(product?.precio_publico ?? 0);
  if (t === "precio_mayoreo") return Number(product?.precio_mayoreo ?? 0);
  if (t === "precio_medio") return Number(product?.precio_medio ?? 0);

  return Number(product?.precio_publico ?? 0);
}

// ✅ Debounce para que el filtro no recalculé con cada tecla
function useDebounced(value, ms = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function AdminPedidoManualPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [suministros, setSuministros] = useState([]);

  const [clientUserId, setClientUserId] = useState("");
  // ✅ Desde el inicio: precio público
  const [clientTier, setClientTier] = useState("precio_publico");

  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // filtros
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 200);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("az"); // az | price_desc | stock_desc

  // carrito
  const [cart, setCart] = useState([]);
  const [saving, setSaving] = useState(false);

  // ✅ Cache en memoria (evita refetch pesado si vuelves a la página)
  const clientsCacheRef = useRef(null);
  const suppliesCacheRef = useRef(null);

  // ✅ AbortController para cancelar requests
  const abortRef = useRef(null);

  // ✅ Traer TODOS los clientes paginando
  const fetchAllClients = useCallback(async () => {
    const pageSize = 50;
    let page = 1;
    let all = [];

    while (true) {
      const url = `/api/admin/clientes?page=${page}&pageSize=${pageSize}`;

      const r = await fetch(url, {
        cache: "no-store",
        signal: abortRef.current?.signal,
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Error cargando clientes");

      const data = j?.data || [];
      all = all.concat(data);

      const totalPages = Number(j?.totalPages || 1);
      if (page >= totalPages) break;

      page++;
      if (page > 500) break; // safety
    }

    return all;
  }, []);

  // ✅ Traer TODO el catálogo paginando (tu API es paginada)
  const fetchAllSuministros = useCallback(async () => {
    const pageSize = 50; // max en tu API
    let page = 1;
    let all = [];

    while (true) {
      const url = `/api/admin/suministros?page=${page}&pageSize=${pageSize}`;

      const r = await fetch(url, {
        cache: "no-store",
        signal: abortRef.current?.signal,
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Error cargando suministros");

      const data = j?.data || [];
      all = all.concat(data);

      const totalPages = Number(j?.totalPages || 1);
      if (page >= totalPages) break;

      page++;
      if (page > 500) break; // safety
    }

    return all;
  }, []);

  async function load() {
    // ✅ usa cache si existe
    if (clientsCacheRef.current && suppliesCacheRef.current) {
      setClients(clientsCacheRef.current);
      setSuministros(suppliesCacheRef.current);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const [clientsAll, suministrosAll] = await Promise.all([
        fetchAllClients(),
        fetchAllSuministros(),
      ]);

      // ✅ Normaliza tier de cada cliente (para que siempre funcione)
      const rawClients = clientsAll || [];
      const normalizedClients = rawClients.map((c) => ({
        ...c,
        price_tier: normalizeTier(c?.price_tier || "precio_publico"),
        label:
          c?.label ||
          c?.business_name ||
          c?.name ||
          c?.email ||
          "Cliente sin nombre",
      }));

      const sup = suministrosAll || [];

      clientsCacheRef.current = normalizedClients;
      suppliesCacheRef.current = sup;

      setClients(normalizedClients);
      setSuministros(sup);
    } catch (e) {
      if (String(e?.name) !== "AbortError") {
        alert(String(e?.message || e));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // lookup stock por id
  const stockById = useMemo(() => {
    const m = new Map();
    (suministros || []).forEach((s) => {
      m.set(s.id, Math.max(0, Number(s.stock || 0)));
    });
    return m;
  }, [suministros]);

  // lookup producto por id
  const productById = useMemo(() => {
    const m = new Map();
    (suministros || []).forEach((s) => m.set(s.id, s));
    return m;
  }, [suministros]);

  // Recalcular precios unitarios del carrito si cambia el tier
  useEffect(() => {
    if (cart.length === 0) return;
    setCart((prev) =>
      prev.map((it) => {
        const p = productById.get(it.suministro_id);
        if (!p) return it;
        return { ...it, unit_price: priceFromTier(p, clientTier) };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientTier, productById]);

  const categories = useMemo(() => {
    const set = new Set(
      (suministros || []).map((s) => s?.categoria).filter(Boolean)
    );
    return [
      "all",
      ...Array.from(set).sort((a, b) =>
        String(a).localeCompare(String(b), "es")
      ),
    ];
  }, [suministros]);

  const filteredSuministros = useMemo(() => {
    const term = dq.trim().toLowerCase();
    let list = [...(suministros || [])];

    if (category !== "all") {
      list = list.filter((s) => String(s.categoria || "") === String(category));
    }

    if (term) {
      list = list.filter((s) => {
        const hay = `${s.nombre} ${s.sku} ${s.marca} ${s.presentacion} ${s.categoria}`.toLowerCase();
        return hay.includes(term);
      });
    }

    if (sort === "az") {
      list.sort((a, b) =>
        String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
      );
    } else if (sort === "price_desc") {
      list.sort(
        (a, b) => priceFromTier(b, clientTier) - priceFromTier(a, clientTier)
      );
    } else if (sort === "stock_desc") {
      list.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
    }

    // ✅ límite para no renderizar demasiado
    return list.slice(0, 150);
  }, [dq, suministros, category, sort, clientTier]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, it) => acc + Number(it.qty) * Number(it.unit_price),
      0
    );
  }, [cart]);

  function currentQtyInCart(productId) {
    const it = cart.find((x) => x.suministro_id === productId);
    return it ? Number(it.qty) : 0;
  }

  function canAddOneMore(productId) {
    const stock = stockById.get(productId) ?? 0;
    const inCart = currentQtyInCart(productId);
    return stock > 0 && inCart < stock;
  }

  function addItem(s) {
    const stock = Math.max(0, Number(s?.stock || 0));
    if (stock <= 0) return;

    setCart((prev) => {
      const ix = prev.findIndex((x) => x.suministro_id === s.id);
      const price = priceFromTier(s, clientTier);

      if (ix >= 0) {
        const current = Number(prev[ix].qty);
        if (current >= stock) return prev;
        const copy = [...prev];
        copy[ix] = { ...copy[ix], qty: current + 1, unit_price: price };
        return copy;
      }

      return [
        ...prev,
        {
          suministro_id: s.id,
          nombre: s.nombre,
          sku: s.sku,
          marca: s.marca,
          presentacion: s.presentacion,
          unit_price: price,
          qty: 1,
        },
      ];
    });
  }

  function setQty(id, next) {
    const stock = stockById.get(id) ?? 0;
    if (stock <= 0) return;

    const v = Math.min(Math.max(1, Number(next || 1)), stock);
    setCart((prev) =>
      prev.map((it) => (it.suministro_id === id ? { ...it, qty: v } : it))
    );
  }

  function inc(id) {
    const stock = stockById.get(id) ?? 0;
    if (stock <= 0) return;

    setCart((prev) =>
      prev.map((it) => {
        if (it.suministro_id !== id) return it;
        const next = Math.min(Number(it.qty) + 1, stock);
        return { ...it, qty: next };
      })
    );
  }

  function dec(id) {
    setCart((prev) =>
      prev.map((it) => {
        if (it.suministro_id !== id) return it;
        return { ...it, qty: Math.max(1, Number(it.qty) - 1) };
      })
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((it) => it.suministro_id !== id));
  }

  async function createOrder() {
    if (!clientUserId) return alert("Selecciona un negocio.");
    if (cart.length === 0) return alert("Agrega al menos 1 producto.");

    for (const it of cart) {
      const stock = stockById.get(it.suministro_id) ?? 0;
      if (stock <= 0) return alert(`Sin stock para: ${it.nombre}`);
      if (Number(it.qty) > stock)
        return alert(`"${it.nombre}" excede stock (máx ${stock}).`);
    }

    setSaving(true);
    try {
      const r = await fetch("/api/admin/orders/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_user_id: clientUserId,
          delivery_method: deliveryMethod,
          payment_method: paymentMethod,
          items: cart.map((it) => ({
            suministro_id: it.suministro_id,
            qty: it.qty,
          })),
        }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);

      alert("Pedido creado correctamente.");
      router.push("/portal/admin/pedidos");
      router.refresh();
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="w-full max-w-[1680px] space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-black">
            Crear Pedido Manual
          </h1>
          <p className="text-sm text-gray-500">
            Precio del cliente:{" "}
            <span className="font-semibold text-black">
              {normalizeTier(clientTier)}
            </span>
          </p>
        </div>

        <button
          onClick={createOrder}
          disabled={saving || loading}
          className="rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: BRAND_GREEN }}
        >
          {saving ? "Creando…" : "Crear pedido"}
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Cargando…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Col 1 */}
          <div className="xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-black mb-2">
                Negocio
              </div>
              <select
                value={clientUserId}
                onChange={(e) => {
                  const id = e.target.value;
                  setClientUserId(id);

                  const c = (clients || []).find((x) => x.user_id === id);

                  // ✅ Si no existe o viene raro, cae a público
                  setClientTier(
                    normalizeTier(c?.price_tier || "precio_publico")
                  );
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none"
              >
                <option value="">Selecciona un negocio…</option>
                {(clients || [])
                  .filter((c) => c?.user_id)
                  .sort((a, b) =>
                    String(a?.label || "").localeCompare(
                      String(b?.label || ""),
                      "es"
                    )
                  )
                  .map((c) => (
                    <option key={c.user_id} value={c.user_id}>
                      {c.label ||
                        c.business_name ||
                        c.email ||
                        "Cliente sin nombre"}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="text-sm font-semibold text-black mb-2">
                  Método de entrega
                </div>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none"
                >
                  <option value="pickup">Recolección</option>
                  <option value="delivery">Entrega a domicilio</option>
                </select>
              </div>

              <div>
                <div className="text-sm font-semibold text-black mb-2">
                  Método de pago
                </div>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none"
                >
                  <option value="cash">Efectivo</option>
                  <option value="tpv">TPV</option>
                  <option value="online">En línea</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Subtotal</div>
              <div className="text-2xl font-semibold text-black">
                {money(subtotal)}
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="xl:col-span-5 rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="text-sm font-semibold text-black">Suministros</div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Todas las categorías" : c}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none"
              >
                <option value="az">A–Z</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="stock_desc">Stock: mayor a menor</option>
              </select>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar…"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
              />
            </div>

            {/* ✅ SIEMPRE mostrar listado: por defecto precio_publico, y cambia al seleccionar negocio */}
            <div className="max-h-[560px] overflow-auto space-y-2">
              {filteredSuministros.map((s) => {
                const stock = Math.max(0, Number(s.stock || 0));
                const disabled = stock <= 0;
                const canAdd = canAddOneMore(s.id);

                return (
                  <button
                    key={s.id}
                    onClick={() => addItem(s)}
                    disabled={disabled || !canAdd}
                    className={[
                      "w-full rounded-xl border p-3 text-left transition",
                      disabled || !canAdd
                        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                        : "border-gray-200 bg-white hover:bg-gray-50",
                    ].join(" ")}
                    title={
                      disabled
                        ? "Sin stock"
                        : !canAdd
                        ? "Ya alcanzaste el máximo por stock"
                        : "Agregar"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-black">
                          {s.nombre}{" "}
                          <span className="text-xs text-gray-500">
                            ({s.sku})
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {s.categoria ? `${s.categoria} · ` : ""}
                          {s.marca ? `${s.marca} · ` : ""}
                          {s.presentacion || ""}
                        </div>

                        <div className="text-xs font-semibold text-gray-900 mt-1">
                          {money(priceFromTier(s, clientTier))}
                        </div>

                        {disabled ? (
                          <div className="mt-1 text-[11px] font-semibold text-red-600">
                            Sin stock
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-gray-500">
                            Stock: {stock}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-gray-500">Stock</div>
                        <div className="text-sm font-semibold text-black">
                          {stock}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col 3 carrito */}
          <div className="xl:col-span-3">
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="text-sm font-semibold text-black">Carrito</div>

              {cart.length === 0 ? (
                <div className="text-sm text-gray-600">
                  Aún no agregas productos.
                </div>
              ) : (
                <div className="max-h-[55vh] overflow-auto space-y-3 pr-1">
                  {cart.map((it) => {
                    const stock = stockById.get(it.suministro_id) ?? 0;
                    const atMax = Number(it.qty) >= stock;

                    return (
                      <div
                        key={it.suministro_id}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-black">
                              {it.nombre}{" "}
                              <span className="text-xs text-gray-500">
                                ({it.sku})
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {it.marca ? `${it.marca} · ` : ""}
                              {it.presentacion || ""}
                            </div>

                            <div className="mt-1 text-[11px] text-gray-500">
                              Stock disponible:{" "}
                              <span className="font-semibold text-black">
                                {stock}
                              </span>
                            </div>

                            <div className="mt-1 text-xs text-gray-600">
                              Precio unitario:{" "}
                              <span className="font-semibold text-black">
                                {money(it.unit_price)}
                              </span>
                            </div>

                            <div className="text-xs font-semibold text-gray-900 mt-1">
                              Línea:{" "}
                              {money(Number(it.qty) * Number(it.unit_price))}
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(it.suministro_id)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Quitar
                          </button>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs font-semibold text-gray-700 mb-1">
                            Cantidad
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => dec(it.suministro_id)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              min="1"
                              max={Math.max(1, stock)}
                              value={it.qty}
                              onChange={(e) =>
                                setQty(it.suministro_id, e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none text-center"
                            />

                            <button
                              onClick={() => inc(it.suministro_id)}
                              disabled={stock <= 0 || atMax}
                              className={[
                                "rounded-lg border px-3 py-2 text-sm font-semibold",
                                stock <= 0 || atMax
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "border-gray-200 bg-white hover:bg-gray-50",
                              ].join(" ")}
                              title={
                                atMax
                                  ? "Ya alcanzaste el máximo por stock"
                                  : "Aumentar"
                              }
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

              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-lg font-semibold text-black">
                  {money(subtotal)}
                </div>
              </div>

              <button
                onClick={createOrder}
                disabled={saving || cart.length === 0 || !clientUserId}
                className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: BRAND_GREEN }}
              >
                {saving ? "Creando…" : "Crear pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
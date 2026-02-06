"use client";

import { useEffect, useMemo, useState } from "react";

export default function NuevoPedidoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(""); // mensajes tipo "stock insuficiente"
  const [priceTier, setPriceTier] = useState("");
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({}); // {id: {id,nombre,price,qty}}
  const [result, setResult] = useState("");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      setResult("");
      const res = await fetch("/api/cliente/suministros", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudieron cargar suministros");
        setLoading(false);
        return;
      }
      setItems(data.items || []);
      setPriceTier(data.price_tier || "");
      setLoading(false);
    })();
  }, []);

  // Categorías únicas (para el menú)
  const categories = useMemo(() => {
    const set = new Set();
    for (const it of items) {
      if (it?.categoria) set.add(String(it.categoria));
    }
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  // Items filtrados por categoría
  const filteredItems = useMemo(() => {
    if (category === "ALL") return items;
    return items.filter((it) => String(it.categoria || "") === category);
  }, [items, category]);

  const cartItems = useMemo(() => Object.values(cart), [cart]);

  const total = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0), 0);
  }, [cartItems]);

  const getStock = (id) => {
    const p = items.find((x) => x.id === id);
    // si viene null, lo tratamos como 0 para bloquear (mejor que permitir infinito)
    return Number(p?.stock ?? 0);
  };

  const addOne = (p) => {
    setResult("");
    setError("");
    setNotice("");

    const stock = Number(p?.stock ?? 0);
    if (!Number.isFinite(stock) || stock <= 0) {
      setNotice("Sin stock disponible para este producto.");
      return;
    }

    setCart((prev) => {
      const current = prev[p.id];
      const nextQty = (current?.qty || 0) + 1;

      if (nextQty > stock) {
        // no incrementa
        setNotice(`Stock insuficiente. Máximo disponible: ${stock}.`);
        return prev;
      }

      return {
        ...prev,
        [p.id]: { id: p.id, nombre: p.nombre, price: p.price, qty: nextQty },
      };
    });
  };

  const removeOne = (id) => {
    setResult("");
    setError("");
    setNotice("");
    setCart((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const qty = current.qty - 1;
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = { ...current, qty };
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    setResult("");
    setError("");
    setNotice("");
  };

  const createOrder = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    setResult("");

    // Validación extra por si cambiaron stocks
    for (const it of cartItems) {
      const stock = getStock(it.id);
      if (it.qty > stock) {
        setSaving(false);
        setError(`El producto "${it.nombre}" excede stock (${stock}). Ajusta tu carrito.`);
        return;
      }
    }

    const payload = {
      items: cartItems.map((it) => ({ suministro_id: it.id, qty: it.qty })),
    };

    const res = await fetch("/api/cliente/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo crear el pedido");
      return;
    }

    setResult(`Pedido creado ✅ Folio: ${data.order_id}`);
    setCart({});

    // refrescar lista para ver stock actualizado
const res2 = await fetch("/api/cliente/suministros", { cache: "no-store" });
const data2 = await res2.json().catch(() => ({}));
if (res2.ok) {
  setItems(data2.items || []);
  setPriceTier(data2.price_tier || "");
}

  };

  if (loading) {
    return <div className="text-white/70">Cargando suministros...</div>;
  }

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">Nuevo pedido</h1>
          <p className="mt-2 text-sm text-white/60">
            Precios aplicados:{" "}
            <span className="text-white/80 font-medium">{priceTier || "—"}</span>
          </p>
        </div>

        <a
          href="/portal/cliente/dashboard"
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Volver
        </a>
      </div>

      {/* Alerts */}
      {error ? (
        <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {notice}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {result}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-medium text-white/80">Suministros</div>

            {/* Filtro categoría */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-white/60">Categoría</div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 outline-none focus:border-emerald-400/30"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "General" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((p) => {
              const stock = Number(p?.stock ?? 0);
              const inCart = cart[p.id]?.qty || 0;
              const outOfStock = !Number.isFinite(stock) || stock <= 0;
              const canAdd = !outOfStock && inCart < stock;

              return (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white/90 font-medium">{p.nombre}</div>
                      <div className="mt-1 text-xs text-white/55">
                        {p.categoria ? `${p.categoria} · ` : ""}
                        {p.marca ? `${p.marca} · ` : ""}
                        {p.presentacion ? `${p.presentacion} · ` : ""}
                        {p.unidad || ""}
                      </div>

                      <div className="mt-2 text-sm text-white/80">
                        ${Number(p.price || 0).toFixed(2)}
                      </div>

                      <div className="mt-1 text-xs">
                        {outOfStock ? (
                          <span className="text-red-200/90">Sin stock</span>
                        ) : (
                          <span className="text-white/50">
                            Stock: {stock} {inCart ? `· En carrito: ${inCart}` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={!canAdd}
                      onClick={() => addOne(p)}
                      className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs text-white/90 hover:bg-emerald-400/15 disabled:opacity-60 transition"
                      title={
                        outOfStock
                          ? "Sin stock"
                          : !canAdd
                          ? "Ya llegaste al máximo disponible"
                          : "Agregar"
                      }
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrito */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-white/80">Carrito</div>
            <button
              onClick={clearCart}
              className="text-xs text-white/60 hover:text-white/80 transition"
              type="button"
            >
              Limpiar
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-sm text-white/50">Aún no agregas productos.</div>
            ) : (
              cartItems.map((it) => {
                const stock = getStock(it.id);
                const atMax = it.qty >= stock;

                return (
                  <div key={it.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-white/90 truncate">{it.nombre}</div>
                        <div className="text-xs text-white/60">
                          ${Number(it.price || 0).toFixed(2)} c/u · Stock: {stock}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeOne(it.id)}
                          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 transition"
                        >
                          -
                        </button>

                        <div className="w-8 text-center text-sm text-white/80">{it.qty}</div>

                        <button
                          disabled={atMax || stock <= 0}
                          onClick={() => {
                            const p = items.find((x) => x.id === it.id);
                            if (p) addOne(p);
                          }}
                          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 disabled:opacity-60 transition"
                          title={atMax ? "Máximo por stock" : "Agregar"}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-white/55">
                      Subtotal: ${(Number(it.price || 0) * Number(it.qty || 0)).toFixed(2)}
                    </div>

                    {it.qty > stock ? (
                      <div className="mt-2 text-xs text-red-200/90">
                        Excede stock ({stock}). Ajusta cantidades.
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Total</span>
              <span className="text-white/90 font-medium">${total.toFixed(2)}</span>
            </div>

            <button
              disabled={saving || cartItems.length === 0}
              onClick={createOrder}
              className="mt-4 w-full rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm text-white/90 hover:bg-emerald-400/15 disabled:opacity-60 transition"
            >
              {saving ? "Creando pedido..." : "Crear pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

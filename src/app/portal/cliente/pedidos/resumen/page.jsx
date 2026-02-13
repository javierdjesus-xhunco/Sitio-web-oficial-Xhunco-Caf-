"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

const LS_RESUMEN = "xhunco_nuevo_pedido";
const LS_DRAFT = "xhunco_cart_draft";
const LS_DRAFT_NO = "xhunco_cart_draft_no";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function StepTitle({ n, title, right }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm font-semibold text-gray-900">
        <span className="text-gray-500 mr-2">{n}.</span>
        {title}
      </div>
      {right ? <div className="text-xs text-gray-500">{right}</div> : null}
    </div>
  );
}

export default function ResumenPedidoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draftNo, setDraftNo] = useState(null);
  const [cart, setCart] = useState([]);
  const [priceTier, setPriceTier] = useState("");

  const total = useMemo(
    () => cart.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0), 0),
    [cart],
  );

  // entrega
  const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // pickup | delivery
  const [addressLoading, setAddressLoading] = useState(false);

  // { street, ext_number, int_number, neighborhood, municipality, state, postal_code }
  const [address, setAddress] = useState(null);

  // pago
  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash | tpv | online
  const [cardType, setCardType] = useState("credit"); // credit | debit
  const [card, setCard] = useState({
    number: "",
    exp: "",
    cvc: "",
    holder: "",
    remember: false,
  });

  const [saving, setSaving] = useState(false);

  // ✅ Modal de éxito
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(
    "Pedido exitoso. En un momento nos comunicamos con ustedes para el seguimiento.",
  );

  // Cargar: primero resumen, si no existe fallback al draft
  useEffect(() => {
    if (typeof window === "undefined") return;

    setLoading(true);
    setError("");

    const resumenRaw = localStorage.getItem(LS_RESUMEN);
    const draftRaw = localStorage.getItem(LS_DRAFT);
    const counterNo = Number(localStorage.getItem(LS_DRAFT_NO) || "0") || null;

    if (resumenRaw) {
      const data = safeParse(resumenRaw, null);
      const items = Array.isArray(data?.items) ? data.items : [];
      setCart(items);
      setPriceTier(data?.priceTier || "");
      const no = Number(data?.draftNo || 0) || counterNo;
      setDraftNo(no || null);
      setLoading(false);
      return;
    }

    if (draftRaw) {
      const data = safeParse(draftRaw, null);
      const cartObj = data?.cart && typeof data.cart === "object" ? data.cart : {};
      setCart(Object.values(cartObj || {}));
      setPriceTier("");
      const no = Number(data?.draftNo || 0) || counterNo;
      setDraftNo(no || null);
      setLoading(false);
      return;
    }

    setError("No hay carrito para resumir. Regresa y agrega productos.");
    setLoading(false);
  }, []);

  // ✅ Traer dirección del cliente cuando elige delivery
  useEffect(() => {
    const loadAddress = async () => {
      // Si vuelve a pickup, limpia
      if (deliveryMethod !== "delivery") {
        setAddress(null);
        setAddressLoading(false);
        return;
      }

      setAddressLoading(true);
      setError("");

      const res = await fetch("/api/cliente/perfil", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAddressLoading(false);
        setAddress(null);
        setError(data?.error || "No se pudo cargar la dirección del cliente.");
        return;
      }

      setAddress(data?.address || null);
      setAddressLoading(false);
    };

    loadAddress();
  }, [deliveryMethod]);

  // ✅ Volver NO borra nada
  const backToCart = () => router.push("/portal/cliente/pedidos/nuevo");

  const validateCardUI = () => {
    const num = card.number.replace(/\s+/g, "");
    if (num.length < 12) return "Número de tarjeta inválido.";
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) return "Caducidad inválida (MM/AA).";
    if (!/^\d{3,4}$/.test(card.cvc)) return "CVC inválido.";
    if (!card.holder.trim()) return "Titular requerido.";
    return "";
  };

  const confirmOrder = async () => {
    setSaving(true);
    setError("");

    if (!cart.length) {
      setSaving(false);
      setError("Tu carrito está vacío.");
      return;
    }

    if (deliveryMethod === "delivery" && !address) {
      setSaving(false);
      setError("No se encontró dirección del cliente para entrega a domicilio.");
      return;
    }

    if (paymentMethod === "online") {
      const msg = validateCardUI();
      if (msg) {
        setSaving(false);
        setError(msg);
        return;
      }
    }

    const payload = {
      items: cart.map((it) => ({ suministro_id: it.id, qty: it.qty })),
      delivery_method: deliveryMethod,
      address: deliveryMethod === "delivery" ? address : null,
      payment_method: paymentMethod,
      payment_details:
        paymentMethod === "online"
          ? {
              card_type: cardType,
              card_ui: {
                number_last4: card.number.replace(/\s+/g, "").slice(-4),
                exp: card.exp,
                holder: card.holder,
                remember: card.remember,
              },
            }
          : null,
      draft_no: draftNo || null,
    };

    const res = await fetch("/api/cliente/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo crear el pedido.");
      return;
    }

    // ✅ Modal de éxito (NO limpiamos todavía; limpiamos al darle "Entendido")
    setSuccessMsg("Pedido exitoso. En un momento nos comunicamos con ustedes para el seguimiento.");
    setSuccessOpen(true);
  };

  const handleSuccessOk = () => {
    // ✅ ahora sí limpiamos
    localStorage.removeItem(LS_RESUMEN);
    localStorage.removeItem(LS_DRAFT);

    setSuccessOpen(false);
    router.push("/portal/cliente/pedidos"); // ✅ Mis pedidos
  };

  const optionBtn = (active) =>
    [
      "w-full rounded-2xl border p-4 text-left transition",
      active ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white hover:bg-gray-50",
    ].join(" ");

  if (loading) return <div className="text-gray-600">Cargando resumen...</div>;

  return (
    <div className="max-w-[1100px] w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Resumen de tus Compras{" "}
            {draftNo ? (
              <span className="text-gray-500 text-xl align-middle">· Pedido #{draftNo}</span>
            ) : null}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Precios aplicados:{" "}
            <span className="text-gray-900 font-medium">{priceTier || "—"}</span>
          </p>
        </div>

        {/* ✅ Acciones (sin cambiar lógica) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={backToCart}
            className="rounded-full border px-5 py-2 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, backgroundColor: "white" }}
          >
            Volver
          </button>

          <button
            type="button"
            onClick={backToCart}
            className="rounded-full px-5 py-2 text-sm text-white transition"
            style={{ backgroundColor: BRAND_GREEN }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = BRAND_GREEN;
            }}
          >
            Editar carrito
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* IZQUIERDA - pasos */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-gray-200 bg-white">
            {/* Paso 1 */}
            <div className="p-5">
              <StepTitle n={1} title="Dirección de entrega" />
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={optionBtn(deliveryMethod === "pickup")}
                >
                  <div className="font-medium text-gray-900">Recolección en sucursal Xhunco</div>
                  <div className="mt-1 text-sm text-gray-600">El cliente acude a recoger el pedido.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={optionBtn(deliveryMethod === "delivery")}
                >
                  <div className="font-medium text-gray-900">Entrega a tu Negocio</div>
                  <div className="mt-1 text-sm text-gray-600">Un repartidor lo llevará a tu negocio.</div>
                </button>
              </div>

              {deliveryMethod === "delivery" ? (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-900">Dirección registrada</div>

                  {addressLoading ? (
                    <div className="mt-2 text-sm text-gray-600">Cargando dirección…</div>
                  ) : address ? (
                    <div className="mt-2 text-sm text-gray-700">
                      <div>
                        {address.street || "—"} {address.ext_number ? `#${address.ext_number}` : ""}
                        {address.int_number ? ` Int ${address.int_number}` : ""}
                      </div>
                      <div>
                        {address.neighborhood || "—"}, {address.municipality || "—"}
                      </div>
                      <div>
                        {address.state || "—"} · {address.postal_code || "—"}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-red-700">No hay dirección disponible en el perfil.</div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="border-t border-gray-200" />

            {/* Paso 2 */}
            <div className="p-5">
              <StepTitle n={2} title="Método de pago" />
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "cash", title: "Efectivo", desc: "Pago contra entrega / recolección." },
                  { key: "tpv", title: "TPV", desc: "Pago con terminal al recibir." },
                  { key: "online", title: "En línea", desc: "Pago con tarjeta." },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPaymentMethod(opt.key)}
                    className={optionBtn(paymentMethod === opt.key)}
                  >
                    <div className="font-medium text-gray-900">{opt.title}</div>
                    <div className="mt-1 text-sm text-gray-600">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {paymentMethod === "online" ? (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="text-sm font-semibold text-gray-900">Datos de pago</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Tu banco puede solicitar validación (3DS/OTP) según corresponda.
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCardType("credit")}
                      className={[
                        "rounded-full border px-4 py-2 text-sm transition",
                        cardType === "credit"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-gray-200 bg-white hover:bg-gray-50",
                      ].join(" ")}
                      style={cardType === "credit" ? { color: BRAND_GREEN } : {}}
                    >
                      Crédito
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardType("debit")}
                      className={[
                        "rounded-full border px-4 py-2 text-sm transition",
                        cardType === "debit"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-gray-200 bg-white hover:bg-gray-50",
                      ].join(" ")}
                      style={cardType === "debit" ? { color: BRAND_GREEN } : {}}
                    >
                      Débito
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-600">Número de tarjeta *</label>
                      <input
                        value={card.number}
                        onChange={(e) => setCard((p) => ({ ...p, number: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-400"
                        inputMode="numeric"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-600">Caducidad *</label>
                      <input
                        value={card.exp}
                        onChange={(e) => setCard((p) => ({ ...p, exp: e.target.value }))}
                        placeholder="MM/AA"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-600">CVC *</label>
                      <input
                        value={card.cvc}
                        onChange={(e) => setCard((p) => ({ ...p, cvc: e.target.value }))}
                        placeholder="3 dígitos"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-400"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-600">Titular de la tarjeta *</label>
                      <input
                        value={card.holder}
                        onChange={(e) => setCard((p) => ({ ...p, holder: e.target.value }))}
                        placeholder="Nombre como aparece en la tarjeta"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-400"
                      />
                    </div>

                    <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={card.remember}
                        onChange={(e) => setCard((p) => ({ ...p, remember: e.target.checked }))}
                        className="h-4 w-4"
                        style={{ accentColor: BRAND_GREEN }}
                      />
                      Recordar para mi próximo pago
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* DERECHA - Confirmar */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-gray-200 bg-white">
            <div className="p-5">
              {/* ✅ Ajuste visual: paso 3 */}
              <StepTitle
                n={3}
                title="Confirmar"
                right={cart.length ? `Resumen (${cart.length} artículos)` : "Resumen"}
              />

              {/* Resumen */}
              <div className="mt-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-sm text-gray-600">No hay productos.</div>
                ) : (
                  cart.map((it) => (
                    <div key={it.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900">{it.nombre}</div>
                          <div className="text-sm text-gray-600">
                            {formatMoney(it.price)} c/u · Cantidad: <b>{it.qty}</b>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatMoney(Number(it.price || 0) * Number(it.qty || 0))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 border-t border-gray-200" />

              {/* Totales */}
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-900">Totales</div>

                <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="text-gray-900 font-semibold">{formatMoney(total)}</span>
                  </div>
                </div>

                <button
                  disabled={saving || !cart.length}
                  onClick={confirmOrder}
                  className="mt-4 w-full rounded-full px-6 py-3 text-sm text-white disabled:opacity-60 transition"
                  style={{ backgroundColor: BRAND_GREEN }}
                  onMouseEnter={(e) => {
                    if (!saving && cart.length) e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_GREEN;
                  }}
                  type="button"
                >
                  {saving ? "Confirmando..." : "Confirmar pedido"}
                </button>

                <div className="mt-3 text-xs text-gray-500">
                  Al confirmar, se crea el pedido con entrega y método de pago seleccionado.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL ÉXITO */}
      {successOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
              <div className="text-xl font-semibold text-gray-900">Pedido confirmado</div>
              <div className="mt-3 text-sm text-gray-600">{successMsg}</div>

              <button
                type="button"
                onClick={handleSuccessOk}
                className="mt-6 w-full rounded-full px-6 py-3 text-sm text-white transition"
                style={{ backgroundColor: BRAND_GREEN }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = BRAND_GREEN;
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

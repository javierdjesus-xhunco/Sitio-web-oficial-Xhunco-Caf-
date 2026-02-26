"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
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

/** ✅ Copiar sin librerías */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** (se mantiene por compatibilidad, ya no se usa en transfer) */
function buildProductsRef(cart, maxLen = 140) {
  const parts = (cart || [])
    .filter((it) => it && Number(it.qty || 0) > 0)
    .map((it) => `${it.nombre} x${it.qty}`);

  let s = parts.join(", ");
  if (!s) return "Compra Xhunco";

  if (s.length > maxLen) s = s.slice(0, maxLen - 1).trimEnd() + "…";
  return s;
}

const LS_RESUMEN = "xhunco_nuevo_pedido";
const LS_DRAFT = "xhunco_cart_draft";
const LS_DRAFT_NO = "xhunco_cart_draft_no";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

const DISCOUNT_PER_KG = 9;

/** =========================
 * ✅ Transferencia (EDITA AQUÍ)
 * ========================= */
const TRANSFER_INFO = {
  bank_name: "MIFEL", // ej. BBVA / Banorte / Santander
  account_holder: "XHUNCO CAFE",
  clabe: "042180010034607185", // ✅ sin espacios (18 dígitos)
};

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

  // ✅ regla Barro Negro para UI
  const [barroNegroDiscount, setBarroNegroDiscount] = useState(false);

  const effectiveUnitPrice = (it) => {
    const base = Number(it?.price || 0);
    if (!barroNegroDiscount) return { base, final: base, applies: false };
    if (!isCafe1Kg(it)) return { base, final: base, applies: false };
    const final = Math.max(0, base - DISCOUNT_PER_KG);
    return { base, final, applies: true };
  };

  const total = useMemo(() => {
    return cart.reduce((acc, it) => {
      const { final } = effectiveUnitPrice(it);
      return acc + final * Number(it.qty || 0);
    }, 0);
  }, [cart, barroNegroDiscount]); // eslint-disable-line react-hooks/exhaustive-deps

  /** (se mantiene por compatibilidad, ya no se usa en transfer) */
  const productsRef = useMemo(() => buildProductsRef(cart, 140), [cart]);

  // entrega
  const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // pickup | delivery
  const [addressLoading, setAddressLoading] = useState(false);
  const [address, setAddress] = useState(null);

  // pago (solo cash | transfer)
  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash | transfer

  const [copied, setCopied] = useState("");
  const [saving, setSaving] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(
    "Pedido exitoso. En un momento nos comunicamos con ustedes para el seguimiento."
  );

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
      setBarroNegroDiscount(Boolean(data?.barroNegroDiscount));
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
      setBarroNegroDiscount(false);
      const no = Number(data?.draftNo || 0) || counterNo;
      setDraftNo(no || null);
      setLoading(false);
      return;
    }

    setError("No hay carrito para resumir. Regresa y agrega productos.");
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadAddress = async () => {
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

  const backToCart = () => router.push("/portal/cliente/pedidos/nuevo");

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

    // ✅ SOLO 3 campos + sanitizar CLABE (sin espacios)
    const transferDetails =
      paymentMethod === "transfer"
        ? {
            bank_name: TRANSFER_INFO.bank_name,
            account_holder: TRANSFER_INFO.account_holder,
            clabe: String(TRANSFER_INFO.clabe || "").replace(/\s+/g, ""),
          }
        : null;

    const payload = {
      items: cart.map((it) => ({ suministro_id: it.id, qty: it.qty })),
      delivery_method: deliveryMethod,
      address: deliveryMethod === "delivery" ? address : null,
      payment_method: paymentMethod, // cash | transfer
      payment_details: transferDetails,
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

    setSuccessMsg("Pedido exitoso. En un momento nos comunicamos con ustedes para el seguimiento.");
    setSuccessOpen(true);
  };

  const handleSuccessOk = () => {
    localStorage.removeItem(LS_RESUMEN);
    localStorage.removeItem(LS_DRAFT);

    setSuccessOpen(false);
    router.push("/portal/cliente/pedidos");
  };

  const optionBtn = (active) =>
    [
      "w-full rounded-2xl border p-4 text-left transition",
      active ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white hover:bg-gray-50",
    ].join(" ");

  if (loading) return <div className="text-gray-600">Cargando resumen...</div>;

  return (
    <div className="w-full max-w-none min-w-0">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight">Resumen de tus Compras</h1>
          <p className="mt-2 text-sm text-gray-600">
            {barroNegroDiscount ? (
              <span className="ml-2 text-xs text-emerald-700">· Descuento Barro Negro activo (-$9 en café 1kg)</span>
            ) : null}
          </p>
        </div>

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

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
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
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "cash", title: "Efectivo", desc: "Pago contra entrega / recolección." },
                  { key: "transfer", title: "Transferencia", desc: "Recibe los datos para transferir." },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(opt.key);
                      setCopied("");
                    }}
                    className={optionBtn(paymentMethod === opt.key)}
                  >
                    <div className="font-medium text-gray-900">{opt.title}</div>
                    <div className="mt-1 text-sm text-gray-600">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {paymentMethod === "transfer" ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-sm font-semibold text-gray-900">Datos para transferencia</div>

                  <div className="mt-3 space-y-2 text-sm text-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Banco</span>
                      <span className="font-medium">{TRANSFER_INFO.bank_name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Beneficiario</span>
                      <span className="font-medium">{TRANSFER_INFO.account_holder}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">CLABE</span>
                      <span className="font-mono font-semibold">
                        {String(TRANSFER_INFO.clabe || "").replace(/\s+/g, "")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      className="rounded-full border px-4 py-2 text-sm bg-white hover:bg-gray-50 transition"
                      onClick={async () => {
                        const text = [
                          `Banco: ${TRANSFER_INFO.bank_name}`,
                          `Beneficiario: ${TRANSFER_INFO.account_holder}`,
                          `CLABE: ${String(TRANSFER_INFO.clabe || "").replace(/\s+/g, "")}`,
                        ].join("\n");

                        const ok = await copyToClipboard(text);
                        setCopied(ok ? "Datos copiados." : "No se pudo copiar. Copia manualmente.");
                        setTimeout(() => setCopied(""), 2000);
                      }}
                    >
                      Copiar datos
                    </button>
                  </div>

                  {copied ? <div className="mt-2 text-xs text-emerald-700">{copied}</div> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-gray-200 bg-white">
            <div className="p-5">
              <StepTitle n={3} title="Confirmar" right={cart.length ? `Resumen (${cart.length} artículos)` : "Resumen"} />

              <div className="mt-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-sm text-gray-600">No hay productos.</div>
                ) : (
                  cart.map((it) => {
                    const { base, final, applies } = effectiveUnitPrice(it);
                    const lineTotal = final * Number(it.qty || 0);

                    return (
                      <div key={it.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">{it.nombre}</div>
                            <div className="text-sm text-gray-600">
                              {applies ? (
                                <>
                                  <span className="line-through text-gray-500">{formatMoney(base)}</span>{" "}
                                  <span className="text-emerald-700 font-semibold">{formatMoney(final)}</span>{" "}
                                  <span className="text-emerald-700">(-$9 Barro Negro)</span>
                                </>
                              ) : (
                                <>{formatMoney(base)}</>
                              )}{" "}
                              c/u · Cantidad: <b>{it.qty}</b>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{formatMoney(lineTotal)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-6 border-t border-gray-200" />

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
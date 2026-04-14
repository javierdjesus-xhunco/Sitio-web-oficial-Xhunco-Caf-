"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";

const LS_KEY = "suministrosCarrito";
const PLACEHOLDER = "/suministros/placeholder.svg";
const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

type CartItem = {
  id?: string | null;
  suministro_id?: string | null;
  nombre: string;
  categoria?: string;
  precio?: number;
  cantidad?: number;
  imagen?: string;
  sku?: string;
};

type FormState = {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  notas: string;
  tipoTarjeta: "credito" | "debito";
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
};

type ErrorState = Partial<Record<keyof FormState, string>>;

type StatusMessage = {
  type: "success" | "error" | "info";
  text: string;
};

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<Record<string, CartItem>>({});
  const [mounted, setMounted] = useState(false);
  const [submitIntent, setSubmitIntent] = useState(false);
  const [statusMsg, setStatusMsg] = useState<StatusMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    notas: "",
    tipoTarjeta: "credito",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const guardado = window.localStorage.getItem(LS_KEY);
    if (!guardado) return;

    try {
      setCarrito(JSON.parse(guardado));
    } catch (error) {
      console.error("No se pudo leer el carrito guardado.", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_KEY, JSON.stringify(carrito));
  }, [carrito]);

  const items = useMemo(() => Object.entries(carrito), [carrito]);

  const totalArticulos = useMemo(
    () =>
      items.reduce((total, [, item]) => total + Number(item.cantidad ?? 0), 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, [, item]) =>
          total + Number(item.cantidad ?? 0) * Number(item.precio ?? 0),
        0,
      ),
    [items],
  );

  const totalPrecio = subtotal;

  const actualizarCantidad = (key: string, delta: number) => {
    setCarrito((prev) => {
      const item = prev[key];
      if (!item) return prev;

      const nuevaCantidad = Math.max(0, Number(item.cantidad ?? 0) + delta);

      if (nuevaCantidad === 0) {
        const { [key]: _, ...resto } = prev;
        return resto;
      }

      return {
        ...prev,
        [key]: {
          ...item,
          cantidad: nuevaCantidad,
        },
      };
    });
  };

  const eliminarProducto = (key: string) => {
    setCarrito((prev) => {
      const { [key]: _, ...resto } = prev;
      return resto;
    });
  };

  const handleBlur = (name: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const cleaned = value.replace(/\D/g, "").slice(0, 16);
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
      setForm((prev) => ({ ...prev, cardNumber: formatted }));
      return;
    }

    if (name === "cardExpiry") {
      const cleaned = value.replace(/\D/g, "").slice(0, 4);
      let formatted = cleaned;
      if (cleaned.length >= 3) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      }
      setForm((prev) => ({ ...prev, cardExpiry: formatted }));
      return;
    }

    if (name === "cardCvc") {
      const cleaned = value.replace(/\D/g, "").slice(0, 4);
      setForm((prev) => ({ ...prev, cardCvc: cleaned }));
      return;
    }

    if (name === "telefono") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, telefono: cleaned }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (values: FormState): ErrorState => {
    const errors: ErrorState = {};

    if (!values.nombre.trim()) {
      errors.nombre = "El nombre completo es obligatorio.";
    }

    if (!values.email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = "Ingresa un correo electrónico válido.";
    }

    if (!values.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio.";
    } else if (!/^\d{10}$/.test(values.telefono)) {
      errors.telefono = "El teléfono debe contener exactamente 10 dígitos.";
    }

    if (!values.direccion.trim()) {
      errors.direccion = "La dirección es obligatoria.";
    }

    if (!values.ciudad.trim()) {
      errors.ciudad = "La ciudad es obligatoria.";
    }

    if (!values.cardName.trim()) {
      errors.cardName = "El nombre en la tarjeta es obligatorio.";
    }

    const cardDigits = values.cardNumber.replace(/\D/g, "");
    if (!cardDigits) {
      errors.cardNumber = "El número de tarjeta es obligatorio.";
    } else if (cardDigits.length < 16) {
      errors.cardNumber = "El número de tarjeta debe tener 16 dígitos.";
    }

    if (!values.cardExpiry.trim()) {
      errors.cardExpiry = "La fecha de vencimiento es obligatoria.";
    } else {
      const match = values.cardExpiry.match(/^(\d{2})\/(\d{2})$/);
      if (!match) {
        errors.cardExpiry = "Usa el formato MM/AA.";
      } else {
        const month = Number(match[1]);
        if (month < 1 || month > 12) {
          errors.cardExpiry = "Mes inválido.";
        }
      }
    }

    if (!values.cardCvc.trim()) {
      errors.cardCvc = "El CVC es obligatorio.";
    } else if (values.cardCvc.length < 3) {
      errors.cardCvc = "El CVC no es válido.";
    }

    return errors;
  };

  const errors = useMemo(() => validateForm(form), [form]);
  const isFormValid = Object.keys(errors).length === 0;
  const canSubmit = items.length > 0 && isFormValid && !isSubmitting;

  const visibleError = (field: keyof FormState) =>
    (touched[field] || submitIntent) && errors[field] ? errors[field] : "";

  const markAllTouched = () => {
    setTouched({
      nombre: true,
      empresa: true,
      email: true,
      telefono: true,
      direccion: true,
      ciudad: true,
      notas: true,
      tipoTarjeta: true,
      cardName: true,
      cardNumber: true,
      cardExpiry: true,
      cardCvc: true,
    });
  };

  const finalizarCompra = async () => {
    setSubmitIntent(true);
    setStatusMsg(null);

    if (items.length === 0) {
      setStatusMsg({
        type: "error",
        text: "Tu carrito está vacío. Agrega productos antes de finalizar la compra.",
      });
      return;
    }

    if (!isFormValid) {
      markAllTouched();
      setStatusMsg({
        type: "error",
        text: "Completa correctamente los datos requeridos para continuar.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        cliente: {
          nombre: form.nombre,
          empresa: form.empresa,
          email: form.email,
          telefono: form.telefono,
          direccion: form.direccion,
          ciudad: form.ciudad,
          notas: form.notas,
        },
        pago: {
          metodo: "card",
          tipoTarjeta: form.tipoTarjeta,
          titular: form.cardName,
          terminacion: form.cardNumber.replace(/\D/g, "").slice(-4),
          expira: form.cardExpiry,
        },
        items: items.map(([key, item]) => ({
          key,
          suministro_id: item.suministro_id ?? item.id ?? null,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          imagen: item.imagen,
          categoria: item.categoria,
          sku: item.sku,
        })),
      };

      const res = await fetch("/api/checkout-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMsg({
          type: "error",
          text: data?.error || "No se pudo crear el pedido.",
        });
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(LS_KEY);
      }

      setCarrito({});
      setStatusMsg({
        type: "success",
        text: `Pedido creado correctamente. Número de pedido: ${data.order.order_no}`,
      });

      setForm({
        nombre: "",
        empresa: "",
        email: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        notas: "",
        tipoTarjeta: "credito",
        cardName: "",
        cardNumber: "",
        cardExpiry: "",
        cardCvc: "",
      });

      setTouched({});
      setSubmitIntent(false);
    } catch (error) {
      console.error(error);
      setStatusMsg({
        type: "error",
        text: "Ocurrió un error inesperado al crear el pedido.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f4f7f6_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div
          className={`max-w-3xl transform transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#31572c]/15 bg-[#31572c]/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#31572c]">
            <Lock className="h-3.5 w-3.5" />
            Checkout seguro
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Resumen de tus compras
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Completa tus datos, selecciona el tipo de tarjeta y revisa tu pedido
            en una experiencia más limpia, profesional y lista para producción.
          </p>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.65fr_1fr]">
          <div className="space-y-8">
            <section
              className={`overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-700 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              }`}
            >
              <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: BRAND_GREEN }}
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Artículos
                    </h2>
                    <p className="text-sm text-slate-500">
                      Ajusta cantidades y revisa tus productos antes del pago.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8">
                {items.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <ShoppingBag className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-800">
                      Aún no agregas productos al carrito
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Cuando agregues artículos, aquí verás el resumen completo.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {items.map(([key, item], idx) => {
                      const cantidad = Number(item.cantidad ?? 0);
                      const precio = Number(item.precio ?? 0);
                      const totalLinea = cantidad * precio;

                      return (
                        <li
                          key={key}
                          className="group rounded-3xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-5"
                          style={{
                            transitionDelay: `${idx * 30}ms`,
                          }}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                                <img
                                  src={item.imagen || PLACEHOLDER}
                                  alt={item.nombre}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.src = PLACEHOLDER;
                                  }}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                  {item.categoria || "Producto"}
                                </p>
                                <p className="truncate text-lg font-semibold text-slate-950">
                                  {item.nombre}
                                </p>
                                {item.sku ? (
                                  <p className="mt-1 text-sm text-slate-500">
                                    SKU: {item.sku}
                                  </p>
                                ) : null}
                                <p className="mt-1 text-sm text-slate-600">
                                  ${precio.toFixed(2)} MXN c/u
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(key, -1)}
                                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-white hover:shadow-sm"
                                  aria-label={`Disminuir ${item.nombre}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>

                                <span className="w-12 text-center text-sm font-semibold text-slate-900">
                                  {cantidad}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(key, 1)}
                                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-white hover:shadow-sm"
                                  aria-label={`Aumentar ${item.nombre}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="min-w-[125px] text-left sm:text-right">
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                  Total
                                </p>
                                <p className="text-base font-semibold text-slate-950">
                                  ${totalLinea.toFixed(2)} MXN
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => eliminarProducto(key)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section
              className={`overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-700 delay-100 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              }`}
            >
              <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: BRAND_GREEN }}
                  >
                    <User className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Datos del cliente
                    </h2>
                    <p className="text-sm text-slate-500">
                      Completa la información obligatoria para procesar el
                      pedido.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
                <Field
                  label="Nombre completo"
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={() => handleBlur("nombre")}
                  placeholder="Tu nombre completo"
                  icon={<User className="h-4 w-4" />}
                  error={visibleError("nombre")}
                />

                <Field
                  label="Empresa"
                  name="empresa"
                  value={form.empresa}
                  onChange={handleChange}
                  onBlur={() => handleBlur("empresa")}
                  placeholder="Nombre del negocio o empresa"
                  icon={<Building2 className="h-4 w-4" />}
                  error={visibleError("empresa")}
                />

                <Field
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="correo@empresa.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={visibleError("email")}
                />

                <Field
                  label="Teléfono"
                  name="telefono"
                  required
                  value={form.telefono}
                  onChange={handleChange}
                  onBlur={() => handleBlur("telefono")}
                  placeholder="2461234567"
                  icon={<Phone className="h-4 w-4" />}
                  error={visibleError("telefono")}
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Dirección"
                    name="direccion"
                    required
                    value={form.direccion}
                    onChange={handleChange}
                    onBlur={() => handleBlur("direccion")}
                    placeholder="Calle, número, colonia"
                    icon={<MapPin className="h-4 w-4" />}
                    error={visibleError("direccion")}
                  />
                </div>

                <Field
                  label="Ciudad"
                  name="ciudad"
                  required
                  value={form.ciudad}
                  onChange={handleChange}
                  onBlur={() => handleBlur("ciudad")}
                  placeholder="Ciudad"
                  icon={<MapPin className="h-4 w-4" />}
                  error={visibleError("ciudad")}
                />

                <div className="sm:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    Notas adicionales
                  </label>
                  <textarea
                    name="notas"
                    value={form.notas}
                    onChange={handleChange}
                    onBlur={() => handleBlur("notas")}
                    rows={4}
                    placeholder="Indicaciones especiales para el pedido, entrega o facturación."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>
            </section>

            <section
              className={`overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-700 delay-200 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              }`}
            >
              <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: BRAND_GREEN }}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Método de pago
                    </h2>
                    <p className="text-sm text-slate-500">
                      Selecciona el tipo de tarjeta y captura los datos de pago.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CardSelector
                    title="Tarjeta de crédito"
                    description="Ideal para pagos empresariales y compras a meses."
                    active={form.tipoTarjeta === "credito"}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, tipoTarjeta: "credito" }))
                    }
                  />

                  <CardSelector
                    title="Tarjeta de débito"
                    description="Pago directo desde la cuenta del cliente."
                    active={form.tipoTarjeta === "debito"}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, tipoTarjeta: "debito" }))
                    }
                  />
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] p-5 shadow-inner">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <ShieldCheck className="h-4 w-4 text-[#31572c]" />
                      Captura segura de tarjeta
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      <Lock className="h-3.5 w-3.5" />
                      {form.tipoTarjeta === "credito"
                        ? "Crédito seleccionado"
                        : "Débito seleccionado"}
                    </div>
                  </div>

                  <div className="mb-6 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#31572c_100%)] p-6 text-white shadow-[0_20px_40px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                          Xhunco Pay
                        </p>
                        <p className="mt-3 text-sm text-white/70">
                          {form.tipoTarjeta === "credito"
                            ? "Tarjeta de crédito"
                            : "Tarjeta de débito"}
                        </p>
                      </div>
                      <CreditCard className="h-6 w-6 text-white/90" />
                    </div>

                    <div className="mt-8 font-mono text-xl tracking-[0.25em] text-white/95 sm:text-2xl">
                      {form.cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="mt-8 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                          Titular
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-white/95">
                          {form.cardName || "NOMBRE DEL TITULAR"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                          Expira
                        </p>
                        <p className="mt-1 text-sm font-medium text-white/95">
                          {form.cardExpiry || "MM/AA"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field
                        label="Nombre en la tarjeta"
                        name="cardName"
                        required
                        value={form.cardName}
                        onChange={handleChange}
                        onBlur={() => handleBlur("cardName")}
                        placeholder="Nombre como aparece en la tarjeta"
                        icon={<User className="h-4 w-4" />}
                        error={visibleError("cardName")}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Field
                        label="Número de tarjeta"
                        name="cardNumber"
                        required
                        value={form.cardNumber}
                        onChange={handleChange}
                        onBlur={() => handleBlur("cardNumber")}
                        placeholder="1234 5678 9012 3456"
                        icon={<CreditCard className="h-4 w-4" />}
                        error={visibleError("cardNumber")}
                      />
                    </div>

                    <Field
                      label="Vencimiento"
                      name="cardExpiry"
                      required
                      value={form.cardExpiry}
                      onChange={handleChange}
                      onBlur={() => handleBlur("cardExpiry")}
                      placeholder="MM/AA"
                      icon={<BadgeCheck className="h-4 w-4" />}
                      error={visibleError("cardExpiry")}
                    />

                    <Field
                      label="CVC"
                      name="cardCvc"
                      required
                      value={form.cardCvc}
                      onChange={handleChange}
                      onBlur={() => handleBlur("cardCvc")}
                      placeholder="123"
                      icon={<ShieldCheck className="h-4 w-4" />}
                      error={visibleError("cardCvc")}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside
            className={`h-fit xl:sticky xl:top-24 transition-all duration-700 delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-slate-950">
                  Resumen del pedido
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Vista consolidada antes de finalizar.
                </p>
              </div>

              <div className="px-6 py-6">
                {statusMsg ? (
                  <StatusAlert type={statusMsg.type} text={statusMsg.text} />
                ) : null}

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Artículos</span>
                    <span className="font-semibold text-slate-950">
                      {totalArticulos}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-950">
                      ${subtotal.toFixed(2)} MXN
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-slate-950">
                        Total
                      </span>
                      <span className="text-lg font-semibold text-slate-950">
                        ${totalPrecio.toFixed(2)} MXN
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={finalizarCompra}
                  disabled={!canSubmit}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-[#9caf99] disabled:text-white disabled:shadow-none"
                  style={{
                    backgroundColor: canSubmit ? BRAND_GREEN : undefined,
                    boxShadow: canSubmit
                      ? "0 12px 30px rgba(49, 87, 44, 0.22)"
                      : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!canSubmit) return;
                    e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                  }}
                  onMouseLeave={(e) => {
                    if (!canSubmit) return;
                    e.currentTarget.style.backgroundColor = BRAND_GREEN;
                  }}
                >
                  {isSubmitting ? "Procesando..." : "Finalizar compra"}
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="mt-4 rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fafafa_0%,#f8fafc_100%)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#31572c]/10 text-[#31572c]">
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Checkout protegido
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Los campos del cliente y de pago son obligatorios y se
                        validan antes de continuar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Validación en tiempo real
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        El botón se habilita únicamente cuando el carrito tiene
                        productos y todos los campos requeridos están correctos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-dashed border-slate-300 bg-white p-6">
                  <img
                    src="/pagos/spinnegocios.png"
                    alt="Logo de la institución financiera"
                    className="mx-auto h-16 w-auto object-contain sm:h-20"
                    onError={(event) => {
                      event.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  icon,
  error,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  const hasError = Boolean(error);

  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {required ? <span className="text-red-500">*</span> : null}
      </label>

      <div className="relative">
        {icon ? (
          <div
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              hasError ? "text-red-400" : "text-slate-400"
            }`}
          >
            {icon}
          </div>
        ) : null}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-2xl bg-white py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 ${
            icon ? "pl-11 pr-4" : "px-4"
          } ${
            hasError
              ? "border border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
              : "border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          }`}
        />
      </div>

      <div
        className={`grid transition-all duration-200 ${
          hasError
            ? "mt-2 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        </div>
      </div>
    </div>
  );
}

function CardSelector({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left transition-all duration-200 ${
        active
          ? "border-[#31572c] bg-[#31572c]/[0.06] shadow-[0_10px_30px_rgba(49,87,44,0.10)]"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              active
                ? "bg-[#31572c] text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <CreditCard className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-slate-950">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {active ? (
          <BadgeCheck className="h-5 w-5 shrink-0 text-[#31572c]" />
        ) : null}
      </div>
    </button>
  );
}

function StatusAlert({
  type,
  text,
}: {
  type: "success" | "error" | "info";
  text: string;
}) {
  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : type === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-slate-200 bg-slate-50 text-slate-800";

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
        ? AlertCircle
        : ShieldCheck;

  return (
    <div className={`mb-5 rounded-2xl border p-4 ${styles}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
        <p className="text-sm leading-6">{text}</p>
      </div>
    </div>
  );
}
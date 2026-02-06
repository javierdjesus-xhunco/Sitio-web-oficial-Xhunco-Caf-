"use client";

import { useEffect, useMemo, useState } from "react";

const initialForm = {
  // auth
  email: "",
  password: "",

  // responsable (profiles)
  first_name: "",
  middle_name: "",
  last_name_paterno: "",
  last_name_materno: "",
  phone: "",

  // cliente (clients)
  business_name: "",
  street: "",
  ext_number: "",
  int_number: "",
  neighborhood: "",
  municipality: "",
  state: "",
  postal_code: "",
  price_tier: "precio_publico",
};

export default function NuevoClientePage() {
  const [role, setRole] = useState("cliente");
  const [form, setForm] = useState(initialForm);

  const isCliente = role === "cliente";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ type: "", message: "" });

  // Si cambias a admin/super_admin, limpiamos campos de cliente para que no queden en memoria
  useEffect(() => {
    if (!isCliente) {
      setForm((p) => ({
        ...p,
        business_name: "",
        street: "",
        ext_number: "",
        int_number: "",
        neighborhood: "",
        municipality: "",
        state: "",
        postal_code: "",
        price_tier: "precio_publico",
      }));
    }
  }, [isCliente]);

  const requiredForSubmit = useMemo(() => {
    const base = ["email", "password", "first_name", "last_name_paterno", "last_name_materno"];
    if (isCliente) base.push("business_name");
    return base;
  }, [isCliente]);

  const onChange = (e) => {
    setResult({ type: "", message: "" });
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    for (const key of requiredForSubmit) {
      if (!String(form[key] ?? "").trim()) return `Falta: ${key}`;
    }
    return null;
  };

  const resetAll = () => {
    setForm(initialForm);
    setRole("cliente");
    setResult({ type: "", message: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setResult({ type: "", message: "" });

    const err = validate();
    if (err) {
      setResult({ type: "error", message: err });
      return;
    }

    setLoading(true);

    // payload final al endpoint
    const payload = {
      role,
      email: form.email.trim(),
      password: form.password,
      first_name: form.first_name.trim(),
      middle_name: form.middle_name.trim() || null,
      last_name_paterno: form.last_name_paterno.trim(),
      last_name_materno: form.last_name_materno.trim(),
      phone: form.phone.trim() || null,
    };

    if (isCliente) {
      Object.assign(payload, {
        business_name: form.business_name.trim(),
        street: form.street.trim() || null,
        ext_number: form.ext_number.trim() || null,
        int_number: form.int_number.trim() || null,
        neighborhood: form.neighborhood.trim() || null,
        municipality: form.municipality.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postal_code.trim() || null,
        price_tier: form.price_tier,
      });
    }

    const res = await fetch("/api/superadmin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setResult({ type: "error", message: data?.error || "Error al crear usuario" });
      return;
    }

    setResult({ type: "ok", message: `Creado ✅ user_id: ${data.user_id}` });

    // ✅ Limpia TODO automáticamente
    setForm(initialForm);
    setRole("cliente");
  };

  return (
    <div className="max-w-[1100px]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_80px_rgba(255,255,255,0.06)]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">
              {role === "cliente" ? "Alta de cliente" : "Alta de usuario"}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Crea cuentas y asigna roles. La contraseña la define el super administrador.
            </p>
          </div>

          <a
            href="/portal/super-admin/clientes"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Volver
          </a>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-6">
          {/* Rol */}
          <Section title="Rol">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Tipo de rol">
                <select
                  value={role}
                  onChange={(e) => {
                    setResult({ type: "", message: "" });
                    setRole(e.target.value);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Administrador</option>
                </select>
              </Field>
              <HintCard />
            </div>
          </Section>

          {/* Acceso */}
          <Section title="Acceso">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Correo electrónico *">
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                  placeholder="correo@dominio.com"
                  autoComplete="off"
                />
              </Field>

              <Field label="Contraseña (definida por superadmin) *">
                <input
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  type="password"
                />
              </Field>
            </div>
          </Section>

          {/* Responsable */}
          <Section title="Responsable">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre *">
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                />
              </Field>

              <Field label="Segundo nombre (opcional)">
                <input
                  name="middle_name"
                  value={form.middle_name}
                  onChange={onChange}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                />
              </Field>

              <Field label="Apellido paterno *">
                <input
                  name="last_name_paterno"
                  value={form.last_name_paterno}
                  onChange={onChange}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                />
              </Field>

              <Field label="Apellido materno *">
                <input
                  name="last_name_materno"
                  value={form.last_name_materno}
                  onChange={onChange}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                />
              </Field>

              <Field label="Teléfono">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                />
              </Field>
            </div>
          </Section>

          {/* Negocio y dirección (solo cliente) */}
          {isCliente && (
            <Section title="Negocio y dirección">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nombre del negocio *">
                  <input
                    name="business_name"
                    value={form.business_name}
                    onChange={onChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                  />
                </Field>

                <Field label="Tipo de precio *">
                  <select
                    name="price_tier"
                    value={form.price_tier}
                    onChange={onChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                  >
                    <option value="precio_web">Precio web</option>
                    <option value="precio_publico">Precio público</option>
                    <option value="precio_medio">Precio medio</option>
                    <option value="precio_mayoreo">Precio mayoreo</option>
                  </select>
                </Field>

                <Field label="Calle">
                  <input
                    name="street"
                    value={form.street}
                    onChange={onChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="No. exterior">
                    <input
                      name="ext_number"
                      value={form.ext_number}
                      onChange={onChange}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                    />
                  </Field>

                  <Field label="No. interior">
                    <input
                      name="int_number"
                      value={form.int_number}
                      onChange={onChange}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                    />
                  </Field>
                </div>

                <Field label="Colonia">
                  <input
                    name="neighborhood"
                    value={form.neighborhood}
                    onChange={onChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                  />
                </Field>

                <Field label="Municipio">
                  <input
                    name="municipality"
                    value={form.municipality}
                    onChange={onChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                  />
                </Field>

                <Field label="Estado">
                  <input
                    name="state"
                    value={form.state}
                    onChange={onChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                  />
                </Field>

                <Field label="Código postal">
                  <input
                    name="postal_code"
                    value={form.postal_code}
                    onChange={onChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-emerald-400/30"
                    placeholder="Ej. 90000"
                  />
                </Field>
              </div>
            </Section>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm text-white/90 hover:bg-emerald-400/15 disabled:opacity-60 transition"
            >
              {loading ? "Creando..." : "Crear"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={resetAll}
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60 transition"
            >
              Limpiar
            </button>

            {result.message && (
              <div
                className={[
                  "text-sm px-4 py-2 rounded-xl border",
                  result.type === "ok"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-red-400/30 bg-red-400/10 text-red-200",
                ].join(" ")}
              >
                {result.message}
              </div>
            )}
          </div>

          <div className="text-xs text-white/50">
            Requeridos: email, password, nombre, apellidos{isCliente ? ", nombre del negocio" : ""}.
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-sm font-medium text-white/80">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs text-white/60">{label}</div>
      {children}
    </label>
  );
}

function HintCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
      <div className="text-white/80 font-medium">Regla</div>
      <div className="mt-2">
        Si el rol es <span className="text-white/80">Administrador</span> o{" "}
        <span className="text-white/80">Super Administrador</span>, se omite el negocio y no se crea
        registro en <span className="text-white/80">clients</span>.
      </div>
    </div>
  );
}

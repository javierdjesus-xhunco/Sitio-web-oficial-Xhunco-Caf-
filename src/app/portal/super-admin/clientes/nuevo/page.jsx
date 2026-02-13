"use client";

import { useEffect, useMemo, useState } from "react";

const BRAND_GREEN = "#31572c";        // Hunter Green (botones)
const INPUT_BG = "#e9f4ea";           // verde claro inputs
const INPUT_BORDER = "#9bc79f";       // borde verde suave

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

  // ✅ logo
  const [logoFile, setLogoFile] = useState(null);

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
      setLogoFile(null);
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

  // ✅ handler logo
  const onLogoChange = (e) => {
    setResult({ type: "", message: "" });
    const f = e.target.files?.[0] || null;
    setLogoFile(f);
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
    setLogoFile(null);
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

    // ✅ Enviar como FormData (para poder mandar archivo)
    const fd = new FormData();

    // auth
    fd.append("role", role);
    fd.append("email", form.email.trim());
    fd.append("password", form.password);

    // responsable (profiles)
    fd.append("first_name", form.first_name.trim());
    fd.append("middle_name", form.middle_name.trim() || "");
    fd.append("last_name_paterno", form.last_name_paterno.trim());
    fd.append("last_name_materno", form.last_name_materno.trim());
    fd.append("phone", form.phone.trim() || "");

    // cliente (clients)
    if (isCliente) {
      fd.append("business_name", form.business_name.trim());
      fd.append("street", form.street.trim() || "");
      fd.append("ext_number", form.ext_number.trim() || "");
      fd.append("int_number", form.int_number.trim() || "");
      fd.append("neighborhood", form.neighborhood.trim() || "");
      fd.append("municipality", form.municipality.trim() || "");
      fd.append("state", form.state.trim() || "");
      fd.append("postal_code", form.postal_code.trim() || "");
      fd.append("price_tier", form.price_tier);

      if (logoFile) fd.append("logo", logoFile);
    }

    const res = await fetch("/api/superadmin/users", {
      method: "POST",
      body: fd, // ⚠️ NO headers
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
    setLogoFile(null);
  };

  return (
    <div className="max-w-[1100px] bg-white text-black">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_0_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-black">
              {role === "cliente" ? "Alta de cliente" : "Alta de usuario"}
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Crea cuentas y asigna roles. La contraseña la define el super administrador.
            </p>
          </div>

          <a
            href="/portal/super-admin/clientes"
            className="rounded-full border border-black/15 bg-white px-5 py-2 text-sm text-black/80 hover:bg-black/5 transition"
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
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
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
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                  placeholder="correo@dominio.com"
                  autoComplete="off"
                />
              </Field>

              <Field label="Contraseña (definida por superadmin) *">
                <input
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
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
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                />
              </Field>

              <Field label="Segundo nombre (opcional)">
                <input
                  name="middle_name"
                  value={form.middle_name}
                  onChange={onChange}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                />
              </Field>

              <Field label="Apellido paterno *">
                <input
                  name="last_name_paterno"
                  value={form.last_name_paterno}
                  onChange={onChange}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                />
              </Field>

              <Field label="Apellido materno *">
                <input
                  name="last_name_materno"
                  value={form.last_name_materno}
                  onChange={onChange}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                />
              </Field>

              <Field label="Teléfono">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
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
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                  />
                </Field>

                {/* ✅ NUEVO: Logo */}
                <Field label="Logo del negocio (PNG/JPG/WebP)">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onLogoChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                  />
                  {logoFile?.name ? (
                    <div className="mt-2 text-xs text-black/60">
                      Archivo: <span className="font-medium text-black">{logoFile.name}</span>
                    </div>
                  ) : null}
                </Field>

                <Field label="Tipo de precio *">
                  <select
                    name="price_tier"
                    value={form.price_tier}
                    onChange={onChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
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
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="No. exterior">
                    <input
                      name="ext_number"
                      value={form.ext_number}
                      onChange={onChange}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                    />
                  </Field>

                  <Field label="No. interior">
                    <input
                      name="int_number"
                      value={form.int_number}
                      onChange={onChange}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                    />
                  </Field>
                </div>

                <Field label="Colonia">
                  <input
                    name="neighborhood"
                    value={form.neighborhood}
                    onChange={onChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                  />
                </Field>

                <Field label="Municipio">
                  <input
                    name="municipality"
                    value={form.municipality}
                    onChange={onChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                  />
                </Field>

                <Field label="Estado">
                  <input
                    name="state"
                    value={form.state}
                    onChange={onChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
                  />
                </Field>

                <Field label="Código postal">
                  <input
                    name="postal_code"
                    value={form.postal_code}
                    onChange={onChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: INPUT_BORDER, backgroundColor: INPUT_BG, color: "#000" }}
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
              className="rounded-full px-6 py-3 text-sm text-white disabled:opacity-60 transition"
              style={{ backgroundColor: BRAND_GREEN, border: `1px solid ${BRAND_GREEN}` }}
            >
              {loading ? "Creando..." : "Crear"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={resetAll}
              className="rounded-full border px-6 py-3 text-sm disabled:opacity-60 transition"
              style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, backgroundColor: "white" }}
            >
              Limpiar
            </button>

            {result.message && (
              <div
                className={[
                  "text-sm px-4 py-2 rounded-xl border",
                  result.type === "ok" ? "text-green-800" : "text-red-700",
                ].join(" ")}
                style={{
                  borderColor: result.type === "ok" ? "#b7d7bb" : "#f3b4b4",
                  backgroundColor: result.type === "ok" ? "#edf7ee" : "#fdecec",
                }}
              >
                {result.message}
              </div>
            )}
          </div>

          <div className="text-xs text-black/60">
            Requeridos: email, password, nombre, apellidos{isCliente ? ", nombre del negocio" : ""}.
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6">
      <div className="text-sm font-medium text-black/80">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs text-black/70">{label}</div>
      {children}
    </label>
  );
}

function HintCard() {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/5 p-4 text-xs text-black/70">
      <div className="text-black/80 font-medium">Regla</div>
      <div className="mt-2">
        Si el rol es <span className="text-black/90">Administrador</span> o{" "}
        <span className="text-black/90">Super Administrador</span>, se omite el negocio y no se crea
        registro en <span className="text-black/90">clients</span>.
      </div>
    </div>
  );
}

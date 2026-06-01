"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Loader2,
  AlertCircle,
  Store,
  ShieldCheck,
  MapPinned,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

function EmptyValue() {
  return <span className="text-gray-400">No registrado</span>;
}

function InfoCard({ icon: Icon, label, value, className = "" }) {
  return (
    <div
      className={`group rounded-xl border border-[#eadfce] bg-white/90 p-3 shadow-[0_6px_18px_rgba(49,87,44,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#31572c]/25 hover:shadow-[0_10px_24px_rgba(49,87,44,0.08)] sm:p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#31572c]/10 text-[#31572c] transition group-hover:bg-[#31572c] group-hover:text-white">
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
            {label}
          </p>

          <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-gray-950 sm:text-sm">
            {value ? value : <EmptyValue />}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eadfce]/80 py-2.5 last:border-b-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="max-w-[60%] text-right text-sm font-semibold text-gray-900">
        {value || <EmptyValue />}
      </p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "No disponible";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function ClientePerfilPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch("/api/cliente/perfil", {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "No se pudo cargar el perfil");
        }

        if (alive) {
          setData(json);
        }
      } catch (error) {
        if (alive) {
          setErrorMsg(error.message || "Error al cargar el perfil");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      alive = false;
    };
  }, []);

  function handlePasswordFieldChange(e) {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handlePasswordChange(e) {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Ingresa tu contraseña actual.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError("La nueva contraseña debe ser diferente a la actual.");
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await fetch("/api/cliente/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo cambiar la contraseña.");
      }

      setPasswordMessage("Contraseña actualizada correctamente.");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setPasswordError(error.message || "No se pudo cambiar la contraseña.");
    } finally {
      setPasswordLoading(false);
    }
  }

  const profile = data?.profile;
  const client = data?.client;
  const address = data?.address;

  const ownerName = client?.owner_name || profile?.full_name || "";

  const initials = useMemo(() => {
    const name = client?.business_name || ownerName || "Xhunco";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }, [client?.business_name, ownerName]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-4 py-5 sm:px-5 lg:px-6 lg:py-7">
        <div className="mx-auto flex min-h-[55vh] max-w-6xl items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-[#eadfce] bg-white p-7 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#31572c]/10">
              <Loader2 className="h-6 w-6 animate-spin text-[#31572c]" />
            </div>

            <div>
              <h1 className="text-base font-bold text-gray-950">
                Cargando perfil
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Estamos preparando la información del cliente.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-4 py-5 sm:px-5 lg:px-6 lg:py-7">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-950">
                No pudimos cargar tu perfil
              </h1>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {errorMsg}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-4 py-5 sm:px-5 lg:px-6 lg:py-7">
      <section className="mx-auto max-w-7xl">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white shadow-[0_8px_24px_rgba(49,87,44,0.05)] sm:rounded-[2rem]">
          <div className="absolute right-[-90px] top-[-90px] h-[220px] w-[220px] rounded-full bg-[#31572c]/10 blur-3xl" />
          <div className="absolute bottom-[-100px] left-[-100px] h-[220px] w-[220px] rounded-full bg-[#c9b27c]/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6 lg:p-7">
            <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#31572c]/10 text-[#31572c] ring-1 ring-[#31572c]/10 sm:h-20 sm:w-20">
              {client?.logo_url ? (
                <Image
                  src={client.logo_url}
                  alt={client?.business_name || "Logo del negocio"}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <span className="text-2xl font-black tracking-tight">
                  {initials}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#31572c]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#31572c] ring-1 ring-[#31572c]/10">
                <ShieldCheck size={13} />
                Perfil del cliente
              </div>

              <h1 className="break-words text-2xl font-black leading-tight tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {client?.business_name || "Negocio sin nombre"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Consulta la información registrada de tu negocio, datos de
                contacto, estado de cuenta y dirección de entrega.
              </p>
            </div>

            <div className="hidden rounded-2xl bg-[#f7f3ea] px-4 py-3 ring-1 ring-[#eadfce] lg:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                Rol
              </p>
              <p className="mt-1 text-sm font-bold text-[#31572c]">
                {profile?.role_label || profile?.role || "Cliente"}
              </p>
            </div>
          </div>
        </div>

        {/* RESUMEN PRINCIPAL */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <InfoCard icon={User} label="Responsable" value={ownerName} />

          <InfoCard
            icon={Phone}
            label="Teléfono"
            value={profile?.phone || client?.phone}
          />

          <InfoCard
            icon={Mail}
            label="Correo electrónico"
            value={profile?.email || client?.email}
          />
        </div>

        {/* CONTENIDO */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          {/* DATOS DEL NEGOCIO */}
          <section className="rounded-[1.5rem] border border-[#eadfce] bg-white p-4 shadow-[0_8px_24px_rgba(49,87,44,0.05)] sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#31572c]/10 text-[#31572c]">
                  <Store size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-black tracking-tight text-gray-950">
                    Datos del negocio
                  </h2>
                  <p className="mt-0.5 text-sm leading-6 text-gray-500">
                    Información comercial vinculada al cliente.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-[#31572c]/10 px-3 py-1 text-xs font-bold text-[#31572c]">
                {profile?.role_label || profile?.role || "Cliente"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoCard
                icon={Building2}
                label="Nombre del negocio"
                value={client?.business_name}
              />

              <InfoCard
                icon={Phone}
                label="Teléfono del negocio"
                value={client?.phone}
              />

              <InfoCard
                icon={Mail}
                label="Correo del negocio"
                value={client?.email}
              />
            </div>
          </section>

          {/* ESTADO DE LA CUENTA */}
          <section className="rounded-[1.5rem] border border-[#eadfce] bg-white p-4 shadow-[0_8px_24px_rgba(49,87,44,0.05)] sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#31572c]/10 text-[#31572c]">
                <BadgeCheck size={20} />
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-950">
                  Estado de la cuenta
                </h2>
                <p className="mt-0.5 text-sm leading-6 text-gray-500">
                  Resumen interno del perfil registrado.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#f7f3ea] p-4">
              <DetailRow
                label="Estado"
                value={profile?.active ? "Cuenta activa" : "Cuenta inactiva"}
              />
              <DetailRow
                label="Rol"
                value={profile?.role_label || profile?.role || "Cliente"}
              />
              
              <DetailRow
                label="Cliente desde"
                value={formatDate(client?.created_at)}
              />
            </div>
          </section>
        </div>

        {/* DIRECCIÓN */}
        <section className="mt-4 rounded-[1.5rem] border border-[#eadfce] bg-white p-4 shadow-[0_8px_24px_rgba(49,87,44,0.05)] sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#31572c]/10 text-[#31572c]">
                <MapPinned size={20} />
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-950">
                  Dirección registrada
                </h2>
                <p className="mt-0.5 text-sm leading-6 text-gray-500">
                  Esta dirección puede utilizarse para entregas y pedidos.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-[#eadfce] bg-[#f7f3ea] p-4">
            <div className="flex items-start gap-3">
              <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#31572c] sm:flex">
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Dirección completa
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-gray-950">
                  {address?.full_address ||
                    address?.address ||
                    "Sin dirección registrada"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard icon={MapPin} label="Calle" value={address?.street} />

            <InfoCard
              icon={MapPin}
              label="Número exterior"
              value={address?.ext_number}
            />

            <InfoCard
              icon={MapPin}
              label="Número interior"
              value={address?.int_number}
            />

            <InfoCard
              icon={MapPin}
              label="Colonia"
              value={address?.neighborhood}
            />

            <InfoCard
              icon={MapPin}
              label="Municipio"
              value={address?.municipality}
            />

            <InfoCard icon={MapPin} label="Estado" value={address?.state} />

            <InfoCard
              icon={MapPin}
              label="Código postal"
              value={address?.postal_code}
            />
          </div>
        </section>

        {/* CAMBIAR CONTRASEÑA */}
        <section className="mt-4 rounded-[1.5rem] border border-[#eadfce] bg-white p-4 shadow-[0_8px_24px_rgba(49,87,44,0.05)] sm:p-5">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#31572c]/10 text-[#31572c]">
                <KeyRound size={20} />
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-950">
                  Cambiar contraseña
                </h2>
                <p className="mt-0.5 text-sm leading-6 text-gray-500">
                  Actualiza la contraseña de acceso a tu portal de cliente.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Contraseña actual
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full rounded-xl border border-[#eadfce] bg-white py-3 pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#31572c] focus:ring-2 focus:ring-[#31572c]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                  aria-label={
                    showCurrentPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nueva contraseña
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFieldChange}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-[#eadfce] bg-white py-3 pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#31572c] focus:ring-2 focus:ring-[#31572c]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                    aria-label={
                      showNewPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Confirmar nueva contraseña
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFieldChange}
                    placeholder="Repite la nueva contraseña"
                    className="w-full rounded-xl border border-[#eadfce] bg-white py-3 pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#31572c] focus:ring-2 focus:ring-[#31572c]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación de contraseña"
                        : "Mostrar confirmación de contraseña"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {passwordMessage ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                {passwordMessage}
              </div>
            ) : null}

            {passwordError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {passwordError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#31572c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#25441f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {passwordLoading ? "Guardando..." : "Guardar nueva contraseña"}
              </button>

              <p className="text-xs leading-5 text-gray-400">
                Por seguridad, usa una contraseña diferente a la anterior.
              </p>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
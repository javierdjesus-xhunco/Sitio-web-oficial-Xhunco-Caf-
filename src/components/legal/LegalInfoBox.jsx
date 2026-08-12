import {
  Info,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

const TYPES = {
  info: {
    icon: Info,
    title: "Información",
    container:
      "border-blue-200 bg-blue-50/70 text-blue-900",
    iconContainer:
      "bg-blue-100 text-blue-700",
  },

  warning: {
    icon: AlertTriangle,
    title: "Importante",
    container:
      "border-amber-200 bg-amber-50/70 text-amber-900",
    iconContainer:
      "bg-amber-100 text-amber-700",
  },

  success: {
    icon: CheckCircle2,
    title: "Importante",
    container:
      "border-green-200 bg-green-50/70 text-green-900",
    iconContainer:
      "bg-green-100 text-green-700",
  },

  security: {
    icon: ShieldAlert,
    title: "Seguridad",
    container:
      "border-[#31572c]/20 bg-[#31572c]/5 text-gray-900",
    iconContainer:
      "bg-[#31572c]/10 text-[#31572c]",
  },
};

export default function LegalInfoBox({
  type = "info",
  title,
  children,
}) {
  const config = TYPES[type] || TYPES.info;

  const Icon = config.icon;

  return (
    <div
      className={`
        my-8
        rounded-2xl
        border
        p-5
        sm:p-6
        ${config.container}
      `}
      role="note"
    >
      <div className="flex items-start gap-4">

        {/* Icono */}

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${config.iconContainer}
          `}
        >
          <Icon
            size={20}
            strokeWidth={2}
          />
        </div>

        {/* Contenido */}

        <div className="min-w-0 flex-1">

          <h3 className="text-sm font-semibold">
            {title || config.title}
          </h3>

          <div className="mt-2 text-sm leading-7 opacity-90">
            {children}
          </div>

        </div>

      </div>
    </div>
  );
}
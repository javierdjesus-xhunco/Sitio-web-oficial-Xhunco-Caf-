import {
  ShieldCheck,
  FileText,
  Cookie,
  Truck,
  RefreshCcw,
} from "lucide-react";

export const LEGAL_DOCUMENTS = [
  {
    slug: "privacidad",

    title: "Aviso de Privacidad",

    shortTitle: "Privacidad",

    description:
      "Conoce cómo Xhunco Café recopila, utiliza, almacena y protege tus datos personales.",

    href: "/legal/privacidad",

    icon: ShieldCheck,

    category: "Privacidad",

    featured: true,
  },

  {
    slug: "terminos",

    title: "Términos y Condiciones",

    shortTitle: "Términos",

    description:
      "Consulta las condiciones que regulan el uso de nuestro sitio web, plataforma y servicios.",

    href: "/legal/terminos",

    icon: FileText,

    category: "Condiciones",

    featured: true,
  },

  {
    slug: "cookies",

    title: "Política de Cookies",

    shortTitle: "Cookies",

    description:
      "Conoce qué son las cookies, cómo las utilizamos y qué opciones tienes para administrarlas.",

    href: "/legal/cookies",

    icon: Cookie,

    category: "Privacidad",

    featured: true,
  },

  {
    slug: "envios",

    title: "Política de Envíos",

    shortTitle: "Envíos",

    description:
      "Consulta nuestra cobertura, tiempos de entrega, costos y condiciones relacionadas con los envíos.",

    href: "/legal/envios",

    icon: Truck,

    category: "Operaciones",

    featured: false,
  },

  {
    slug: "devoluciones",

    title: "Cambios y Devoluciones",

    shortTitle: "Devoluciones",

    description:
      "Conoce las condiciones y procedimientos aplicables a cambios, devoluciones y garantías.",

    href: "/legal/devoluciones",

    icon: RefreshCcw,

    category: "Compras",

    featured: false,
  },
];

/**
 * Obtiene un documento legal a partir de su slug.
 */
export function getLegalDocument(slug) {
  return LEGAL_DOCUMENTS.find(
    (document) => document.slug === slug
  );
}

/**
 * Obtiene los documentos destacados.
 */
export function getFeaturedLegalDocuments() {
  return LEGAL_DOCUMENTS.filter(
    (document) => document.featured
  );
}

/**
 * Obtiene documentos relacionados excluyendo
 * el documento actualmente consultado.
 */
export function getRelatedLegalDocuments(currentSlug) {
  return LEGAL_DOCUMENTS.filter(
    (document) => document.slug !== currentSlug
  );
}
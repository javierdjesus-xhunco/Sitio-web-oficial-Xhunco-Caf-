export const metadata = {
  title: {
    default: "Centro Legal | Xhunco Café",
    template: "%s | Xhunco Café",
  },

  description:
    "Consulta el Centro Legal de Xhunco Café. Aquí encontrarás nuestro Aviso de Privacidad, Términos y Condiciones, Política de Cookies, Envíos, Facturación y demás documentos legales.",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Centro Legal | Xhunco Café",
    description:
      "Consulta los documentos legales oficiales de Xhunco Café.",

    url: "https://xhunco.com/legal",

    siteName: "Xhunco Café",

    locale: "es_MX",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Centro Legal | Xhunco Café",

    description:
      "Documentación legal oficial de Xhunco Café.",
  },
};

export default function LegalRootLayout({
  children,
}) {
  return children;
}
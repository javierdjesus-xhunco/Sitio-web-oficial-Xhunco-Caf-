import "./globals.css";
import AppShell from "./components/AppShell";

import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Xhunco® Café",
  description: "Portal de pedidos de Xhunco Café",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Xhunco",
  },

  themeColor: "#31572c",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900">
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
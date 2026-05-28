import "./globals.css";
import Header from "./components/Header";
import PromoModal from "@/components/PromoModal";

import { CartProvider } from "@/context/CartContext";
import CartFloating from "@/components/CartFloating";

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
      <body className="pt-20 bg-white text-gray-900">
        <CartProvider>
          <Header />
          <PromoModal />
          <CartFloating />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
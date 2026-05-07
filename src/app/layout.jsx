import "./globals.css";
import Header from "./components/Header";
import PromoModal from "@/components/PromoModal";

// 👇 AGREGA ESTO
import { CartProvider } from "@/context/CartContext";
import CartFloating from "@/components/CartFloating";

export const metadata = {
  title: "Xhunco® Café",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
  },
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
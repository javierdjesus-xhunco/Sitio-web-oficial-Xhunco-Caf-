import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Xhunco® Café",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="pt-20 bg-white text-gray-900">
        <Header />
        {children}
      </body>
    </html>
  );
}

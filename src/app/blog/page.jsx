import Footer from "@/app/components/Footer";
import BlogClient from "./BlogClient";

export const metadata = {
  title: "Blog Xhunco | Guía de café, cafeterías y suministros",
  description:
    "Aprende sobre café, suministros para cafetería, proveedores, recetas y consejos para negocios con la guía de Xhunco Café.",
  keywords: [
    "blog de café",
    "café para cafeterías",
    "suministros para cafetería",
    "proveedor de café",
    "Xhunco Café",
  ],
  alternates: {
    canonical: "https://www.xhunco.com/blog",
  },
  openGraph: {
    title: "Blog Xhunco | Guía de café y suministros",
    description:
      "Consejos profesionales sobre café, cafeterías, suministros y proveedores para negocios.",
    url: "https://www.xhunco.com/blog",
    siteName: "Xhunco Café",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#1f2a1d]">
      <BlogClient />
      <Footer />
    </main>
  );
}
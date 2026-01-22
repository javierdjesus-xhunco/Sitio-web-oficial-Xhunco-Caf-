import Header from "./components/Header";
import Hero from "./components/Hero";
import CafesDestacados from "./components/CafesDestacados";
import Clientes from "./components/Clientes";
import PropuestaValor from "./components/PropuestaValor";
import NuestraHistoria from "./components/NuestraHistoria";
import B2B from "./components/B2B";
import PortalSocios from "./components/PortalSocios";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      <Header />
      <Hero />
      <CafesDestacados />
      <Clientes />
      <NuestraHistoria/>
      <PropuestaValor />
      <B2B />
      <PortalSocios />
      <Footer />
    </main>
  );
}

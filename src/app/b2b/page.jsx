"use client";

import HeroB2B from "./components/HeroB2B";
import BeneficiosB2B from "./components/BeneficiosB2B";
import ParaQuienB2B from "./components/ParaQuienB2B";
import OfrecemosB2B from "./components/OfrecemosB2B";
import ProcesoB2B from "./components/ProcesoB2B";
import FormularioB2B from "./components/FormularioB2B";

export default function B2BPage() {
  return (
    <main className="bg-[#F8F7e5] text-gray-900">
      <HeroB2B />
      <ParaQuienB2B />
      <OfrecemosB2B />
      <ProcesoB2B />
       <BeneficiosB2B />
      <FormularioB2B />
    </main>
  );
}

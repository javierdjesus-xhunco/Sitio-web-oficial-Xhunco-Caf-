"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PedidosListRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal/cliente/pedidos");
  }, [router]);

  return <div className="text-gray-600">Redirigiendo…</div>;
}

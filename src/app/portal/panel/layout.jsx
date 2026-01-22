"use client";

import { useState } from "react";
import Link from "next/link";

export default function PanelLayout({ children }) {
  const [openPedidos, setOpenPedidos] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#111827] text-white flex flex-col">

        {/* LOGO */}
        <div className="p-6 text-xl font-semibold border-b border-gray-700">
          Xhunco® Socios
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 text-sm space-y-1">

          <Link
            href="/portal/panel"
            className="block px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Dashboard
          </Link>

          {/* PEDIDOS (CON DESPLEGABLE) */}
          <button
            onClick={() => setOpenPedidos(!openPedidos)}
            className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-700 flex justify-between items-center"
          >
            <span>Pedidos</span>
            <span className="text-xs">
              {openPedidos ? "▲" : "▼"}
            </span>
          </button>

          {openPedidos && (
            <div className="ml-4 mt-1 space-y-1">
              <Link
                href="/portal/panel/pedidos/cafe"
                className="block px-4 py-2 rounded-md hover:bg-gray-700 text-gray-300"
              >
                ☕ Pedidos de Café
              </Link>

              <Link
                href="/portal/panel/pedidos/suministros"
                className="block px-4 py-2 rounded-md hover:bg-gray-700 text-gray-300"
              >
                📦 Pedidos de Suministros
              </Link>
            </div>
          )}

          <Link
            href="/portal/panel/historial"
            className="block px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Historial
          </Link>

          <Link
            href="/portal/panel/perfil"
            className="block px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Mi perfil
          </Link>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/portal"
            className="block text-center text-sm text-gray-300 hover:text-white"
          >
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1">

        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-lg font-semibold">
            Panel de Socios
          </h1>
        </header>

        <section className="p-8">
          {children}
        </section>

      </main>
    </div>
  );
}

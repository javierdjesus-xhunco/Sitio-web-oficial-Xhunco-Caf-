// src/app/api/suministros/route.js
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.suministroXhunco.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      sku: true,
      nombre: true,
      categoria: true,
      presentacion: true,
      precio_web: true,
      unidad: true,
      stock: true,
      activo: true,
      imagen: true,
    },
  });

  const items = rows.map((r) => ({
    id: r.id,
    sku: r.sku,
    nombre: r.nombre,
    categoria: r.categoria,
    presentacion: r.presentacion,
    precio: r.precio_web ?? 0, // ✅ usa precio_web pero conserva "precio" para el front
    unidad: r.unidad,
    stock: typeof r.stock === "bigint" ? Number(r.stock) : r.stock ?? 0,
    activo: Boolean(r.activo),
    createdAt: null,
    updatedAt: null,
    imagen: r.imagen ?? null,
  }));

  return Response.json(items, {
    headers: { "Cache-Control": "no-store" },
  });
}
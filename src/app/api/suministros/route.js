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
      marca: true,
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
    marca: r.marca ?? null,
    presentacion: r.presentacion,
    precio_web: r.precio_web ?? 0,
    unidad: r.unidad,
    stock: typeof r.stock === "bigint" ? Number(r.stock) : r.stock ?? 0,
    activo: Boolean(r.activo),
    imagen: r.imagen ?? null,
  }));

  return Response.json(items, {
    headers: { "Cache-Control": "no-store" },
  });
}
// src/app/api/suministros/route.js
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

        // Campos personalizados para la información del modal
        descripcion_web: true,
        uso_sugerido: true,
        tip_preparacion: true,
        ideal_para: true,
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

      // Información personalizada para el modal
      descripcion_web: r.descripcion_web ?? null,
      uso_sugerido: r.uso_sugerido ?? null,
      tip_preparacion: r.tip_preparacion ?? null,
      ideal_para: Array.isArray(r.ideal_para) ? r.ideal_para : [],
    }));

    return Response.json(items, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error obteniendo suministros:", error);

    return Response.json(
      { error: "No se pudieron obtener los suministros." },
      { status: 500 }
    );
  }
}
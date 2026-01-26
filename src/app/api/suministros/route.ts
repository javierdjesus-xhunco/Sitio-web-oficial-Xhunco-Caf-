export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.suministro.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      sku: true,
      nombre: true,
      categoria: true,
      presentacion: true,
      precio: true,
      unidad: true,
      stock: true,
      activo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json(items, {
    headers: { "Cache-Control": "no-store" },
  });
}

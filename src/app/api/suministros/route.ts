export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.suministro.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(items);
}

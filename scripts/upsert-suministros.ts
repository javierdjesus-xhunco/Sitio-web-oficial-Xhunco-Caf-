import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Row = {
  sku: string;
  nombre: string;
  categoria?: string;
  presentacion?: string;
  precio: string;
  unidad?: string;
  stock: string;
  activo?: string;
};

function toBool(value: string | undefined, defaultValue = true) {
  if (value === undefined || value === "") return defaultValue;
  const v = value.trim().toLowerCase();
  if (["true", "1", "yes", "si", "sí"].includes(v)) return true;
  if (["false", "0", "no"].includes(v)) return false;
  return defaultValue;
}

function clean(s: string | undefined) {
  const v = (s ?? "").trim();
  return v === "" ? undefined : v;
}

async function main() {
  const fileArg = process.argv[2] || "suministros.csv";
  const filePath = path.resolve(process.cwd(), fileArg);

  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el archivo CSV: ${filePath}`);
  }

  const csv = fs.readFileSync(filePath, "utf8");

  const records = parse(csv, {
    // Limpia encabezados: quita BOM, trim, y deja igual los nombres
  columns: (headers: string[]) =>
    headers.map((h) => h.replace(/^\uFEFF/, "").trim()),
  skip_empty_lines: true,
  trim: true,
}) as Row[];

  if (records.length === 0) {
    console.log("CSV vacío. No hay nada que cargar.");
    return;
  }

  let ok = 0;
  let fail = 0;

  for (const [i, r] of records.entries()) {
    const sku = clean(r.sku);
    const nombre = clean(r.nombre);

    if (!sku || !nombre) {
      fail++;
      console.error(
        `Fila ${i + 2}: falta sku o nombre (recuerda que la fila 1 es encabezado).`,
      );
      continue;
    }

    const precio = Number(String(r.precio).replace(",", "."));
    const stock = Number(String(r.stock).replace(",", "."));

    if (!Number.isFinite(precio)) {
      fail++;
      console.error(`Fila ${i + 2} SKU ${sku}: precio inválido: ${r.precio}`);
      continue;
    }

    if (!Number.isFinite(stock) || !Number.isInteger(stock)) {
      fail++;
      console.error(`Fila ${i + 2} SKU ${sku}: stock inválido (usa entero): ${r.stock}`);
      continue;
    }

    const data = {
      sku,
      nombre,
      categoria: clean(r.categoria),
      presentacion: clean(r.presentacion),
      precio,
      unidad: clean(r.unidad),
      stock,
      activo: toBool(r.activo, true),
    };

    try {
      await prisma.suministro.upsert({
        where: { sku },
        create: data,
        update: data,
      });
      ok++;
    } catch (e: any) {
      fail++;
      console.error(`Fila ${i + 2} SKU ${sku}: error al upsert -> ${e?.message ?? e}`);
    }
  }

  console.log(`Listo. Upserts OK: ${ok}, Fallidos: ${fail}`);
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ARCHIVOS, EDITOR_ACTIVO } from "@/lib/editor";

// Lee y guarda los textos para el editor local (/editar). Solo existe con `npm run dev`: en Vercel
// responde 404, así que desde internet nadie puede cambiar nada.

const buscar = (id: unknown) => ARCHIVOS.find((a) => a.id === id);
const absoluta = (ruta: string) => path.join(process.cwd(), ruta);

export async function GET(req: Request) {
  if (!EDITOR_ACTIVO) return new NextResponse(null, { status: 404 });
  const archivo = buscar(new URL(req.url).searchParams.get("archivo"));
  if (!archivo) return NextResponse.json({ error: "archivo_desconocido" }, { status: 400 });
  const texto = await readFile(absoluta(archivo.ruta), "utf-8");
  return NextResponse.json({ datos: JSON.parse(texto) });
}

export async function POST(req: Request) {
  if (!EDITOR_ACTIVO) return new NextResponse(null, { status: 404 });
  const body = await req.json().catch(() => null);
  const archivo = buscar(body?.archivo);
  if (!archivo || typeof body.datos !== "object" || body.datos === null) {
    return NextResponse.json({ error: "datos_no_validos" }, { status: 400 });
  }

  // El editor solo cambia valores: si faltara alguna sección, es que algo ha ido mal y no se guarda
  const actual = JSON.parse(await readFile(absoluta(archivo.ruta), "utf-8"));
  const faltan = Object.keys(actual).filter((k) => !(k in body.datos));
  if (faltan.length) return NextResponse.json({ error: "faltan_secciones", faltan }, { status: 400 });

  await writeFile(absoluta(archivo.ruta), JSON.stringify(body.datos, null, 2) + "\n", "utf-8");
  return NextResponse.json({ ok: true });
}

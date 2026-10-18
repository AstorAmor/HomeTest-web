import { NextResponse } from "next/server";
import { rpcConSesion } from "@/lib/medicion-servidor";

// Datos del panel para un periodo: llama a web_panel (hometest-app/supabase/migrations/…_web_panel.sql)
// con la sesión de quien ha entrado; si no es administradora, la base de datos lo rechaza.
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const body = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "sin_sesion" }, { status: 401 });
  if (!FECHA.test(String(body.desde)) || !FECHA.test(String(body.hasta))) {
    return NextResponse.json({ error: "fechas" }, { status: 400 });
  }

  const res = await rpcConSesion(token, "web_panel", { p_desde: body.desde, p_hasta: body.hasta });
  if (!res) return NextResponse.json({ error: "sin_configurar" }, { status: 503 });
  if (res.status === 401) return NextResponse.json({ error: "sin_sesion" }, { status: 401 });
  if (!res.ok) {
    const texto = await res.text();
    const prohibido = texto.includes("42501") || texto.includes("administradores");
    if (!prohibido) console.error("panel: Supabase respondió", res.status, texto);
    return NextResponse.json({ error: prohibido ? "no_admin" : "error" }, { status: prohibido ? 403 : 502 });
  }
  return NextResponse.json(await res.json(), { headers: { "Cache-Control": "no-store" } });
}

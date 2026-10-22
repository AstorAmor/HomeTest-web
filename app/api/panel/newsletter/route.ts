import { NextResponse } from "next/server";
import { rpcConSesion } from "@/lib/medicion-servidor";
import { estadoBrevo } from "@/lib/newsletter";

// Datos de la newsletter para el panel: llama a newsletter_panel (hometest-app/supabase/migrations/
// …_newsletter.sql) con la sesión de quien ha entrado; si no es administradora, la base de datos lo
// rechaza. Si la migración aún no está aplicada, responde «sin_newsletter» y el panel lo explica.
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "sin_sesion" }, { status: 401 });

  const res = await rpcConSesion(token, "newsletter_panel", {});
  if (!res) return NextResponse.json({ error: "sin_configurar" }, { status: 503 });
  if (res.status === 401) return NextResponse.json({ error: "sin_sesion" }, { status: 401 });
  if (!res.ok) {
    const texto = await res.text();
    if (texto.includes("42501") || texto.includes("administradores")) return NextResponse.json({ error: "no_admin" }, { status: 403 });
    // PGRST202: la función no existe (migración sin aplicar)
    if (res.status === 404 || texto.includes("PGRST202")) return NextResponse.json({ error: "sin_newsletter" }, { status: 404 });
    console.error("panel newsletter: Supabase respondió", res.status, texto);
    return NextResponse.json({ error: "error" }, { status: 502 });
  }
  // Ya sabemos que es administradora: se añade el estado de Vercel y Brevo (lib/newsletter.ts)
  const [datos, config] = await Promise.all([res.json(), estadoBrevo()]);
  return NextResponse.json({ ...datos, config }, { headers: { "Cache-Control": "no-store" } });
}

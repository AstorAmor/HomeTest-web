import { NextResponse } from "next/server";
import { rpc } from "@/lib/medicion-servidor";
import { avisoDeBrevo } from "@/lib/newsletter";

// Avisos de Brevo (webhook de marketing): confirmaciones de alta, entregas, aperturas, clics, bajas,
// rebotes y spam. En Brevo, la dirección del webhook es https://kuovahealth.com/api/newsletter/brevo?k=<secreto>,
// y el mismo secreto está guardado en Supabase Vault («brevo_webhook_secret»): la base de datos lo
// comprueba en newsletter_evento_brevo, así que esta ruta no guarda ningún secreto.
export async function POST(req: Request) {
  const secreto = new URL(req.url).searchParams.get("k") ?? "";
  if (!secreto) return NextResponse.json({ error: "sin_secreto" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const avisos = (Array.isArray(body) ? body : body ? [body] : []).filter((a) => a && typeof a === "object");
  let guardados = 0;
  for (const a of avisos) {
    const aviso = avisoDeBrevo(a as Record<string, unknown>);
    if (!aviso) continue;
    const res = await rpc("newsletter_evento_brevo", { p_secreto: secreto, ...aviso });
    if (!res) return NextResponse.json({ error: "not_configured" }, { status: 503 });
    if (!res.ok) {
      const texto = await res.text();
      if (texto.includes("42501") || texto.includes("No autorizado")) return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
      // Un aviso que no se puede guardar no debe bloquear los demás: Brevo reintentaría todo el lote
      console.error("newsletter: aviso de Brevo no guardado", aviso.p_evento, res.status, texto);
      continue;
    }
    guardados++;
  }
  return NextResponse.json({ ok: true, guardados });
}

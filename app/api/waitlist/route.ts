import { NextResponse } from "next/server";
import { atribucionDe, datosPeticion, rpc, rutaDe } from "@/lib/medicion-servidor";

// Lista de espera: guarda el email en Supabase (proyecto HomeTest00) llamando a la función
// join_waitlist (migraciones en hometest-app/supabase/migrations/…_waitlist.sql y …_web_medicion.sql),
// junto con por dónde llegó la persona (canal, fuente, campaña… de lib/canales.ts), su dispositivo
// y su país. Con la clave publicable solo se puede apuntar un email: la tabla no se puede leer
// desde fuera. Variables en Vercel: SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Trampa para bots: el campo "website" es invisible; si llega relleno, se responde OK sin guardar
  if (body.website) return NextResponse.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const a = atribucionDe(body.a);
  const peticion = datosPeticion(req);
  const res = await rpc("join_waitlist", {
    p_email: email,
    p_lang: body.lang === "es" ? "es" : "en",
    p_source: "web",
    p_canal: a.canal,
    p_fuente: a.fuente,
    p_medio: a.medio,
    p_campana: a.campana,
    p_contenido: a.contenido,
    p_termino: a.termino,
    p_referrer: a.referrer,
    p_click_id: a.click_id,
    p_ruta: rutaDe(body.ruta),
    p_dispositivo: peticion.dispositivo,
    p_pais: peticion.pais,
    p_region: peticion.region,
    p_ciudad: peticion.ciudad,
  });
  if (!res) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!res.ok) {
    console.error("waitlist: Supabase respondió", res.status, await res.text());
    return NextResponse.json({ error: "save_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

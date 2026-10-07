import { NextResponse } from "next/server";

// Lista de espera: guarda el email en Supabase (proyecto HomeTest00) llamando a la función
// join_waitlist (migración en hometest-app/supabase/migrations/…_waitlist.sql). Con la clave
// publicable solo se puede apuntar un email: la tabla no se puede leer desde fuera.
// Variables en Vercel: SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Trampa para bots: el campo "website" es invisible; si llega relleno, se responde OK sin guardar
  if (body.website) return NextResponse.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("waitlist: faltan SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const res = await fetch(`${url}/rest/v1/rpc/join_waitlist`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ p_email: email, p_lang: body.lang === "es" ? "es" : "en", p_source: "web" }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("waitlist: Supabase respondió", res.status, await res.text());
    return NextResponse.json({ error: "save_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

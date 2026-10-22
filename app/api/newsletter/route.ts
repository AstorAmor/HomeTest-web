import { NextResponse } from "next/server";
import { NEWSLETTER } from "@/lib/launch";
import { atribucionDe, datosPeticion, rpc, rutaDe } from "@/lib/medicion-servidor";
import { pedirConfirmacion, textosNewsletter } from "@/lib/newsletter";

// Alta en la newsletter: guarda en Supabase el consentimiento (newsletter_alta, con la versión del
// texto aceptado y por dónde llegó la persona) y pide a Brevo el email de doble confirmación. Hasta
// que la persona confirma queda «pendiente»; la confirmación llega por /api/newsletter/brevo.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ORIGENES = ["formulario", "lista-de-espera"];

export async function POST(req: Request) {
  if (!NEWSLETTER) return NextResponse.json({ error: "no_disponible" }, { status: 404 });
  const body = await req.json().catch(() => ({}));

  // Trampa para bots: el campo "website" es invisible; si llega relleno, se responde OK sin guardar
  if (body.website) return NextResponse.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  // Sin la casilla marcada no hay consentimiento: no se guarda nada
  if (body.consentimiento !== true) return NextResponse.json({ error: "sin_consentimiento" }, { status: 400 });
  const origen = ORIGENES.includes(body.origen) ? body.origen : "formulario";
  const idioma = body.lang === "en" ? "en" : "es";

  const peticion = datosPeticion(req);
  if (peticion.robot) return NextResponse.json({ ok: true });
  const a = atribucionDe(body.a);
  const res = await rpc("newsletter_alta", {
    p_email: email,
    p_idioma: idioma,
    p_version: textosNewsletter(idioma).version,
    p_origen: origen,
    p_medicion: body.medicion === true,
    p_canal: a.canal,
    p_fuente: a.fuente,
    p_medio: a.medio,
    p_campana: a.campana,
    p_contenido: a.contenido,
    p_ruta: rutaDe(body.ruta),
    p_dispositivo: peticion.dispositivo,
    p_pais: peticion.pais,
  });
  if (!res) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!res.ok) {
    console.error("newsletter: Supabase respondió", res.status, await res.text());
    return NextResponse.json({ error: "save_failed" }, { status: 502 });
  }

  // Si Brevo falla, mejor decirlo (la persona puede reintentar) que dejarla esperando un email que no llega
  const brevo = await pedirConfirmacion(email);
  if (brevo === false) return NextResponse.json({ error: "confirm_failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}

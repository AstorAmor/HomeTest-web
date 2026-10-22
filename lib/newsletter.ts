import { createHash } from "node:crypto";
import textos from "@/content/newsletter.json";
import { SITE_URL } from "./seo";

// Servidor de la newsletter (Kuova Letter): textos, la petición a Brevo del email de doble
// confirmación y la lectura de los avisos que manda Brevo. Las altas, bajas y eventos se guardan en
// Supabase (hometest-app/supabase/migrations/…_newsletter.sql).
// Variables en Vercel: BREVO_API_KEY, BREVO_LISTA_NEWSLETTER (id de la lista) y
// BREVO_PLANTILLA_CONFIRMACION (id de la plantilla del email de confirmación en Brevo).

export type IdiomaNewsletter = "es" | "en";
export type TextosNewsletter = (typeof textos)["es"];

export const textosNewsletter = (idioma: IdiomaNewsletter): TextosNewsletter => textos[idioma];

// Pide a Brevo que mande el email de doble confirmación. Al confirmar, Brevo mete a la persona en la
// lista de la newsletter, la lleva a /newsletter/confirmada y nos avisa (list_addition).
// Devuelve false si Brevo falla; null si aún no está configurado (en local, por ejemplo).
export async function pedirConfirmacion(email: string): Promise<boolean | null> {
  const key = process.env.BREVO_API_KEY;
  const lista = Number(process.env.BREVO_LISTA_NEWSLETTER);
  const plantilla = Number(process.env.BREVO_PLANTILLA_CONFIRMACION);
  if (!key || !lista || !plantilla) {
    console.warn("newsletter: Brevo sin configurar; el alta queda pendiente en Supabase sin email de confirmación");
    return null;
  }
  const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method: "POST",
    // Con un User-Agent propio: el Cloudflare de Brevo rechaza algunos genéricos (error 1010)
    headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json", "User-Agent": "KuovaWeb/1.0 (+https://kuovahealth.com)" },
    body: JSON.stringify({
      email,
      includeListIds: [lista],
      templateId: plantilla,
      redirectionUrl: `${SITE_URL}/newsletter/confirmada`,
    }),
    cache: "no-store",
  });
  if (!res.ok) console.error("newsletter: Brevo respondió", res.status, await res.text());
  return res.ok;
}

// Un aviso de Brevo (webhook de marketing) con los nombres de newsletter_evento_brevo(). La clave es
// una huella del aviso, para no guardarlo dos veces si Brevo lo repite.
export function avisoDeBrevo(a: Record<string, unknown>) {
  const evento = typeof a.event === "string" ? a.event : "";
  const email = typeof a.email === "string" ? a.email.trim().toLowerCase() : "";
  const ts = Number(a.ts_event ?? a.ts) || null;
  const enviado = Number(a.ts_sent) || null;
  const campana = Number(a.camp_id) || null;
  const nombre = typeof a.campaign_name === "string" ? a.campaign_name : typeof a["campaign name"] === "string" ? (a["campaign name"] as string) : null;
  const url = typeof a.URL === "string" ? a.URL : typeof a.url === "string" ? a.url : null;
  const listas = Array.isArray(a.list_id) ? a.list_id.map(Number).filter(Boolean) : a.list_id != null ? [Number(a.list_id)].filter(Boolean) : null;
  if (!evento || !email) return null;
  return {
    p_evento: evento,
    p_email: email,
    p_fecha: ts ? new Date(ts * 1000).toISOString() : new Date().toISOString(),
    p_clave: createHash("sha256").update([evento, email, campana, ts, url, listas?.join(",")].join("|")).digest("hex"),
    p_campana: campana,
    p_campana_nombre: nombre,
    p_enviado: enviado ? new Date(enviado * 1000).toISOString() : null,
    p_listas: listas,
    p_url: url,
  };
}

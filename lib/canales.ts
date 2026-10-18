// De dónde llega cada visita: lo que trae el enlace (utm_source, utm_medium, utm_campaign…, o el
// identificador de clic de un anuncio) y, si no trae nada, la web de la que venía (referrer).
// Con eso se decide el canal, con los grupos habituales de la analítica web (como los de Google
// Analytics, en español). Lo usan la página al cargar (components/inicio/Medicion.tsx) y la API de
// la lista de espera; las tablas y vistas están en hometest-app/supabase/migrations/…_web_medicion.sql.
//
// Para que un enlace cuente en su canal, añade al final ?utm_source=…&utm_medium=…&utm_campaign=…
// (p. ej. ?utm_source=instagram&utm_medium=bio). Ejemplos en content/README.md.

export type Canal =
  | "Email"
  | "Redes sociales"
  | "Redes de pago"
  | "Búsqueda orgánica"
  | "Búsqueda de pago"
  | "Asistentes IA"
  | "Mensajería"
  | "Colaboraciones"
  | "QR y offline"
  | "Enlaces de otras webs"
  | "Campañas (otros)"
  | "Directo";

export interface Atribucion {
  canal: Canal;
  fuente: string | null;
  medio: string | null;
  campana: string | null;
  contenido: string | null;
  termino: string | null;
  referrer: string | null;
  click_id: string | null;
}

// Identificadores de clic que añaden las plataformas de anuncios a sus enlaces (y de quién son)
const CLICK_IDS: [param: string, fuente: string, pago: boolean][] = [
  ["gclid", "google", true],
  ["gbraid", "google", true],
  ["wbraid", "google", true],
  ["msclkid", "bing", true],
  ["ttclid", "tiktok", true],
  ["li_fat_id", "linkedin", true],
  ["twclid", "x", true],
  ["epik", "pinterest", true],
  // Meta lo añade a TODOS los enlaces que salen de Facebook/Instagram, también sin anuncio
  ["fbclid", "meta", false],
];

const REDES: [patron: RegExp, fuente: string][] = [
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, "facebook"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "x"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/, "pinterest"],
  [/(^|\.)reddit\.com$/, "reddit"],
  [/(^|\.)threads\.(net|com)$/, "threads"],
  [/(^|\.)(bsky\.app)$/, "bluesky"],
];
const MENSAJERIA: [RegExp, string][] = [
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(^|\.)(t\.me|telegram\.org)$/, "telegram"],
  [/(^|\.)signal\.org$/, "signal"],
];
const IA: [RegExp, string][] = [
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/^gemini\.google\.com$/, "gemini"],
  [/(^|\.)copilot\.microsoft\.com$/, "copilot"],
  [/(^|\.)claude\.ai$/, "claude"],
  [/(^|\.)(you\.com|phind\.com|meta\.ai|deepseek\.com|mistral\.ai)$/, "otros-ia"],
];
const BUSCADORES: [RegExp, string][] = [
  [/(^|\.)google\.[a-z.]+$/, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)(yahoo\.[a-z.]+)$/, "yahoo"],
  [/(^|\.)ecosia\.org$/, "ecosia"],
  [/(^|\.)qwant\.com$/, "qwant"],
  [/^search\.brave\.com$/, "brave"],
  [/(^|\.)(yandex\.[a-z.]+|baidu\.com|startpage\.com)$/, "otros-buscadores"],
];
const CORREO: [RegExp, string][] = [
  [/^mail\.google\.com$/, "gmail"],
  [/(^|\.)(outlook\.live\.com|outlook\.office\.com|outlook\.office365\.com)$/, "outlook"],
  [/^mail\.yahoo\.com$/, "yahoo-mail"],
  [/(^|\.)(mail\.proton\.me|proton\.me)$/, "proton"],
];

const buscar = (lista: [RegExp, string][], host: string | null) => (host ? lista.find(([re]) => re.test(host))?.[1] ?? null : null);

const MEDIOS_EMAIL = new Set(["email", "e-mail", "mail", "newsletter", "correo", "boletin"]);
const FUENTES_EMAIL = new Set(["newsletter", "email", "mail", "mailchimp", "brevo", "sendinblue", "substack", "beehiiv", "mailerlite", "convertkit", "klaviyo", "hubspot", "gmail", "outlook", "firma"]);
const MEDIOS_PAGO = new Set(["cpc", "ppc", "cpm", "cpv", "paid", "paid_social", "paidsocial", "paid-social", "ads", "ad", "display", "paidsearch", "paid_search", "sem", "retargeting", "banner"]);
const MEDIOS_SOCIAL = new Set(["social", "social-network", "social_network", "organic_social", "rrss", "bio", "linkinbio", "story", "stories", "reel", "reels", "post", "perfil", "video", "dm"]);
const MEDIOS_COLABORACION = new Set(["affiliate", "afiliado", "partner", "partners", "colaboracion", "colaboración", "influencer", "referral", "embajador"]);
const MEDIOS_OFFLINE = new Set(["qr", "offline", "print", "impreso", "flyer", "folleto", "evento", "event", "tarjeta", "cartel"]);
const MEDIOS_MENSAJERIA = new Set(["whatsapp", "telegram", "mensaje", "messaging", "sms"]);
const FUENTES_SOCIAL = new Set(["instagram", "ig", "tiktok", "facebook", "fb", "meta", "linkedin", "x", "twitter", "youtube", "pinterest", "reddit", "threads", "bluesky"]);
const FUENTES_BUSCADOR = new Set(["google", "bing", "duckduckgo", "yahoo", "ecosia", "qwant", "brave"]);
const FUENTES_IA = new Set(["chatgpt", "chatgpt.com", "openai", "perplexity", "gemini", "copilot", "claude"]);
const FUENTES_MENSAJERIA = new Set(["whatsapp", "telegram", "signal"]);

const limpio = (v: string | null | undefined, n = 150) => {
  const t = (v ?? "").trim().slice(0, n);
  return t ? t : null;
};

// Dominio sin "www." de una URL de referencia; null si no hay o es esta misma web
export function hostDe(referrer: string | null | undefined, propio?: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    if (!host || host === propio || host === "kuovahealth.com" || host === "localhost" || host.endsWith(".vercel.app")) return null;
    return host;
  } catch {
    return null;
  }
}

export function clasificar(params: URLSearchParams, referrerHost: string | null): Atribucion {
  let fuente = limpio(params.get("utm_source") ?? params.get("source") ?? params.get("ref"), 100)?.toLowerCase() ?? null;
  const medio = limpio(params.get("utm_medium"), 100)?.toLowerCase() ?? null;
  const campana = limpio(params.get("utm_campaign"));
  const contenido = limpio(params.get("utm_content"));
  const termino = limpio(params.get("utm_term"));
  const click = CLICK_IDS.find(([p]) => params.has(p));
  const click_id = click?.[0] ?? null;
  const referrer = referrerHost;

  // Fuente: la del enlace; si no, la que se deduce del clic de anuncio o de la web de origen
  const deReferrer =
    buscar(IA, referrer) ?? buscar(CORREO, referrer) ?? buscar(REDES, referrer) ?? buscar(MENSAJERIA, referrer) ?? buscar(BUSCADORES, referrer);
  if (!fuente) fuente = deReferrer ?? (click ? click[1] : null) ?? referrer;

  const base = { fuente, medio, campana, contenido, termino, referrer, click_id };
  const esSocial = (fuente && FUENTES_SOCIAL.has(fuente)) || !!buscar(REDES, referrer);
  const esBuscador = (fuente && FUENTES_BUSCADOR.has(fuente)) || !!buscar(BUSCADORES, referrer);
  const pago = (medio && MEDIOS_PAGO.has(medio)) || (click?.[2] ?? false);

  let canal: Canal;
  if (pago && (esBuscador || click_id === "gclid" || click_id === "gbraid" || click_id === "wbraid" || click_id === "msclkid")) canal = "Búsqueda de pago";
  else if (pago && (esSocial || click_id === "ttclid" || click_id === "li_fat_id" || click_id === "twclid" || click_id === "epik")) canal = "Redes de pago";
  else if ((medio && MEDIOS_EMAIL.has(medio)) || (fuente && FUENTES_EMAIL.has(fuente)) || buscar(CORREO, referrer)) canal = "Email";
  else if ((fuente && FUENTES_IA.has(fuente)) || buscar(IA, referrer)) canal = "Asistentes IA";
  else if ((medio && MEDIOS_MENSAJERIA.has(medio)) || (fuente && FUENTES_MENSAJERIA.has(fuente)) || buscar(MENSAJERIA, referrer)) canal = "Mensajería";
  else if (medio && MEDIOS_OFFLINE.has(medio)) canal = "QR y offline";
  else if (medio && MEDIOS_COLABORACION.has(medio)) canal = "Colaboraciones";
  else if (esSocial || (medio && MEDIOS_SOCIAL.has(medio)) || click_id === "fbclid") canal = "Redes sociales";
  else if (esBuscador || medio === "organic") canal = "Búsqueda orgánica";
  else if (pago) canal = "Redes de pago";
  else if (fuente || medio || campana) canal = referrer && !params.get("utm_source") ? "Enlaces de otras webs" : "Campañas (otros)";
  else canal = "Directo";

  return { canal, ...base };
}

// Tipo de dispositivo, sistema y navegador a partir del User-Agent (aproximado, sin librerías)
export function dispositivoDe(ua: string): { dispositivo: string; sistema: string; navegador: string } {
  const u = ua.toLowerCase();
  const tablet = /ipad|tablet|(android(?!.*mobile))/.test(u);
  const movil = !tablet && /mobi|iphone|ipod|android/.test(u);
  const sistema = /iphone|ipad|ipod/.test(u)
    ? "iOS"
    : /android/.test(u)
      ? "Android"
      : /windows/.test(u)
        ? "Windows"
        : /mac os x|macintosh/.test(u)
          ? "macOS"
          : /cros/.test(u)
            ? "ChromeOS"
            : /linux/.test(u)
              ? "Linux"
              : "Otro";
  // Navegadores dentro de apps (al abrir un enlace desde Instagram, TikTok…) primero
  const navegador = /instagram/.test(u)
    ? "Instagram (app)"
    : /fban|fbav|fb_iab/.test(u)
      ? "Facebook (app)"
      : /tiktok|musical_ly|bytedance/.test(u)
        ? "TikTok (app)"
        : /linkedinapp/.test(u)
          ? "LinkedIn (app)"
          : /edg\//.test(u)
            ? "Edge"
            : /opr\/|opera/.test(u)
              ? "Opera"
              : /samsungbrowser/.test(u)
                ? "Samsung"
                : /firefox|fxios/.test(u)
                  ? "Firefox"
                  : /crios|chrome/.test(u)
                    ? "Chrome"
                    : /safari/.test(u)
                      ? "Safari"
                      : "Otro";
  return { dispositivo: tablet ? "tablet" : movil ? "movil" : "ordenador", sistema, navegador };
}

// Robots, vistas previas de enlaces y navegadores automáticos: no cuentan como visitas
export const esRobot = (ua: string) =>
  !ua || /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|headless|lighthouse|pagespeed|vercel|curl|wget|python|node-fetch|axios/i.test(ua);

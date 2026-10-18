import { dispositivoDe, esRobot, type Atribucion, type Canal } from "./canales";

// Piezas de servidor de la medición (app/api/medir y app/api/waitlist): llamar a las funciones de
// Supabase y sacar de la petición lo que no manda la página (país, dispositivo, huella del día).

export async function rpc(funcion: string, cuerpo: Record<string, unknown>): Promise<Response | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error(`${funcion}: faltan SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY`);
    return null;
  }
  return fetch(`${url}/rest/v1/rpc/${funcion}`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
    cache: "no-store",
  });
}

// País, región y ciudad los pone Vercel en la petición; la IP solo se usa para la huella del día
// (Supabase la mezcla con una sal que cambia cada día y no la guarda).
export function datosPeticion(req: Request) {
  const h = req.headers;
  const ua = h.get("user-agent") ?? "";
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0].trim();
  let ciudad = h.get("x-vercel-ip-city");
  try {
    ciudad = ciudad ? decodeURIComponent(ciudad) : null;
  } catch {}
  return {
    robot: esRobot(ua),
    huella: `${ip}|${ua}`,
    pais: h.get("x-vercel-ip-country"),
    region: h.get("x-vercel-ip-country-region"),
    ciudad,
    ...dispositivoDe(ua),
  };
}

const CANALES: Canal[] = [
  "Email",
  "Redes sociales",
  "Redes de pago",
  "Búsqueda orgánica",
  "Búsqueda de pago",
  "Asistentes IA",
  "Mensajería",
  "Colaboraciones",
  "QR y offline",
  "Enlaces de otras webs",
  "Campañas (otros)",
  "Directo",
];

const texto = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

// La atribución que manda la página, validada (si algo no cuadra, se queda en null)
export function atribucionDe(a: unknown): Atribucion {
  const o = (a && typeof a === "object" ? a : {}) as Record<string, unknown>;
  const canal = CANALES.includes(o.canal as Canal) ? (o.canal as Canal) : "Directo";
  return {
    canal,
    fuente: texto(o.fuente, 100),
    medio: texto(o.medio, 100),
    campana: texto(o.campana, 150),
    contenido: texto(o.contenido, 150),
    termino: texto(o.termino, 150),
    referrer: texto(o.referrer, 150),
    click_id: texto(o.click_id, 20),
  };
}

export const rutaDe = (v: unknown) => {
  const r = texto(v, 200);
  return r && r.startsWith("/") ? r : "/";
};

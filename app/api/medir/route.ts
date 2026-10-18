import { NextResponse } from "next/server";
import { atribucionDe, datosPeticion, rpc, rutaDe } from "@/lib/medicion-servidor";

// Si Supabase rechaza algo, se deja en el registro de Vercel (la página no se entera)
const avisar = (que: string) => async (res: Response | null) => {
  if (res && !res.ok) console.error(`medir: ${que}`, res.status, await res.text());
};

// Medición de la web sin cookies (lib/canales.ts, components/inicio/Medicion.tsx):
//   { t: "v", id, ruta, idioma, ancho, a: atribución }  → una visita (página cargada)
//   { t: "e", id, tipo, detalle, valor }                → algo que pasa en esa visita
// Se guarda en Supabase con web_registrar_visita / web_registrar_evento
// (hometest-app/supabase/migrations/…_web_medicion.sql). Los robots no cuentan.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  // sendBeacon manda texto plano: se lee siempre como texto y se interpreta como JSON
  const body = await req
    .text()
    .then((t) => JSON.parse(t))
    .catch(() => null);
  if (!body || typeof body !== "object" || !UUID.test(String(body.id))) return new NextResponse(null, { status: 204 });

  const peticion = datosPeticion(req);
  if (peticion.robot) return new NextResponse(null, { status: 204 });

  if (body.t === "v") {
    const a = atribucionDe(body.a);
    await rpc("web_registrar_visita", {
      p_id: body.id,
      p_huella: peticion.huella,
      p_ruta: rutaDe(body.ruta),
      p_idioma: body.idioma === "en" ? "en" : "es",
      p_canal: a.canal,
      p_fuente: a.fuente,
      p_medio: a.medio,
      p_campana: a.campana,
      p_contenido: a.contenido,
      p_termino: a.termino,
      p_referrer: a.referrer,
      p_click_id: a.click_id,
      p_dispositivo: peticion.dispositivo,
      p_sistema: peticion.sistema,
      p_navegador: peticion.navegador,
      p_pais: peticion.pais,
      p_region: peticion.region,
      p_ciudad: peticion.ciudad,
      p_ancho: Number.isFinite(body.ancho) ? Math.round(body.ancho) : null,
    })
      .then(avisar("visita"))
      .catch((e) => console.error("medir: visita", e));
  } else if (body.t === "e" && typeof body.tipo === "string") {
    await rpc("web_registrar_evento", {
      p_visita: body.id,
      p_tipo: body.tipo,
      p_detalle: typeof body.detalle === "string" ? body.detalle.slice(0, 200) : null,
      p_valor: Number.isFinite(body.valor) ? body.valor : null,
    })
      .then(avisar("evento"))
      .catch((e) => console.error("medir: evento", e));
  }
  return new NextResponse(null, { status: 204 });
}

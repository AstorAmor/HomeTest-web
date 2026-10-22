"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Barras, Cifra, Columnas, DORADO, Tarjeta, Vacio, numero, porcentaje } from "./Graficas";

// Sección «Newsletter» del panel (components/panel/Panel.tsx): suscriptores, el embudo de cada número
// (entregados → clics → visitas a la web → altas en la lista de espera) y las últimas altas. Los datos
// los da newsletter_panel en Supabase, solo para administradores. Las visitas y altas de la web
// cuentan por el enlace etiquetado del número (utm_source=newsletter, utm_campaign=n001).

interface Envio {
  id: string;
  asunto: string;
  enviado_at: string | null;
  entregados: number;
  rebotes: number;
  aperturas: number;
  clics: number;
  personas_clic: number;
  bajas: number;
  visitantes_web: number;
  visitas_web: number;
  altas_lista: number;
}

interface Config {
  vercel: { encendida: boolean; clave: boolean; lista: number | null; plantilla: number | null };
  brevo: {
    lista: { nombre: string; contactos: number } | null;
    plantilla: { nombre: string; asunto: string; activa: boolean } | null;
    webhook: { id: number; avisos: string[] } | null;
  } | null;
}

interface Datos {
  config?: Config;
  ajustes?: { brevo_lista: string | null };
  ultimo_aviso?: string | null;
  confirmacion?: { pedidas: number; confirmadas: number };
  altas_dia?: { dia: string; pedidas: number; confirmadas: number }[];
  resumen: { suscritos: number; pendientes: number; bajas: number; rebotes: number; medicion_individual: number; altas_30d: number };
  envios: Envio[];
  origenes: { origen: string; suscritos: number }[];
  recientes: {
    email: string;
    estado: string;
    origen: string;
    medicion: boolean;
    pedido: string;
    confirmado: string | null;
    baja: string | null;
    canal: string | null;
    fuente: string | null;
  }[];
}

const ORIGENES: Record<string, string> = {
  formulario: "Formulario de los artículos",
  "lista-de-espera": "Casilla de la lista de espera",
  "email-lanzamiento": "Email de lanzamiento",
  manual: "Añadido en Brevo",
};
const ESTADOS: Record<string, string> = {
  pendiente: "Sin confirmar",
  suscrito: "Suscrito",
  baja: "Baja",
  rebote: "Email que rebota",
  spam: "Lo marcó como spam",
};

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }) : "—";

const AVISOS: Record<string, string> = {
  listAddition: "altas confirmadas",
  delivered: "entregas",
  click: "clics",
  unsubscribed: "bajas",
  hardBounce: "rebotes",
  softBounce: "rebotes temporales",
  spam: "spam",
  opened: "aperturas",
};

// Una fila de la configuración: qué es, si está bien (texto + punto, no solo color) y el detalle
function Fila({ nombre, bien, estado, detalle }: { nombre: string; bien: boolean | null; estado: string; detalle?: ReactNode }) {
  const color = bien == null ? "#9A958C" : bien ? "#1F7A55" : "#B8862E";
  return (
    <li className="grid items-start gap-1 py-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,9rem)_1fr] sm:gap-4">
      <span className="text-sm font-medium text-text">{nombre}</span>
      <span className="flex items-center gap-2 text-sm text-text">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        {estado}
      </span>
      <span className="text-sm text-text-muted">{detalle}</span>
    </li>
  );
}

// Configuración y estado de la puesta en marcha: qué falta para encenderla y si cada pieza responde
function Configuracion({ datos }: { datos: Datos }) {
  const c = datos.config;
  if (!c) return null;
  const listaBd = datos.ajustes?.brevo_lista ?? null;
  const listaVercel = c.vercel.lista;
  const coinciden = listaBd != null && listaVercel != null && String(listaVercel) === listaBd;
  const b = c.brevo;
  return (
    <Tarjeta
      titulo="Configuración y estado"
      subtitulo="Lo que hace falta para que la newsletter funcione y si cada pieza responde. Las claves nunca se enseñan: solo si están puestas."
    >
      <ul className="divide-y divide-border/70">
        <Fila
          nombre="Newsletter en la web"
          bien={c.vercel.encendida}
          estado={c.vercel.encendida ? "Encendida" : "Apagada"}
          detalle={c.vercel.encendida ? "Se ven el formulario, la casilla de la lista de espera y la confirmación." : "Se enciende en Vercel con NEXT_PUBLIC_NEWSLETTER = true y «Redeploy», cuando el abogado dé el OK."}
        />
        <Fila
          nombre="Clave de Brevo en Vercel"
          bien={c.vercel.clave}
          estado={c.vercel.clave ? "Puesta" : "Falta"}
          detalle="BREVO_API_KEY (Production, marcada como Sensitive). Sin ella no sale el email de confirmación."
        />
        <Fila
          nombre="Lista de la newsletter"
          bien={listaVercel != null && coinciden && !!b?.lista}
          estado={listaVercel != null ? `n.º ${listaVercel}` : "Falta"}
          detalle={
            <>
              {b?.lista ? `«${b.lista.nombre}» en Brevo, con ${numero(b.lista.contactos)} contactos. ` : ""}
              {listaVercel == null
                ? "Falta BREVO_LISTA_NEWSLETTER en Vercel. "
                : coinciden
                  ? "Coincide con la guardada en Supabase. "
                  : `No coincide con la guardada en Supabase (${listaBd ?? "ninguna"}): hay que cambiar las dos. `}
              Es el número con el que Brevo identifica la lista: a ella entra cada persona al confirmar.
            </>
          }
        />
        <Fila
          nombre="Email de confirmación"
          bien={c.vercel.plantilla != null && (b ? !!b.plantilla?.activa : null)}
          estado={c.vercel.plantilla != null ? `Plantilla n.º ${c.vercel.plantilla}` : "Falta"}
          detalle={
            <>
              {b?.plantilla ? `«${b.plantilla.nombre}», asunto «${b.plantilla.asunto}»${b.plantilla.activa ? "" : " (desactivada en Brevo)"}. ` : ""}
              {c.vercel.plantilla == null ? "Falta BREVO_PLANTILLA_CONFIRMACION en Vercel. " : ""}
              Es el email de doble confirmación que la web pide a Brevo al apuntarse alguien.
            </>
          }
        />
        <Fila
          nombre="Avisos de Brevo (webhook)"
          bien={b ? !!b.webhook : null}
          estado={b ? (b.webhook ? "Activo" : "No encontrado") : "Sin comprobar"}
          detalle={
            <>
              {b?.webhook ? `Webhook n.º ${b.webhook.id}: ${b.webhook.avisos.map((a) => AVISOS[a] ?? a).join(", ")}. ` : ""}
              {!b ? "Se comprueba cuando esté la clave de Brevo en Vercel. " : ""}
              {datos.ultimo_aviso ? `Último aviso recibido: ${fecha(datos.ultimo_aviso)}.` : "Aún no ha llegado ningún aviso."}
            </>
          }
        />
      </ul>
    </Tarjeta>
  );
}

export default function Newsletter({ token, onSalir }: { token: string; onSalir: () => void }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/panel/newsletter", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return onSalir();
      if (res.status === 404) return setAviso("La newsletter aún no está activada en la base de datos (falta aplicar la migración …_newsletter.sql).");
      if (!res.ok) return setAviso(res.status === 403 ? null : "No se han podido cargar los datos de la newsletter.");
      setDatos(await res.json());
      setAviso(null);
    } catch {
      setAviso("No se han podido cargar los datos de la newsletter.");
    }
  }, [token, onSalir]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (aviso) return <p className="mt-10 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">{aviso}</p>;
  if (!datos) return null;
  const r = datos.resumen;
  const dias = datos.altas_dia ?? [];
  const confirmacion = datos.confirmacion;

  return (
    <div className="mt-12 space-y-6">
      <h2 className="font-display text-3xl tracking-tight text-text">Newsletter · Kuova Letter</h2>
      <Configuracion datos={datos} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Cifra etiqueta="Suscritos" valor={numero(r.suscritos)} nota={`${numero(r.altas_30d)} en los últimos 30 días`} />
        <Cifra etiqueta="Sin confirmar" valor={numero(r.pendientes)} nota="Pidieron el alta y no han pulsado el email de confirmación" />
        <Cifra
          etiqueta="Confirman el email"
          valor={confirmacion ? porcentaje(confirmacion.confirmadas, confirmacion.pedidas) : "—"}
          nota={confirmacion ? `${numero(confirmacion.confirmadas)} de ${numero(confirmacion.pedidas)} altas pedidas en la web` : undefined}
        />
        <Cifra etiqueta="Bajas" valor={numero(r.bajas)} nota={r.rebotes ? `${numero(r.rebotes)} emails que rebotan` : "Incluye quien la marcó como spam"} />
        <Cifra etiqueta="Medición individual" valor={porcentaje(r.medicion_individual, r.suscritos)} nota="Suscritos que aceptan que se midan sus clics" />
      </div>

      {dias.length > 0 && (
        <Tarjeta titulo="Altas por día" subtitulo="Últimos 30 días, hora de Madrid. Pedidas en la web; al pasar por encima, cuántas confirmaron ese día.">
          <Columnas
            datos={dias.map((d) => ({
              etiqueta: new Date(`${d.dia}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
              valor: d.pedidas,
              detalle: `${numero(d.confirmadas)} confirmadas`,
            }))}
            color={DORADO}
            nombre="altas pedidas"
          />
        </Tarjeta>
      )}

      <Tarjeta
        titulo="Embudo de cada número"
        subtitulo="Entregados y clics, de Brevo; visitas y altas, de la medición de la web por el enlace del número. Los clics por persona solo cuentan a quien aceptó la medición individual."
      >
        {datos.envios.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="px-2 pb-2 font-medium">Número</th>
                  <th className="px-2 pb-2 text-right font-medium">Entregados</th>
                  <th className="px-2 pb-2 text-right font-medium">Clics</th>
                  <th className="px-2 pb-2 text-right font-medium">Personas que pinchan</th>
                  <th className="px-2 pb-2 text-right font-medium">Visitantes en la web</th>
                  <th className="px-2 pb-2 text-right font-medium">Altas en la lista</th>
                  <th className="px-2 pb-2 text-right font-medium">Bajas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {datos.envios.map((e) => (
                  <tr key={e.id}>
                    <td className="px-2 py-2 text-text">
                      <span className="font-medium">{e.asunto}</span>
                      <span className="block text-xs text-text-muted">
                        {e.id} · {fecha(e.enviado_at)}
                        {e.rebotes ? ` · ${numero(e.rebotes)} rebotes` : ""}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">{numero(e.entregados)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">{numero(e.clics)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">
                      {numero(e.personas_clic)}
                      <span className="block text-xs text-text-muted">{porcentaje(e.personas_clic, e.entregados)}</span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">
                      {numero(e.visitantes_web)}
                      <span className="block text-xs text-text-muted">{numero(e.visitas_web)} visitas</span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">
                      {numero(e.altas_lista)}
                      <span className="block text-xs text-text-muted">{porcentaje(e.altas_lista, e.visitantes_web)}</span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">
                      {numero(e.bajas)}
                      <span className="block text-xs text-text-muted">{porcentaje(e.bajas, e.entregados)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vacio texto="Aún no se ha enviado ningún número." />
        )}
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Tarjeta titulo="De dónde vienen" subtitulo="Suscritos según dónde se apuntaron.">
          <Barras filas={datos.origenes.map((o) => ({ etiqueta: ORIGENES[o.origen] ?? o.origen, valor: o.suscritos }))} color={DORADO} />
        </Tarjeta>
        <Tarjeta titulo="Últimas altas" subtitulo="Las 30 más recientes y en qué punto están.">
          {datos.recientes.length ? (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    <th className="px-2 pb-2 font-medium">Cuándo</th>
                    <th className="px-2 pb-2 font-medium">Email</th>
                    <th className="px-2 pb-2 font-medium">Estado</th>
                    <th className="px-2 pb-2 font-medium">Dónde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {datos.recientes.map((s) => (
                    <tr key={s.email}>
                      <td className="whitespace-nowrap px-2 py-2 tabular-nums text-text-muted">{fecha(s.pedido)}</td>
                      <td className="px-2 py-2 text-text">
                        {s.email}
                        {s.medicion && <span className="ml-2 text-xs text-text-muted">(mide clics)</span>}
                      </td>
                      <td className="px-2 py-2 text-text">{ESTADOS[s.estado] ?? s.estado}</td>
                      <td className="px-2 py-2 text-text-muted">{ORIGENES[s.origen] ?? s.origen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Vacio texto="Nadie se ha suscrito todavía." />
          )}
        </Tarjeta>
      </div>
    </div>
  );
}

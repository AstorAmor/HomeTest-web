"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Container from "../ui/Container";
import { Barras, Cifra, Columnas, DORADO, Tarjeta, Vacio, VERDE, numero, porcentaje } from "./Graficas";

// Panel de la web (kuovahealth.com/panel): la medición sin cookies (lib/medicion.ts) resumida por
// periodo. Se entra con la cuenta de KUOVA; los datos los da web_panel en Supabase, que solo
// responde a administradores. La sesión se guarda en esta pestaña (sessionStorage) y dura una hora.

interface Sesion {
  token: string;
  expira: number;
  email: string;
}

interface Datos {
  desde: string;
  hasta: string;
  resumen: {
    visitantes: number;
    visitas: number;
    altas: number;
    visitantes_ant: number;
    visitas_ant: number;
    altas_ant: number;
    segundos: number | null;
    scroll: number | null;
    altas_total: number;
  };
  diario: { dia: string; visitantes: number; visitas: number; altas: number }[];
  canales: { canal: string; visitantes: number; visitas: number; altas: number; segundos: number | null }[];
  campanas: { canal: string; fuente: string; medio: string; campana: string; contenido: string; visitantes: number; visitas: number; altas: number }[];
  embudo: { visitas: number; como_funciona: number; lista: number; intento: number; apuntados: number };
  embudo_canal: { canal: string; visitas: number; como_funciona: number; lista: number; intento: number; apuntados: number }[];
  secciones: { seccion: string; visitas: number }[];
  clics: { elemento: string; clics: number; visitas: number }[];
  paises: { nombre: string; visitantes: number }[];
  ciudades: { nombre: string; visitantes: number }[];
  dispositivos: { nombre: string; visitantes: number }[];
  navegadores: { nombre: string; visitantes: number }[];
  altas_recientes: {
    fecha: string;
    email: string;
    canal: string | null;
    fuente: string | null;
    medio: string | null;
    campana: string | null;
    contenido: string | null;
    dispositivo: string | null;
    ciudad: string | null;
    pais: string | null;
    baja: boolean;
  }[];
}

const CLAVE = "kuova-panel";
const INICIO_MEDICION = "2026-10-18";

const PERIODOS = [
  { id: "hoy", nombre: "Hoy", dias: 1 },
  { id: "7", nombre: "7 días", dias: 7 },
  { id: "30", nombre: "30 días", dias: 30 },
  { id: "90", nombre: "90 días", dias: 90 },
  { id: "todo", nombre: "Desde el inicio", dias: 0 },
] as const;
type Periodo = (typeof PERIODOS)[number]["id"];

// Secciones de la portada, en el orden en que aparecen (para ver dónde se va la gente)
const SECCIONES: [string, string][] = [
  ["intro", "Frase inicial"],
  ["como-funciona", "Cómo funciona"],
  ["cuentanos", "Paso 1 · Cuéntanos"],
  ["conecta", "Paso 2 · Conecta"],
  ["registra", "Paso 3 · Registra"],
  ["mide", "Paso 4 · Mide"],
  ["entiende", "Paso 5 · Entiende"],
  ["actua", "Paso 6 · Actúa"],
  ["repite", "Paso 7 · Repite"],
  ["la-app", "La app, por dentro"],
  ["edad-kuova", "Tu edad KUOVA"],
  ["privacidad", "Privacidad"],
  ["preguntas", "Preguntas"],
  ["lista-de-espera", "Lista de espera"],
];

const hoyMadrid = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
const restarDias = (fecha: string, dias: number) => {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
};
const diaCorto = (fecha: string) =>
  new Date(`${fecha}T12:00:00Z`).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
const nombrePais = (() => {
  try {
    const d = new Intl.DisplayNames(["es"], { type: "region" });
    return (c: string) => (c.length === 2 ? d.of(c) ?? c : c);
  } catch {
    return (c: string) => c;
  }
})();
const DISPOSITIVOS: Record<string, string> = { movil: "Móvil", ordenador: "Ordenador", tablet: "Tablet" };
const SIN_DATO = "Sin dato (antes del 18/10)";
const canalTexto = (c: string | null) => (!c || c === "Sin dato" ? SIN_DATO : c);
const visitasTexto = (n: number) => `${numero(n)} ${n === 1 ? "visita" : "visitas"}`;
const segundosTexto = (s: number | null | undefined) =>
  s == null ? "—" : s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;

function rango(periodo: Periodo) {
  const hasta = hoyMadrid();
  if (periodo === "todo") return { desde: INICIO_MEDICION, hasta };
  const dias = PERIODOS.find((p) => p.id === periodo)!.dias;
  return { desde: restarDias(hasta, dias - 1), hasta };
}

function leerSesion(): Sesion | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE) ?? "null") as Sesion | null;
    return s && s.expira * 1000 > Date.now() + 60_000 ? s : null;
  } catch {
    return null;
  }
}

export default function Panel() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSesion(leerSesion());
    setListo(true);
  }, []);

  const salir = useCallback(() => {
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {}
    setSesion(null);
    setDatos(null);
  }, []);

  const cargar = useCallback(async () => {
    if (!sesion) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/panel/datos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sesion.token}` },
        body: JSON.stringify(rango(periodo)),
      });
      if (res.status === 401) return salir();
      if (res.status === 403) {
        setError("Esta cuenta no es de administración: no puede ver el panel.");
        setDatos(null);
        return;
      }
      if (!res.ok) throw new Error();
      setDatos(await res.json());
    } catch {
      setError("No se han podido cargar los datos. Prueba otra vez en un momento.");
    } finally {
      setCargando(false);
    }
  }, [sesion, periodo, salir]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (!listo) return <div className="min-h-[60vh]" />;
  if (!sesion) return <Entrar onEntrar={setSesion} />;

  return (
    <div className="bg-bg pb-24 pt-28 sm:pt-32">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-tight text-text">Panel de la web</h1>
            <p className="mt-2 text-sm text-text-muted">
              Visitas, canales y altas de kuovahealth.com, sin cookies · {sesion.email} ·{" "}
              <button type="button" onClick={salir} className="underline underline-offset-2 hover:text-text">
                Salir
              </button>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-border bg-surface p-1" role="tablist" aria-label="Periodo">
              {PERIODOS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={periodo === p.id}
                  onClick={() => setPeriodo(p.id)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${periodo === p.id ? "bg-accent text-on-accent" : "text-text-muted hover:text-text"}`}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void cargar()}
              disabled={cargando}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition-colors hover:bg-surface-hover disabled:opacity-60"
            >
              {cargando ? "Cargando…" : "Actualizar"}
            </button>
          </div>
        </div>

        {error && <p className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text">{error}</p>}
        {datos ? <Contenido datos={datos} /> : !error && <p className="mt-10 text-sm text-text-muted">Cargando…</p>}
        <GeneradorEnlaces />
        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-text-muted">
          Cómo se cuenta: cada página cargada es una visita; los visitantes se cuentan por día con una huella anónima que cambia cada
          día (sin cookies), así que quien vuelve otro día cuenta otra vez. La conversión es altas entre visitantes. El canal sale de la
          etiqueta del enlace (utm_…) o de la web de la que llega la persona. Las pruebas (fuente «prueba-local») no aparecen. Para que
          tus visitas no cuenten, abre una vez kuovahealth.com/?no-contar=1 en cada navegador que uses.
        </p>
      </Container>
    </div>
  );
}

function Entrar({ onEntrar }: { onEntrar: (s: Sesion) => void }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/panel/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Email o contraseña incorrectos." : "No se ha podido entrar. Prueba otra vez.");
        return;
      }
      const s = (await res.json()) as Sesion;
      try {
        sessionStorage.setItem(CLAVE, JSON.stringify(s));
      } catch {}
      onEntrar(s);
    } catch {
      setError("No se ha podido entrar. Prueba otra vez.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center bg-bg pt-24">
      <Container>
        <form onSubmit={enviar} className="mx-auto max-w-sm rounded-3xl border border-border bg-surface p-7">
          <h1 className="font-display text-3xl tracking-tight text-text">Panel de la web</h1>
          <p className="mt-2 text-sm text-text-muted">Entra con tu cuenta de KUOVA (la misma de la app). Solo las cuentas de administración ven los datos.</p>
          <label className="mt-6 block text-sm text-text" htmlFor="panel-email">
            Email
          </label>
          <input id="panel-email" name="email" type="email" required autoComplete="email" className="mt-1.5 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-text focus:border-accent focus:outline-none" />
          <label className="mt-4 block text-sm text-text" htmlFor="panel-password">
            Contraseña
          </label>
          <input id="panel-password" name="password" type="password" required autoComplete="current-password" className="mt-1.5 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-text focus:border-accent focus:outline-none" />
          {error && <p className="mt-3 text-sm text-[#a2462c]">{error}</p>}
          <button type="submit" disabled={enviando} className="mt-6 w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-70">
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </Container>
    </div>
  );
}

export function Contenido({ datos }: { datos: Datos }) {
  const r = datos.resumen;
  const diasVisitas = datos.diario.map((d) => ({ etiqueta: diaCorto(d.dia), valor: d.visitantes, detalle: `${numero(d.visitas)} visitas` }));
  const diasAltas = datos.diario.map((d) => ({ etiqueta: diaCorto(d.dia), valor: d.altas }));
  const secciones = useMemo(() => {
    const vistas = new Map(datos.secciones.map((s) => [s.seccion, s.visitas]));
    return SECCIONES.map(([id, nombre]) => ({ etiqueta: nombre, valor: vistas.get(id) ?? 0, extra: porcentaje(vistas.get(id) ?? 0, datos.embudo.visitas) }));
  }, [datos]);
  const e = datos.embudo;
  // Las altas de antes del 18/10 no tienen canal: la conversión solo cuenta las medidas
  const altasMedidas = datos.canales.filter((c) => c.canal !== "Sin dato").reduce((t, c) => t + c.altas, 0);

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Cifra etiqueta="Visitantes únicos" valor={numero(r.visitantes)} anterior={{ ahora: r.visitantes, antes: r.visitantes_ant }} nota={`${numero(r.visitas)} páginas vistas`} />
        <Cifra etiqueta="Altas en la lista" valor={numero(r.altas)} anterior={{ ahora: r.altas, antes: r.altas_ant }} nota={`${numero(r.altas_total)} en total en la lista`} />
        <Cifra
          etiqueta="Conversión"
          valor={porcentaje(altasMedidas, r.visitantes)}
          nota={altasMedidas < r.altas ? `Altas medidas entre visitantes (${numero(r.altas - altasMedidas)} sin dato)` : "Altas entre visitantes"}
        />
        <Cifra etiqueta="Tiempo medio en la página" valor={segundosTexto(r.segundos)} nota={r.scroll != null ? `Bajan de media hasta el ${r.scroll} % de la página` : undefined} />
      </div>

      {datos.diario.length > 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Tarjeta titulo="Visitantes por día">
            <Columnas datos={diasVisitas} color={VERDE} nombre="visitantes" />
          </Tarjeta>
          <Tarjeta titulo="Altas por día">
            <Columnas datos={diasAltas} color={DORADO} nombre="altas" />
          </Tarjeta>
        </div>
      )}

      <Tarjeta titulo="Por canal" subtitulo="De dónde llega la gente y cuánta se apunta. La barra son los visitantes.">
        {datos.canales.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="px-2 pb-2 font-medium">Canal</th>
                  <th className="px-2 pb-2 font-medium">Visitantes</th>
                  <th className="px-2 pb-2 text-right font-medium">Altas</th>
                  <th className="px-2 pb-2 text-right font-medium">Conversión</th>
                  <th className="px-2 pb-2 text-right font-medium">Tiempo medio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {datos.canales.map((c) => {
                  const max = Math.max(1, ...datos.canales.map((x) => x.visitantes));
                  return (
                    <tr key={c.canal}>
                      <td className="px-2 py-2.5 text-text">{canalTexto(c.canal)}</td>
                      <td className="px-2 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="h-3 rounded-r-[4px]" style={{ width: `${Math.max(c.visitantes ? 2 : 0, (c.visitantes / max) * 70)}%`, backgroundColor: VERDE }} />
                          <span className="tabular-nums text-text">{numero(c.visitantes)}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-text">{numero(c.altas)}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-text">{porcentaje(c.altas, c.visitantes)}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-text-muted">{segundosTexto(c.segundos)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Vacio />
        )}
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Embudo de la portada" subtitulo="De quien entra a quien se apunta. El porcentaje es sobre las visitas a la portada.">
          {e.visitas ? (
            <Barras
              filas={[
                { etiqueta: "Entran en la portada", valor: e.visitas, extra: "100 %" },
                { etiqueta: "Ven «Cómo funciona»", valor: e.como_funciona, extra: porcentaje(e.como_funciona, e.visitas) },
                { etiqueta: "Llegan a la lista", valor: e.lista, extra: porcentaje(e.lista, e.visitas) },
                { etiqueta: "Intentan apuntarse", valor: e.intento, extra: porcentaje(e.intento, e.visitas) },
                { etiqueta: "Se apuntan", valor: e.apuntados, extra: porcentaje(e.apuntados, e.visitas) },
              ]}
              total={e.visitas}
            />
          ) : (
            <Vacio />
          )}
        </Tarjeta>
        <Tarjeta titulo="Hasta dónde llegan" subtitulo="Qué parte de las visitas a la portada ve cada sección, en el orden de la página.">
          {e.visitas ? <Barras filas={secciones} total={e.visitas} /> : <Vacio />}
        </Tarjeta>
      </div>

      {datos.embudo_canal.length > 0 && (
        <Tarjeta titulo="Embudo por canal" subtitulo="Qué canal trae gente que lee y se apunta.">
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="px-2 pb-2 font-medium">Canal</th>
                  <th className="px-2 pb-2 text-right font-medium">Visitas</th>
                  <th className="px-2 pb-2 text-right font-medium">Ven «Cómo funciona»</th>
                  <th className="px-2 pb-2 text-right font-medium">Llegan a la lista</th>
                  <th className="px-2 pb-2 text-right font-medium">Intentan</th>
                  <th className="px-2 pb-2 text-right font-medium">Se apuntan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {datos.embudo_canal.map((c) => (
                  <tr key={c.canal}>
                    <td className="px-2 py-2.5 text-text">{c.canal}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-text">{numero(c.visitas)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-text">{porcentaje(c.como_funciona, c.visitas)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-text">{porcentaje(c.lista, c.visitas)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-text">{porcentaje(c.intento, c.visitas)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-text">{porcentaje(c.apuntados, c.visitas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      )}

      <Tarjeta titulo="Fuentes y campañas" subtitulo="El detalle de cada enlace etiquetado (fuente, medio, campaña y contenido) y de cada web de origen.">
        {datos.campanas.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="px-2 pb-2 font-medium">Canal</th>
                  <th className="px-2 pb-2 font-medium">Fuente</th>
                  <th className="px-2 pb-2 font-medium">Medio</th>
                  <th className="px-2 pb-2 font-medium">Campaña</th>
                  <th className="px-2 pb-2 font-medium">Contenido</th>
                  <th className="px-2 pb-2 text-right font-medium">Visitantes</th>
                  <th className="px-2 pb-2 text-right font-medium">Altas</th>
                  <th className="px-2 pb-2 text-right font-medium">Conversión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {datos.campanas.map((c, i) => (
                  <tr key={i}>
                    <td className="px-2 py-2 text-text">{canalTexto(c.canal)}</td>
                    <td className="px-2 py-2 text-text">{c.fuente}</td>
                    <td className="px-2 py-2 text-text-muted">{c.medio}</td>
                    <td className="px-2 py-2 text-text-muted">{c.campana}</td>
                    <td className="px-2 py-2 text-text-muted">{c.contenido}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">{numero(c.visitantes)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">{numero(c.altas)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-text">{porcentaje(c.altas, c.visitantes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vacio />
        )}
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Qué pulsan" subtitulo="Botones, enlaces y preguntas, con la zona de la página.">
          <Barras filas={datos.clics.map((c) => ({ etiqueta: c.elemento, valor: c.clics, extra: visitasTexto(c.visitas) }))} />
        </Tarjeta>
        <Tarjeta titulo="Dispositivos y navegadores" subtitulo="Visitantes. «(app)» es el navegador de dentro de Instagram, TikTok…">
          <Barras filas={datos.dispositivos.map((d) => ({ etiqueta: DISPOSITIVOS[d.nombre] ?? d.nombre, valor: d.visitantes, extra: porcentaje(d.visitantes, r.visitantes) }))} />
          <div className="mt-6">
            <Barras filas={datos.navegadores.map((d) => ({ etiqueta: d.nombre, valor: d.visitantes }))} />
          </div>
        </Tarjeta>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Países" subtitulo="Visitantes, según su conexión.">
          <Barras filas={datos.paises.map((d) => ({ etiqueta: nombrePais(d.nombre), valor: d.visitantes, extra: porcentaje(d.visitantes, r.visitantes) }))} />
        </Tarjeta>
        <Tarjeta titulo="Ciudades" subtitulo="Aproximadas, según la conexión.">
          <Barras filas={datos.ciudades.map((d) => ({ etiqueta: d.nombre, valor: d.visitantes }))} />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Últimas altas" subtitulo="Quién se ha apuntado en este periodo y por dónde llegó (máximo 50).">
        {datos.altas_recientes.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="px-2 pb-2 font-medium">Cuándo</th>
                  <th className="px-2 pb-2 font-medium">Email</th>
                  <th className="px-2 pb-2 font-medium">Canal</th>
                  <th className="px-2 pb-2 font-medium">Fuente · campaña</th>
                  <th className="px-2 pb-2 font-medium">Dispositivo</th>
                  <th className="px-2 pb-2 font-medium">Ciudad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {datos.altas_recientes.map((a) => (
                  <tr key={a.email + a.fecha}>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-text-muted">{fechaHora(a.fecha)}</td>
                    <td className="px-2 py-2 text-text">
                      {a.email}
                      {a.baja && <span className="ml-2 text-xs text-text-muted">(baja)</span>}
                    </td>
                    <td className="px-2 py-2 text-text">{canalTexto(a.canal)}</td>
                    <td className="px-2 py-2 text-text-muted">{[a.fuente, a.campana].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="px-2 py-2 text-text-muted">{a.dispositivo ? DISPOSITIVOS[a.dispositivo] ?? a.dispositivo : "—"}</td>
                    <td className="px-2 py-2 text-text-muted">{[a.ciudad, a.pais && nombrePais(a.pais)].filter(Boolean).join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vacio texto="Nadie se ha apuntado en este periodo." />
        )}
      </Tarjeta>
    </div>
  );
}

// Generador de enlaces etiquetados (UTM) para cada publicación, email o QR
const FUENTES = ["instagram", "tiktok", "linkedin", "facebook", "x", "youtube", "newsletter", "firma", "whatsapp", "folleto", "meta", "google"];
const MEDIOS = ["bio", "reel", "story", "post", "social", "email", "mensaje", "qr", "paid_social", "cpc", "colaboracion"];
const limpiar = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_.]+/g, "-")
    .replace(/^-+|-+$/g, "");

function GeneradorEnlaces() {
  const [fuente, setFuente] = useState("instagram");
  const [medio, setMedio] = useState("bio");
  const [campana, setCampana] = useState("");
  const [contenido, setContenido] = useState("");
  const [copiado, setCopiado] = useState(false);
  const params = new URLSearchParams();
  if (limpiar(fuente)) params.set("utm_source", limpiar(fuente));
  if (limpiar(medio)) params.set("utm_medium", limpiar(medio));
  if (limpiar(campana)) params.set("utm_campaign", limpiar(campana));
  if (limpiar(contenido)) params.set("utm_content", limpiar(contenido));
  const enlace = `https://kuovahealth.com/?${params.toString()}`;
  const campo = "mt-1.5 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none";

  return (
    <div className="mt-6">
      <Tarjeta titulo="Crear un enlace etiquetado" subtitulo="Para que cada publicación, email o QR cuente en su canal. Copia el enlace y úsalo tal cual.">
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="text-sm text-text">
            Dónde lo publicas
            <input list="panel-fuentes" value={fuente} onChange={(e) => setFuente(e.target.value)} className={campo} />
          </label>
          <label className="text-sm text-text">
            Tipo
            <input list="panel-medios" value={medio} onChange={(e) => setMedio(e.target.value)} className={campo} />
          </label>
          <label className="text-sm text-text">
            Campaña (opcional)
            <input value={campana} onChange={(e) => setCampana(e.target.value)} placeholder="lanzamiento" className={campo} />
          </label>
          <label className="text-sm text-text">
            Pieza (opcional)
            <input value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="reel-edad-kuova" className={campo} />
          </label>
        </div>
        <datalist id="panel-fuentes">
          {FUENTES.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
        <datalist id="panel-medios">
          {MEDIOS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 break-all rounded-xl bg-bg px-3 py-2.5 text-xs text-text">{enlace}</code>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(enlace).then(() => {
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1500);
              });
            }}
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
          >
            {copiado ? "Copiado" : "Copiar enlace"}
          </button>
        </div>
      </Tarjeta>
    </div>
  );
}

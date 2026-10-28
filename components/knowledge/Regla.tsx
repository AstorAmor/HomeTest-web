"use client";

import { useId, useRef, useState } from "react";
import Inline from "./Inline";
import Tabla from "./Tabla";
import { medir } from "@/lib/medicion";
import { aOtra, aPrincipal, fmt, leerCifra, posicion, rangoTexto, tablaDe, tramoDe, type Regla as DatosRegla } from "@/lib/regla";

// Regla de cifras de una ficha («escribe tu cifra»): la persona escribe el resultado de su informe y
// ve en qué tramo de la guía cae, qué significa y qué mirar a la vez. Debajo, los tramos en tabla.
//
// La cifra es un dato de salud y vive solo en este componente: no va a la medición, ni a la
// dirección, ni se guarda en el navegador. Lo único que se mide es que se usó la regla en esta ficha
// (una vez por visita, sin la cifra). Los botones llevan data-medir para que la medición de clics
// no copie su texto.

// Tonos de la marca, según lo lejos que esté cada tramo del de referencia (sin semáforo: el tramo se
// reconoce también sin color, por su etiqueta, sus cifras y el texto)
const TONOS = ["bg-warm/45", "bg-gold/55", "bg-accent-light/40", "bg-accent-light/70"];

export default function Regla({ regla: r, ficha }: { regla: DatosRegla; ficha: string }) {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [otra, setOtra] = useState(false);
  const medida = useRef(false);

  const unidad = otra && r.otra ? r.otra.unidad : r.unidad;
  const cabe = (v: number) => !r.posible || (v >= r.posible[0] && v <= r.posible[1]);
  const cifra = leerCifra(texto);
  const enPrincipal = cifra === null ? null : aPrincipal(r, cifra, otra);
  const valida = enPrincipal !== null && cabe(enPrincipal);
  // Si la cifra no tiene sentido en esta unidad pero sí en la otra, se ofrece cambiar
  const sugerir = cifra !== null && !valida && r.otra !== null && cabe(aPrincipal(r, cifra, !otra));
  const t = valida ? tramoDe(r, cifra!, otra) : null;
  const pos = valida ? posicion(r, enPrincipal!) : 0;
  const escrita = texto.match(/\d+(?:[.,]\d+)?/)?.[0].replace(".", ",") ?? "";
  const equivalente =
    valida && r.otra
      ? otra
        ? `${fmt(enPrincipal!, r.decimales)} ${r.unidad}`
        : `${fmt(aOtra(r, cifra!), r.otra.decimales)} ${r.otra.unidad}`
      : "";

  // Dónde empieza cada tramo en la barra (0-100 %) y cuánto ocupa
  const cortes = r.tramos.map((tr) => (tr.desde === null ? 0 : posicion(r, tr.desde)));
  const anchos = cortes.map((c, i) => (cortes[i + 1] ?? 100) - c);
  const tabla = tablaDe(r);

  const cambiar = (v: string) => {
    setTexto(v);
    const c = leerCifra(v);
    if (!medida.current && c !== null && cabe(aPrincipal(r, c, otra))) {
      medida.current = true;
      medir("regla", ficha);
    }
  };

  return (
    <section aria-labelledby={`${id}-titulo`} className="my-8">
      <div className="rounded-2xl border border-border bg-surface px-5 py-6 sm:px-7 sm:py-7">
        <h3 id={`${id}-titulo`} className="font-display text-xl font-medium text-text sm:text-2xl">
          {r.titulo}
        </h3>

        <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-3">
          <div>
            <label htmlFor={`${id}-cifra`} className="block text-sm font-semibold text-text">
              Escribe tu cifra
            </label>
            <input
              id={`${id}-cifra`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={texto}
              onChange={(e) => cambiar(e.target.value)}
              placeholder={r.ejemplo ? `Por ejemplo, ${r.ejemplo}` : undefined}
              aria-describedby={`${id}-resultado`}
              className="mt-2 w-44 rounded-xl border border-border bg-bg px-4 py-2.5 text-lg tabular-nums text-text placeholder:text-base placeholder:text-text-muted/70 focus:border-accent-light focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          {r.otra ? (
            <fieldset className="pb-1">
              <legend className="sr-only">Unidad de tu informe</legend>
              <div className="inline-flex rounded-full border border-border bg-bg-soft p-1 text-sm">
                {[r.unidad, r.otra.unidad].map((u, i) => {
                  const on = (i === 1) === otra;
                  return (
                    <label
                      key={u}
                      className={`cursor-pointer rounded-full px-3.5 py-1.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/60 ${on ? "bg-surface font-semibold text-text shadow-sm" : "text-text-muted hover:text-text"}`}
                    >
                      <input type="radio" name={`${id}-unidad`} className="sr-only" checked={on} onChange={() => setOtra(i === 1)} />
                      {u}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <span className="pb-3 text-text-muted">{r.unidad}</span>
          )}
        </div>

        {/* La barra es solo visual: lo mismo está en el texto de debajo y en la tabla */}
        <div aria-hidden className="mt-7">
          <div className="relative h-7">
            {valida && (
              <span
                className="absolute bottom-1.5 whitespace-nowrap rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold tabular-nums text-on-accent"
                style={{ left: `${pos}%`, transform: `translateX(-${pos}%)` }}
              >
                {enPrincipal! < r.extremos[0] && "‹ "}
                {escrita} {unidad}
                {enPrincipal! > r.extremos[1] && " ›"}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="flex h-3 overflow-hidden rounded-full">
              {r.tramos.map((tr, i) => (
                <div
                  key={i}
                  className={`h-full border-l-2 border-surface transition-opacity first:border-l-0 ${TONOS[Math.min(TONOS.length - 1, Math.abs(i - r.normal))]} ${t !== null && t !== i ? "opacity-30" : ""}`}
                  style={{ width: `${anchos[i]}%` }}
                />
              ))}
            </div>
            {valida && (
              <span className="absolute -top-1.5 h-6 w-1 -translate-x-1/2 rounded-full bg-accent ring-2 ring-surface" style={{ left: `${pos}%` }} />
            )}
          </div>
          <div className="relative mt-1.5 h-4 text-xs tabular-nums text-text-muted">
            {r.tramos.map((tr, i) => {
              const d = otra ? tr.desdeOtra : tr.desde;
              return i > 0 && d !== null ? (
                <span key={i} className="absolute -translate-x-1/2" style={{ left: `${cortes[i]}%` }}>
                  {fmt(d, otra && r.otra ? r.otra.decimales : r.decimales)}
                </span>
              ) : null;
            })}
          </div>
          <div className="mt-2 flex text-center text-xs leading-tight">
            {r.tramos.map((tr, i) => (
              <span key={i} className={`px-1 ${t === i ? "font-semibold text-text" : "text-text-muted"}`} style={{ width: `${anchos[i]}%` }}>
                {tr.etiqueta}
              </span>
            ))}
          </div>
        </div>

        <div id={`${id}-resultado`} className="mt-6 rounded-xl bg-bg-soft/70 px-4 py-4 text-[0.95rem] leading-relaxed sm:px-5">
          <p aria-live="polite" className={valida ? "font-semibold text-text" : "text-text-muted"}>
            {cifra === null
              ? "Escribe el resultado tal como sale en tu informe y verás en qué tramo cae."
              : !valida
                ? `${escrita} no parece una cifra en ${unidad}. Comprueba la unidad en tu informe.`
                : `${escrita} ${unidad}${equivalente ? ` (${equivalente})` : ""}: tramo «${r.tramos[t!].etiqueta}», ${rangoTexto(r, t!, otra).toLowerCase()} ${unidad}.`}
          </p>
          {sugerir && r.otra && (
            <button
              type="button"
              data-medir="Regla: cambiar unidad"
              onClick={() => setOtra(!otra)}
              className="mt-3 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-accent-light transition-colors hover:text-accent"
            >
              Cambiar a {otra ? r.unidad : r.otra.unidad}
            </button>
          )}
          {valida && (
            <>
              <p className="mt-3 text-text/90">
                <Inline text={r.tramos[t!].texto} />
              </p>
              {r.mirar && (
                <p className="mt-3 text-text/90">
                  <strong className="font-semibold text-text">Mira también: </strong>
                  <Inline text={r.mirar} />
                </p>
              )}
              <p className="mt-3 text-sm text-text/90">
                En Kuova tus resultados se guardan en tu historial y ves cómo se mueven de un análisis a otro. Llega muy pronto a
                España:{" "}
                <a href="/#lista-de-espera" className="font-medium text-accent-light underline decoration-1 underline-offset-2 hover:text-accent">
                  apúntate a la lista de espera
                </a>
                .
              </p>
            </>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          Es orientativo, no un diagnóstico: manda el rango de tu informe, y quien valora tu resultado es tu médico. Tu cifra no sale
          de este navegador: no se guarda ni se envía.
        </p>
      </div>

      <Tabla head={tabla.head} rows={tabla.rows} activa={t} className="mt-6" />
      {r.otra?.nota && (
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          <Inline text={r.otra.nota} />
        </p>
      )}
    </section>
  );
}

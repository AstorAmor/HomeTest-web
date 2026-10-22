"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import textos from "@/content/newsletter.json";
import { localePath } from "@/lib/locale";
import { datosDeLlegada, medir } from "@/lib/medicion";
import { estadoNewsletter, recordarNewsletter } from "@/lib/newsletter-navegador";

type Estado = "idle" | "sending" | "done" | "error" | "consent";

// Alta en la newsletter Kuova Letter (al final de las guías y artículos, en /aprende y en /newsletter):
// email, casilla de consentimiento obligatoria y sin marcar, y otra opcional para medir los clics por
// persona. Lo guarda /api/newsletter y Brevo manda el email de doble confirmación. Si este navegador ya
// se apuntó (lib/newsletter-navegador.ts), en vez del formulario dice «Ya estás suscrito» o «Falta
// confirmar tu email». Con sinCabecera no repite el nombre (para /newsletter, que ya lo lleva arriba).
// Textos en content/newsletter.json.
export default function FormularioNewsletter({
  lang = "es",
  sinCabecera = false,
  className = "mb-14 mt-14",
}: {
  lang?: "es" | "en";
  sinCabecera?: boolean;
  className?: string;
}) {
  const t = textos[lang];
  const [estado, setEstado] = useState<Estado>("idle");
  const [recordado, setRecordado] = useState<"suscrito" | "pendiente" | null>(null);
  useEffect(() => setRecordado(estadoNewsletter()), []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("consentimiento") !== "si") return setEstado("consent");
    setEstado("sending");
    medir("clic", "Newsletter · Suscribirme");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          website: form.get("website"),
          consentimiento: true,
          medicion: form.get("medicion") === "si",
          origen: "formulario",
          lang,
          ...datosDeLlegada(),
        }),
      });
      setEstado(res.ok ? "done" : "error");
      if (res.ok) recordarNewsletter("pendiente");
    } catch {
      setEstado("error");
    }
  }

  // Ya se apuntó desde este navegador: se dice en qué punto está en vez de volver a pedírselo
  if (recordado && estado !== "done") {
    return (
      <section role="status" className={`${className} rounded-2xl border border-border bg-bg-soft px-6 py-6 sm:px-8`}>
        {!sinCabecera && <p className="font-logo text-xs font-semibold uppercase tracking-[0.14em] text-accent-light">{t.eyebrow}</p>}
        <p className={`${sinCabecera ? "" : "mt-2 "}font-display text-xl text-text sm:text-2xl`}>
          {recordado === "suscrito" ? t.suscrito_titulo : t.pendiente_titulo}
        </p>
        <p className="mt-1.5 text-text-muted">{recordado === "suscrito" ? t.suscrito_texto : t.pendiente_texto}</p>
      </section>
    );
  }

  return (
    <section aria-label={t.titulo} className={`${className} rounded-2xl border border-border bg-bg-soft px-6 py-7 sm:px-8`}>
      {!sinCabecera && (
        <>
          <p className="font-logo text-xs font-semibold uppercase tracking-[0.14em] text-accent-light">{t.eyebrow}</p>
          <h2 className="mt-2 font-display text-2xl font-medium text-text sm:text-[1.75rem]">{t.titulo}</h2>
        </>
      )}
      {estado === "done" ? (
        <div role="status" className="mt-4">
          <p className="text-lg font-semibold text-text">{t.ok_titulo}</p>
          <p className="mt-1 text-text-muted">{t.ok_texto}</p>
        </div>
      ) : (
        <form onSubmit={enviar} className={sinCabecera ? "" : "mt-3"}>
          {/* En /newsletter la presentación ya está arriba: no se repite */}
          {!sinCabecera && <p className="text-text-muted">{t.texto}</p>}
          <div className={`${sinCabecera ? "" : "mt-5 "}flex flex-col gap-3 sm:flex-row`}>
            <label htmlFor="newsletter-email" className="sr-only">
              {t.placeholder}
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t.placeholder}
              className="w-full min-w-0 rounded-full border border-border bg-white px-5 py-3 text-[15px] text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={estado === "sending"}
              className="shrink-0 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {estado === "sending" ? t.enviando : t.boton}
            </button>
          </div>

          {/* Trampa para bots: invisible para las personas; si llega rellena, no se guarda nada */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />

          <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-text">
            <input type="checkbox" name="consentimiento" value="si" className="mt-1 h-4 w-4 shrink-0 accent-[#0E2A2A]" />
            <span>{t.consentimiento}</span>
          </label>
          <label className="mt-2 flex items-start gap-3 text-sm leading-relaxed text-text-muted">
            <input type="checkbox" name="medicion" value="si" className="mt-1 h-4 w-4 shrink-0 accent-[#0E2A2A]" />
            <span>{t.medicion}</span>
          </label>

          <p aria-live="polite" className="mt-3 min-h-5 text-sm text-[#9E3B32]">
            {estado === "error" && t.error}
            {estado === "consent" && t.falta_consentimiento}
          </p>
          <p className="text-xs text-text-muted">
            {t.privacidad_antes}{" "}
            <Link href={localePath(lang, "/privacy")} className="underline underline-offset-2 hover:text-text">
              {t.privacidad}
            </Link>
            .
          </p>
        </form>
      )}
    </section>
  );
}

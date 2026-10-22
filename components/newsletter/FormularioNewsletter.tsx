"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import textos from "@/content/newsletter.json";
import { localePath } from "@/lib/locale";
import { datosDeLlegada, medir } from "@/lib/medicion";
import { recordarNewsletter, yaApuntado } from "@/lib/newsletter-navegador";

type Estado = "idle" | "sending" | "done" | "error" | "consent";

// Alta en la newsletter Kuova Letter (debajo de los artículos de /conocimiento): email, casilla de
// consentimiento obligatoria y sin marcar, y otra opcional para medir los clics por persona. Lo guarda
// /api/newsletter y Brevo manda el email de doble confirmación. Si este navegador ya se apuntó
// (lib/newsletter-navegador.ts), no se muestra. Textos en content/newsletter.json.
export default function FormularioNewsletter({ lang = "es" }: { lang?: "es" | "en" }) {
  const t = textos[lang];
  const [estado, setEstado] = useState<Estado>("idle");
  const [apuntado, setApuntado] = useState(false);
  useEffect(() => setApuntado(yaApuntado()), []);

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

  if (apuntado) return null;

  return (
    <section aria-labelledby="newsletter-titulo" className="mb-14 mt-14 rounded-2xl border border-border bg-bg-soft px-6 py-7 sm:px-8">
      <p className="font-logo text-xs font-semibold uppercase tracking-[0.14em] text-accent-light">{t.eyebrow}</p>
      <h2 id="newsletter-titulo" className="mt-2 font-display text-2xl font-medium text-text sm:text-[1.75rem]">
        {t.titulo}
      </h2>
      {estado === "done" ? (
        <div role="status" className="mt-4">
          <p className="text-lg font-semibold text-text">{t.ok_titulo}</p>
          <p className="mt-1 text-text-muted">{t.ok_texto}</p>
        </div>
      ) : (
        <form onSubmit={enviar} className="mt-3">
          <p className="text-text-muted">{t.texto}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
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

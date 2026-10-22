"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import textosNewsletter from "@/content/newsletter.json";
import type { Inicio } from "@/lib/content";
import { NEWSLETTER } from "@/lib/launch";
import { localePath, type Lang } from "@/lib/locale";
import { datosDeLlegada, medir } from "@/lib/medicion";
import { recordarNewsletter, yaApuntado } from "@/lib/newsletter-navegador";

type Estado = "idle" | "sending" | "done" | "error";

// Lista de espera de la portada completa: el email, guardado por /api/waitlist en Supabase (la
// misma lista que la página de pre-lanzamiento) junto con por dónde llegó la persona
// (lib/medicion.ts). Textos en content/inicio.json → "lista". Con la newsletter activa (lib/launch.ts),
// una casilla aparte y sin marcar apunta también a Kuova Letter (doble confirmación por email); no
// sale si este navegador ya se apuntó (lib/newsletter-navegador.ts).
export default function FormularioEspera({ copy, lang }: { copy: Inicio["lista"]; lang: Lang }) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [newsletter, setNewsletter] = useState(false);
  const [apuntado, setApuntado] = useState(false);
  useEffect(() => setApuntado(yaApuntado()), []);
  const tn = textosNewsletter[lang];

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEstado("sending");
    medir("registro_intento");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website"), lang, ...datosDeLlegada() }),
      });
      setEstado(res.ok ? "done" : "error");
      medir(res.ok ? "registro_ok" : "registro_error", res.ok ? undefined : String(res.status));
      const quiere = NEWSLETTER && form.get("newsletter") === "si";
      setNewsletter(res.ok && quiere);
      if (res.ok && quiere) {
        void fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.get("email"), consentimiento: true, origen: "lista-de-espera", lang, ...datosDeLlegada() }),
        })
          .then((r) => r.ok && recordarNewsletter("pendiente"))
          .catch(() => {});
      }
    } catch {
      setEstado("error");
      medir("registro_error", "red");
    }
  }

  if (estado === "done") {
    return (
      <div role="status" className="rounded-3xl border border-gold/30 bg-white/[0.06] px-6 py-7 text-center backdrop-blur-md">
        <p className="font-display text-2xl">{copy.exito_titulo}</p>
        <p className="mt-2 text-sm text-on-accent/70">{copy.exito_texto}</p>
        {newsletter && <p className="mt-2 text-sm text-on-accent/70">{tn.ok_texto}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={enviar}>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:rounded-full sm:border sm:border-white/15 sm:bg-white/[0.06] sm:p-1.5 sm:backdrop-blur-md sm:transition-colors sm:focus-within:border-gold/60">
        <label htmlFor="lista-email" className="sr-only">
          {copy.placeholder}
        </label>
        <input
          id="lista-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={copy.placeholder}
          className="w-full min-w-0 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3.5 text-[15px] text-on-accent backdrop-blur-md placeholder:text-on-accent/45 focus:border-gold/60 focus:outline-none sm:border-0 sm:bg-transparent sm:py-2.5 sm:backdrop-blur-none"
        />
        <button
          type="submit"
          disabled={estado === "sending"}
          className="shrink-0 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-[#d6b47f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-70 sm:py-2.5"
        >
          {estado === "sending" ? copy.enviando : copy.boton}
        </button>
      </div>

      {/* Trampa para bots: invisible para las personas; si llega rellena, no se guarda nada */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />

      {NEWSLETTER && !apuntado && (
        <label className="mx-auto mt-4 flex max-w-md items-start gap-3 text-left text-xs leading-relaxed text-on-accent/75">
          <input type="checkbox" name="newsletter" value="si" className="mt-0.5 h-4 w-4 shrink-0 accent-[#C9A366]" />
          <span>{tn.lista_casilla}</span>
        </label>
      )}

      <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm text-[#f2c1ae]">
        {estado === "error" && copy.error}
      </p>
      <p className="text-center text-xs text-on-accent/55">
        {copy.nota}{" "}
        <Link href={localePath(lang, "/privacy")} className="underline decoration-on-accent/30 underline-offset-2 transition-colors hover:text-on-accent/80">
          {copy.privacidad}
        </Link>
      </p>
    </form>
  );
}

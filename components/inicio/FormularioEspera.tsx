"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { Inicio } from "@/lib/content";
import { localePath, type Lang } from "@/lib/locale";

type Estado = "idle" | "sending" | "done" | "error";

// Lista de espera de la portada completa: solo el email, guardado por /api/waitlist en Supabase
// (la misma lista que la página de pre-lanzamiento). Textos en content/inicio.json → "lista".
export default function FormularioEspera({ copy, lang }: { copy: Inicio["lista"]; lang: Lang }) {
  const [estado, setEstado] = useState<Estado>("idle");

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEstado("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website"), lang }),
      });
      setEstado(res.ok ? "done" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "done") {
    return (
      <div role="status" className="rounded-3xl border border-gold/30 bg-white/[0.06] px-6 py-7 text-center backdrop-blur-md">
        <p className="font-display text-2xl">{copy.exito_titulo}</p>
        <p className="mt-2 text-sm text-on-accent/70">{copy.exito_texto}</p>
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

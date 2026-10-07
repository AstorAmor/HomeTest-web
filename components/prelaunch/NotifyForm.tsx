"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

// Lista de espera de la portada: solo el email. Lo guarda /api/waitlist en Supabase.
export default function NotifyForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          website: form.get("website"),
          // Idioma del navegador: para escribirle luego en español o en inglés
          lang: navigator.language?.toLowerCase().startsWith("es") ? "es" : "en",
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-3xl border border-gold/30 bg-white/[0.06] px-6 py-7 backdrop-blur-md">
        <p className="font-display text-2xl">You&rsquo;re on the list.</p>
        <p className="mt-2 text-sm text-on-accent/70">We&rsquo;ll let you know as soon as Kuova is ready.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="notify-email" className="block font-display text-xl italic text-on-accent/90 sm:text-2xl">
        Be among the first to know more
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-0 sm:rounded-full sm:border sm:border-white/15 sm:bg-white/[0.06] sm:p-1.5 sm:backdrop-blur-md sm:transition-colors sm:focus-within:border-gold/60">
        <input
          id="notify-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          className="w-full min-w-0 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3.5 text-[15px] text-on-accent backdrop-blur-md placeholder:text-on-accent/45 focus:border-gold/60 focus:outline-none sm:border-0 sm:bg-transparent sm:py-2.5 sm:backdrop-blur-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="shrink-0 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-[#d6b47f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-70 sm:py-2.5"
        >
          {status === "sending" ? "Joining…" : "Join the list"}
        </button>
      </div>

      {/* Trampa para bots: invisible para las personas; si llega rellena, no se guarda nada */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-[#f2c1ae]">
        {status === "error" && "Something went wrong. Please try again."}
      </p>
      <p className="text-xs text-on-accent/50">
        Launch news only, no spam. Unsubscribe anytime.{" "}
        <Link href="/privacy" className="underline decoration-on-accent/30 underline-offset-2 transition-colors hover:text-on-accent/80">
          Privacy
        </Link>
      </p>
    </form>
  );
}

import Link from "next/link";
import { Fragment } from "react";
import { Wordmark } from "@/components/ui/Logo";
import copy from "@/content/prelaunch.json";
import NotifyForm from "./NotifyForm";
import SilkBackground from "./SilkBackground";
import TrendLine from "./TrendLine";

// Portada del pre-lanzamiento (lib/launch.ts): seda en movimiento, logo, claim, la curva de un
// biomarcador que se dibuja sola y lista de espera.
// Textos en content/prelaunch.json; en inglés a propósito (decisión del fundador, 2026-10-07).
export default function ComingSoon() {
  return (
    <section lang="en" className="prelaunch-home relative isolate flex min-h-[100dvh] flex-col text-on-accent">
      {/* Fondo fijo a la pantalla y más alto que ella (.prelaunch-bg): al rebotar la página o
          esconderse la barra del navegador en el móvil sigue viéndose la seda, no un verde liso */}
      <div aria-hidden className="prelaunch-bg pointer-events-none -z-10 bg-ink">
        <SilkBackground />
        {/* Velo en el centro: da contraste al texto sin apagar las ondas de los bordes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(9,29,25,0.6)_0%,rgba(9,29,25,0.2)_45%,transparent_72%)]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
        <h1 className="prelaunch-in flex flex-col items-center">
          <span className="sr-only">Kuova Health</span>
          <Wordmark className="h-9 w-auto sm:h-14" />
          <span aria-hidden className="mt-4 pl-[0.6em] font-logo text-[0.7rem] font-medium tracking-[0.6em] text-gold sm:mt-5 sm:text-sm">
            HEALTH
          </span>
        </h1>

        <p className="prelaunch-in mt-10 font-display text-4xl leading-tight sm:mt-12 sm:text-6xl" style={{ animationDelay: "0.25s" }}>
          {/* Cada frase del lema en una pieza: en el móvil parte entre frases, no a mitad. El espacio
              va fuera de las piezas; dentro de una pieza sin cortes no deja partir la línea */}
          {copy.lema.split(/(?<=\.)\s+/).map((frase, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="whitespace-nowrap">{frase}</span>
            </Fragment>
          ))}
        </p>

        <div className="prelaunch-in mt-8 w-full max-w-[19rem] sm:mt-10 sm:max-w-sm" style={{ animationDelay: "0.4s" }}>
          <TrendLine />
        </div>

        <div className="prelaunch-in mt-8 w-full max-w-md sm:mt-10" style={{ animationDelay: "0.55s" }}>
          <NotifyForm />
        </div>
      </div>

      <footer className="relative z-10 pb-6 text-center text-xs text-on-accent/45">
        © {new Date().getFullYear()} Kuova Health
        <span className="mx-2">·</span>
        <Link href="/privacy" className="transition-colors hover:text-on-accent/80">
          {copy.pie_privacidad}
        </Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="transition-colors hover:text-on-accent/80">
          {copy.pie_condiciones}
        </Link>
      </footer>
    </section>
  );
}

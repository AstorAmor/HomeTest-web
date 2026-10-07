import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";
import NotifyForm from "./NotifyForm";
import SilkBackground from "./SilkBackground";

// Portada del pre-lanzamiento (lib/launch.ts): seda en movimiento, logo, claim y lista de espera.
// Textos en inglés a propósito (decisión del fundador, 2026-10-07), iguales para todos los visitantes.
export default function ComingSoon() {
  return (
    <section lang="en" className="prelaunch-home relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-ink text-on-accent">
      <SilkBackground />
      {/* Velo en el centro: da contraste al texto sin apagar las ondas de los bordes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(9,29,25,0.6)_0%,rgba(9,29,25,0.2)_45%,transparent_72%)]"
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="prelaunch-in flex flex-col items-center">
          <span className="sr-only">Kuova Health</span>
          <Wordmark className="h-9 w-auto sm:h-14" />
          <span aria-hidden className="mt-4 pl-[0.6em] font-logo text-[0.7rem] font-medium tracking-[0.6em] text-gold sm:mt-5 sm:text-sm">
            HEALTH
          </span>
        </h1>

        <p className="prelaunch-in mt-12 font-display text-4xl leading-tight sm:mt-14 sm:text-6xl" style={{ animationDelay: "0.25s" }}>
          Know more. <span className="whitespace-nowrap">Live better.</span>
        </p>

        <div className="prelaunch-in mt-14 w-full max-w-md sm:mt-16" style={{ animationDelay: "0.5s" }}>
          <NotifyForm />
        </div>
      </div>

      <footer className="relative z-10 pb-6 text-center text-xs text-on-accent/45">
        © {new Date().getFullYear()} Kuova Health
        <span className="mx-2">·</span>
        <Link href="/privacy" className="transition-colors hover:text-on-accent/80">
          Privacy
        </Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="transition-colors hover:text-on-accent/80">
          Terms
        </Link>
      </footer>
    </section>
  );
}

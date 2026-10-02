"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "../ui/Container";
import type { SiteCopy } from "@/lib/content";

export default function Header({ copy }: { copy: SiteCopy }) {
  const [open, setOpen] = useState(false);
  const { marca, nav, ui } = copy;
  // Recarga completa (no <Link>): el middleware guarda el idioma y el servidor vuelve a pintar
  const langSwitch = `?lang=${ui.idioma_cambiar_codigo}`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link href="/" className="text-lg font-bold text-text">
            {marca.nombre}
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.enlaces.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className="text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                {enlace.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
          <a href={langSwitch} className="text-sm font-medium text-text-muted transition-colors hover:text-text">
            {ui.idioma_cambiar}
          </a>
          <Link
            href="/#lista-de-espera"
            className="hidden rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover md:inline-flex"
          >
            {nav.cta}
          </Link>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-text md:hidden"
            aria-label={ui.abrir_menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-border py-4 md:hidden">
            {nav.enlaces.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-surface hover:text-text"
              >
                {enlace.label}
              </Link>
            ))}
            <a href={langSwitch} className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-surface hover:text-text">
              {ui.idioma_cambiar}
            </a>
            <Link
              href="/#lista-de-espera"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-accent px-5 py-2.5 text-center text-sm font-semibold text-bg"
            >
              {nav.cta}
            </Link>
          </nav>
        )}
      </Container>
    </header>
  );
}

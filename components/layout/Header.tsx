"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SiteCopy } from "@/lib/content";
import { localePath, stripLang, type Lang } from "@/lib/locale";

// Cabecera flotante tipo "píldora": se lee igual sobre la foto del hero que sobre el crema.
export default function Header({ copy, lang }: { copy: SiteCopy; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const { marca, nav, ui } = copy;
  const path = stripLang(usePathname() ?? "/");
  // Recarga completa (no <Link>): el middleware guarda el idioma y lleva a su URL
  const langSwitch = `${localePath(lang, path)}?lang=${ui.idioma_cambiar_codigo}`;
  const to = (href: string) => localePath(lang, href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto max-w-content rounded-full border border-border/70 bg-bg/85 shadow-sm shadow-black/5 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between pl-5 pr-2 sm:h-16 sm:pl-7 sm:pr-3">
          <Link href={to("/")} className="font-display text-xl font-semibold tracking-tight text-text">
            {marca.nombre}
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {nav.enlaces.map((enlace) => (
              <Link
                key={enlace.href}
                href={to(enlace.href)}
                aria-current={path === enlace.href ? "page" : undefined}
                className="whitespace-nowrap text-sm font-medium text-text-muted transition-colors hover:text-text aria-[current=page]:text-text"
              >
                {enlace.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a href={langSwitch} hrefLang={ui.idioma_cambiar_codigo} className="px-2 text-sm font-medium text-text-muted transition-colors hover:text-text">
              {ui.idioma_cambiar}
            </a>
            <Link
              href={to("/#lista-de-espera")}
              className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              {nav.cta}
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text lg:hidden"
            aria-label={ui.abrir_menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
              ) : (
                <path d="M4 8h16M4 16h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="mx-auto mt-2 flex max-w-content flex-col gap-1 rounded-3xl border border-border bg-bg/95 p-3 shadow-lg backdrop-blur-md lg:hidden">
          {nav.enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={to(enlace.href)}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-base font-medium text-text hover:bg-surface"
            >
              {enlace.label}
            </Link>
          ))}
          <a href={langSwitch} hrefLang={ui.idioma_cambiar_codigo} className="rounded-2xl px-4 py-3 text-base font-medium text-text-muted hover:bg-surface">
            {ui.idioma_cambiar}
          </a>
          <Link
            href={to("/#lista-de-espera")}
            onClick={() => setOpen(false)}
            className="mt-1 rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-on-accent"
          >
            {nav.cta}
          </Link>
        </nav>
      )}
    </header>
  );
}

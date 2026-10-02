import Link from "next/link";
import Container from "../ui/Container";
import Marquee from "./Marquee";
import Reveal from "./Reveal";
import { fill, type PanelSystem, type SiteCopy } from "@/lib/content";
import { localePath, type Lang } from "@/lib/i18n";

// "Aprende sobre tu salud": cinta de biomarcadores + "110+ biomarcadores. Más que un número."
// con tarjetas por sistema del cuerpo (datos reales del panel, content/panel.json).
export default function Biomarkers({ copy, lang, panel }: { copy: SiteCopy; lang: Lang; panel: PanelSystem[] }) {
  const { aprende, biomarcadores } = copy.home;
  const ui = copy.ui;
  const names = panel.filter((s) => s.id !== "orina").flatMap((s) => s.marcadores.map((m) => m.nombre));
  const half = Math.ceil(names.length / 2);
  const systems = biomarcadores.sistemas
    .map((id) => panel.find((s) => s.id === id))
    .filter((s): s is PanelSystem => !!s);

  return (
    <section className="overflow-hidden bg-bg py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance font-display text-4xl font-medium tracking-tight text-text sm:text-6xl">{aprende.titulo}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-text-muted">{aprende.subtitulo}</p>
        </Reveal>
      </Container>

      <div className="mt-12 space-y-3">
        <Marquee
          items={names.slice(0, half)}
          duration={90}
          itemClassName="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text"
        />
        <Marquee
          items={names.slice(half)}
          duration={100}
          reverse
          itemClassName="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text"
        />
      </div>

      <Container>
        <div className="mt-24 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-text sm:text-6xl xl:text-7xl">
              {biomarcadores.titulo}
              <span className="block italic text-accent">{biomarcadores.destacado}</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-xl text-lg text-text-muted">{biomarcadores.subtitulo}</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {systems.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 80}>
              <Link
                href={`${localePath(lang, "/catalogo")}#${s.id}`}
                className="group flex h-full flex-col justify-between rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-accent"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-light">
                    {fill(ui.n_biomarcadores, s.marcadores.length)}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-medium text-text">{s.nombre}</h3>
                  <ul className="mt-4 space-y-1.5 text-sm text-text-muted">
                    {s.marcadores.slice(0, 3).map((m) => (
                      <li key={m.id}>{m.nombre}</li>
                    ))}
                    {s.marcadores.length > 3 && <li>{fill(ui.y_mas, s.marcadores.length - 3)}</li>}
                  </ul>
                </div>
                <span className="mt-6 text-accent transition-transform group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={localePath(lang, "/catalogo")}
            className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-text transition-colors hover:bg-surface"
          >
            {biomarcadores.cta}
          </Link>
        </div>
      </Container>
    </section>
  );
}

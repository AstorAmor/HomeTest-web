import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import { fill, getContent, isPending } from "@/lib/content";
import { getLang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata("catalogo", "/catalogo");
}

export default function CatalogoPage() {
  const { siteCopy, panel, panelTotal, bloquesBiomarcadores } = getContent(getLang());
  const { pagina_catalogo, ui } = siteCopy;

  return (
    <>
      <PageHero
        title={pagina_catalogo.titulo_hero}
        subtitle={`${pagina_catalogo.subtitulo_hero} ${fill(ui.total_biomarcadores, panelTotal)}`}
      />

      {/* Panel completo, por sistemas (content/panel.json, generado desde la app) */}
      <Section>
        <nav className="flex flex-wrap gap-2">
          {panel.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-text"
            >
              {s.nombre} <span className="text-text-muted/70">· {s.marcadores.length}</span>
            </a>
          ))}
        </nav>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {panel.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl font-medium text-text">{s.nombre}</h2>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent-light">
                  {fill(ui.n_biomarcadores, s.marcadores.length)}
                </span>
              </div>
              <ul className="mt-5 divide-y divide-border">
                {s.marcadores.map((m) => (
                  <li key={m.id} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <span className="text-text">{m.nombre}</span>
                    <span className="shrink-0 text-xs text-text-muted">{m.muestra}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm text-text-muted">{pagina_catalogo.panel_nota}</p>
      </Section>

      {/* Packs por objetivo (content/biomarcadores/bloque-*.json) */}
      <Section soft>
        <h2 className="font-display text-4xl font-medium tracking-tight text-text sm:text-5xl">{pagina_catalogo.packs_titulo}</h2>
        <p className="mt-3 text-lg text-text-muted">{pagina_catalogo.packs_subtitulo}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {bloquesBiomarcadores.map((bloque) => (
            <div key={bloque.bloque_id} className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <h3 className="font-display text-2xl font-medium text-text">{bloque.titulo}</h3>
              <p className="mt-2 text-text-muted">{bloque.descripcion}</p>
              <ul className="mt-5 divide-y divide-border">
                {bloque.biomarcadores.map((m) => (
                  <li key={m.id} className="py-2.5 text-sm">
                    <span className="text-text">{m.nombre}</span>
                    <span className="block text-xs text-text-muted">
                      {ui.muestra}: {m.muestra}
                    </span>
                    {!isPending(m.explicacion) && <span className="mt-1 block text-text-muted">{m.explicacion}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

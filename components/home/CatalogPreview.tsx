import Link from "next/link";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import { bloquesBiomarcadores, siteCopy } from "@/lib/content";

export default function CatalogPreview() {
  const { catalogo_preview } = siteCopy;

  return (
    <Section>
      <SectionHeading
        title={catalogo_preview.titulo_seccion}
        subtitle={catalogo_preview.subtitulo_seccion}
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {bloquesBiomarcadores.map((bloque) => (
          <Link
            key={bloque.bloque_id}
            href="/catalogo"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent hover:bg-surface-hover"
          >
            <div>
              <h3 className="text-lg font-semibold text-text">{bloque.titulo}</h3>
              <p className="mt-2 text-sm text-text-muted">{bloque.descripcion}</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              {/* Conteo calculado dinámicamente a partir del JSON, nunca a mano */}
              <span className="text-sm font-medium text-accent-light">
                {bloque.biomarcadores.length} biomarcadores
              </span>
              <span className="text-accent transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface"
        >
          {catalogo_preview.cta_ver_catalogo}
        </Link>
      </div>
    </Section>
  );
}

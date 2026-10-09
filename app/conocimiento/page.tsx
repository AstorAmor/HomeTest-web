import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import { getArticles } from "@/lib/knowledge";
import { KNOWLEDGE } from "@/lib/launch";

// Índice de /conocimiento: todos los artículos de content/conocimiento/, el más reciente primero.

export function generateMetadata(): Metadata {
  if (!KNOWLEDGE) return {};
  const drafts = getArticles().every((a) => a.estado === "borrador");
  return {
    title: "Conocimiento · Kuova Health",
    description: "Cómo medir y entender tus biomarcadores, con datos y fuentes científicas.",
    alternates: { canonical: "/conocimiento" },
    robots: drafts ? { index: false, follow: false } : undefined,
  };
}

export default function KnowledgeIndex() {
  if (!KNOWLEDGE) notFound();
  const articles = getArticles();

  return (
    <div lang="es" className="bg-bg">
      <header className="border-b border-border bg-bg-soft">
        <Container>
          <div className="max-w-2xl pb-12 pt-28 sm:pb-16 sm:pt-36">
            <p className="font-logo text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">Conocimiento</p>
            <h1 className="mt-4 text-balance font-display text-4xl font-medium tracking-tight text-text sm:text-6xl">
              Entender tus biomarcadores
            </h1>
            <p className="mt-5 text-balance text-lg text-text-muted">
              Qué mide cada análisis, cómo leerlo y cuándo un cambio es real. Con datos y fuentes científicas.
            </p>
          </div>
        </Container>
      </header>
      <Container>
        <ul className="grid gap-5 py-14 sm:grid-cols-2 sm:py-20">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/conocimiento/${a.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/30"
              >
                <span className="text-xs text-text-muted">
                  {a.categoria}
                  {a.lectura && <> · {a.lectura}</>}
                  {a.estado === "borrador" && <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-accent-light">Borrador</span>}
                </span>
                <span className="mt-3 font-display text-2xl leading-snug text-text group-hover:text-accent">{a.titulo}</span>
                <span className="mt-2 text-text-muted">{a.subtitulo}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

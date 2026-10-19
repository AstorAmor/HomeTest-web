import Link from "next/link";

// Al final de una comparativa o de una ficha: otras páginas de la misma sección y la lista de espera.
export default function Relacionados({
  titulo,
  items,
  cierre,
}: {
  titulo: string;
  items: { href: string; label: string; texto?: string }[];
  cierre?: { titulo: string; texto: string };
}) {
  return (
    <div className="space-y-12">
      {items.length > 0 && (
        <section aria-labelledby="relacionados">
          <h2 id="relacionados" className="font-display text-2xl font-medium text-text">
            {titulo}
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="flex h-full flex-col rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/30"
                >
                  <span className="font-medium text-text">{it.label}</span>
                  {it.texto && <span className="mt-1 text-sm text-text-muted">{it.texto}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {cierre && (
        <section className="rounded-2xl bg-accent px-6 py-8 text-on-accent sm:px-8">
          <p className="font-display text-2xl leading-snug">{cierre.titulo}</p>
          <p className="mt-2 text-on-accent/80">{cierre.texto}</p>
          <Link
            href="/#lista-de-espera"
            className="mt-5 inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-accent transition-opacity hover:opacity-90"
          >
            Únete a la lista de espera
          </Link>
        </section>
      )}
    </div>
  );
}

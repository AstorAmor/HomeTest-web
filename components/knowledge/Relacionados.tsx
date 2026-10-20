import Link from "next/link";

type Enlace = { href: string; label: string; texto?: string };

// Al final de una guía, una comparativa o una ficha: otras páginas de la misma sección, si hace
// falta una segunda lista (p. ej. las guías que citan esa ficha) y la lista de espera.
export default function Relacionados({
  titulo,
  items,
  secundario,
  cierre,
}: {
  titulo: string;
  items: Enlace[];
  secundario?: { titulo: string; items: Enlace[] };
  cierre?: { titulo: string; texto: string };
}) {
  const listas = [{ id: "relacionados", titulo, items }, ...(secundario ? [{ id: "relacionados-2", ...secundario }] : [])];
  return (
    <div className="space-y-12">
      {listas
        .filter((l) => l.items.length > 0)
        .map((l) => (
          <section key={l.id} aria-labelledby={l.id}>
            <h2 id={l.id} className="font-display text-2xl font-medium text-text">
              {l.titulo}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {l.items.map((it) => (
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
        ))}
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

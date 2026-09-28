import type { LegalDocument } from "@/content/legal";

// Documento legal: inglés primero (revisores de tiendas de apps / Huawei) y la
// versión en español debajo.
export default function LegalDoc({ es, en }: { es: LegalDocument; en: LegalDocument }) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-8 rounded-lg border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
        Draft pending legal review. / Borrador pendiente de revisión legal.
      </p>
      <div lang="en">
        <Doc doc={en} />
      </div>
      <hr className="my-16 border-t border-black/10" />
      <div lang="es">
        <Doc doc={es} />
      </div>
    </div>
  );
}

function Doc({ doc }: { doc: LegalDocument }) {
  return (
    <article className="space-y-8">
      <header>
        <h2 className="text-3xl font-semibold text-text">{doc.title}</h2>
        <p className="mt-2 text-sm text-text-muted">{doc.updated}</p>
        <p className="mt-6 text-text-muted">{doc.intro}</p>
      </header>
      {doc.sections.map((s) => (
        <section key={s.title}>
          <h3 className="text-xl font-semibold text-text">{s.title}</h3>
          <div className="mt-3 space-y-3">
            {s.paragraphs.map((p, i) => (
              <p key={i} className="text-text-muted">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}

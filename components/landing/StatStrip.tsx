import Container from "../ui/Container";
import type { SiteCopy } from "@/lib/content";

// Franja de cifras bajo el hero.
export default function StatStrip({ copy }: { copy: SiteCopy }) {
  return (
    <section className="border-b border-border bg-bg">
      <Container>
        <dl className="grid grid-cols-2 divide-border py-8 sm:py-10 lg:grid-cols-4 lg:divide-x">
          {copy.home.cifras.map((c) => (
            <div key={c.texto} className="flex flex-col-reverse px-2 py-4 text-center lg:px-6">
              <dt className="mt-1 text-sm text-text-muted">{c.texto}</dt>
              <dd className="font-display text-4xl font-medium tracking-tight text-accent sm:text-5xl">{c.valor}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

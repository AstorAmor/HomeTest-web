import Container from "../ui/Container";
import Icon, { type IconName } from "../ui/Icon";
import type { SiteCopy } from "@/lib/content";

// Analítica → gota; 2 al año → evolución; wearables → pulso; plan → salud personalizada
const CIFRA_ICONOS: IconName[] = ["drop", "chart", "pulse", "person"];

// Franja de cifras bajo el hero.
export default function StatStrip({ copy }: { copy: SiteCopy }) {
  return (
    <section className="border-b border-border bg-bg">
      <Container>
        <dl className="grid grid-cols-2 divide-border py-8 sm:py-10 lg:grid-cols-4 lg:divide-x">
          {copy.home.cifras.map((c, i) => (
            <div key={c.texto} className="flex flex-col-reverse items-center px-2 py-4 text-center lg:px-6">
              <dt className="mt-1 text-sm text-text-muted">{c.texto}</dt>
              <dd className="font-display text-4xl font-medium tracking-tight text-accent sm:text-5xl">{c.valor}</dd>
              <Icon name={CIFRA_ICONOS[i % CIFRA_ICONOS.length]} className="mb-3 h-6 w-6 text-gold" />
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

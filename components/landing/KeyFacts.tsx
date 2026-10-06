import Container from "../ui/Container";
import Icon from "../ui/Icon";
import Reveal from "./Reveal";
import { fill, type SiteCopy } from "@/lib/content";

// "Tus datos son tuyos" + "Kuova en pocas palabras": un resumen claro y citable
// (lo que mejor entienden Google y los asistentes de IA cuando alguien pregunta por nosotros).
export default function KeyFacts({ copy, total, systems }: { copy: SiteCopy; total: number; systems: number }) {
  const { datos, en_breve } = copy.home;
  return (
    <section className="bg-bg-soft py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <Reveal className="rounded-[2rem] bg-ink p-8 text-white sm:p-10">
            <h2 className="font-display text-3xl font-medium sm:text-4xl">{datos.titulo}</h2>
            <ul className="mt-8 space-y-5">
              {datos.puntos.map((p) => (
                <li key={p} className="flex gap-3 text-white/85">
                  <Icon name="shield" className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="font-display text-3xl font-medium text-text sm:text-4xl">{en_breve.titulo}</h2>
            <p className="mt-5 text-lg text-text-muted">{en_breve.parrafo}</p>
            <dl className="mt-8 divide-y divide-border border-y border-border">
              {en_breve.datos.map((d) => (
                <div key={d.clave} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-sm font-semibold text-text">{d.clave}</dt>
                  <dd className="text-sm text-text-muted">{fill(d.valor, total, systems)}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

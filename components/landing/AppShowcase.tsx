import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import PhoneFrame from "./PhoneFrame";
import Reveal from "./Reveal";
import type { SiteCopy } from "@/lib/content";

// "Tu salud, al alcance de tu mano": capturas reales de la app en tema claro.
export default function AppShowcase({ copy }: { copy: SiteCopy }) {
  const { app } = copy.home;
  return (
    <section className="overflow-hidden bg-bg-soft py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.25fr]">
          <Reveal>
            <SectionHeading eyebrow={app.eyebrow} title={app.titulo} subtitle={app.subtitulo} />
            <ul className="mt-10 space-y-6">
              {app.puntos.map((p, i) => (
                <li key={p.titulo} className="flex gap-4">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-semibold text-accent-light">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-text">{p.titulo}</p>
                    <p className="mt-1 text-text-muted">{p.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Tres móviles escalonados; en pantallas pequeñas se desliza en horizontal */}
          <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:justify-center sm:overflow-visible sm:px-0">
            {app.capturas.map((c, i) => (
              <Reveal key={c.src} delay={i * 120} className={`w-[62vw] max-w-[260px] shrink-0 snap-center sm:w-[30%] ${i === 1 ? "sm:-translate-y-10" : "sm:translate-y-6"}`}>
                <PhoneFrame src={c.src} alt={c.alt} />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

import Image from "next/image";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "./Reveal";
import type { SiteCopy } from "@/lib/content";

// "Cómo funciona" (estilo Lucis): título fijo a la izquierda y los pasos bajando a la derecha.
// Se usa en la portada y en /como-funciona.
export default function HowItWorks({ copy, showHeading = true }: { copy: SiteCopy; showHeading?: boolean }) {
  const { como_funciona } = copy.home;
  return (
    <section id="como-funciona" className="scroll-mt-24 bg-bg-soft py-20 sm:py-28">
      <Container>
        <div className={showHeading ? "grid gap-12 lg:grid-cols-[1fr_1.4fr]" : ""}>
          {showHeading && (
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeading eyebrow={como_funciona.eyebrow} title={como_funciona.titulo} subtitle={como_funciona.subtitulo} />
            </div>
          )}
          <ol className="space-y-6">
            {como_funciona.pasos.map((paso, i) => (
              <li key={paso.titulo}>
                <Reveal className="grid overflow-hidden rounded-3xl border border-border bg-surface sm:grid-cols-[1fr_200px]">
                  <div className="p-7 sm:p-9">
                    <p className="font-display text-5xl font-medium text-accent/80">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-4 text-xl font-semibold text-text sm:text-2xl">{paso.titulo}</h3>
                    <p className="mt-3 text-text-muted">{paso.texto}</p>
                  </div>
                  <div className="relative h-48 sm:h-auto">
                    <Image src={paso.imagen} alt={paso.imagen_alt} fill sizes="(min-width: 640px) 200px, 100vw" className="object-cover" />
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

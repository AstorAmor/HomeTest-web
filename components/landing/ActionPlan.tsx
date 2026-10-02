import Image from "next/image";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Marquee from "./Marquee";
import PhoneFrame from "./PhoneFrame";
import Reveal from "./Reveal";
import type { SiteCopy } from "@/lib/content";

// "Conocerte mejor para pasar a la acción": foto + captura del plan + cinta de objetivos.
export default function ActionPlan({ copy }: { copy: SiteCopy }) {
  const { accion } = copy.home;
  return (
    <section className="overflow-hidden bg-bg py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image src={accion.imagen} alt={accion.imagen_alt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 -right-2 w-40 sm:-right-6 sm:w-52">
              <PhoneFrame src={accion.captura.src} alt={accion.captura.alt} />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <SectionHeading eyebrow={accion.eyebrow} title={accion.titulo} />
            <p className="mt-6 max-w-xl text-lg text-text-muted">{accion.texto}</p>
          </Reveal>
        </div>
      </Container>

      <div className="mt-24">
        <Container>
          <p className="mb-6 text-center font-display text-2xl italic text-text-muted">{accion.objetivos_titulo}</p>
        </Container>
        <Marquee
          items={accion.objetivos}
          duration={50}
          itemClassName="rounded-full bg-accent-soft px-6 py-3 font-display text-lg text-accent-dark sm:text-xl"
        />
      </div>
    </section>
  );
}

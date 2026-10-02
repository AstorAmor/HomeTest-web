import Image from "next/image";
import Container from "../ui/Container";
import WaitlistForm from "../WaitlistForm";
import type { SiteCopy } from "@/lib/content";

// Cierre con la lista de espera sobre una foto a pantalla completa.
export default function FinalCta({ copy }: { copy: SiteCopy }) {
  const { cta_final } = copy.home;
  return (
    <section id="lista-de-espera" className="relative isolate scroll-mt-24 overflow-hidden bg-ink py-24 sm:py-32">
      <Image src={cta_final.imagen} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="text-white">
            <h2 className="text-balance font-display text-4xl font-medium tracking-tight sm:text-6xl">{cta_final.titulo}</h2>
            <p className="mt-5 max-w-md text-lg text-white/85">{cta_final.descripcion}</p>
          </div>
          <div className="rounded-[2rem] bg-bg p-7 shadow-2xl sm:p-9">
            <WaitlistForm copy={copy.waitlist_form} ui={copy.ui} />
          </div>
        </div>
      </Container>
    </section>
  );
}

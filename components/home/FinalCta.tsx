import Section from "../ui/Section";
import WaitlistForm from "../WaitlistForm";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

export default function FinalCta() {
  const { cta_final, waitlist_form, ui } = getContent(getLang()).siteCopy;

  return (
    <Section id="lista-de-espera">
      <div className="mx-auto grid max-w-4xl items-center gap-10 rounded-2xl border border-border bg-surface p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <h2 className="text-balance text-3xl font-semibold text-text">
            {cta_final.titulo}
          </h2>
          <p className="mt-4 text-text-muted">{cta_final.descripcion}</p>
        </div>
        <WaitlistForm copy={waitlist_form} ui={ui} />
      </div>
    </Section>
  );
}

import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import HowItWorksSteps from "./HowItWorksSteps";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

export default function HowItWorksSection() {
  const { como_funciona } = getContent(getLang()).siteCopy;

  return (
    <Section soft>
      <SectionHeading
        title={como_funciona.titulo_seccion}
        subtitle={como_funciona.subtitulo_seccion}
      />
      <div className="mt-10">
        <HowItWorksSteps />
      </div>
    </Section>
  );
}

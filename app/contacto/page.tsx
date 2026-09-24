import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/ContactForm";
import { siteCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: siteCopy.seo.contacto.title,
  description: siteCopy.seo.contacto.description,
};

export default function ContactoPage() {
  const { pagina_contacto } = siteCopy;

  return (
    <>
      <PageHero
        title={pagina_contacto.titulo_hero}
        subtitle={pagina_contacto.subtitulo_hero}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-text">Escríbenos directamente</h2>
            <p className="mt-3 text-text-muted">
              También puedes escribirnos a{" "}
              <a
                href={`mailto:${pagina_contacto.email_contacto}`}
                className="font-medium text-accent-light hover:text-accent"
              >
                {pagina_contacto.email_contacto}
              </a>
              .
            </p>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}

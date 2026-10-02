import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/ContactForm";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata("contacto", "/contacto");
}

export default function ContactoPage() {
  const { pagina_contacto, ui, waitlist_form } = getContent(getLang()).siteCopy;

  return (
    <>
      <PageHero
        title={pagina_contacto.titulo_hero}
        subtitle={pagina_contacto.subtitulo_hero}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-text">{ui.contacto_directo_titulo}</h2>
            <p className="mt-3 text-text-muted">
              {ui.contacto_directo_texto}{" "}
              <a
                href={`mailto:${pagina_contacto.email_contacto}`}
                className="font-medium text-accent-light hover:text-accent"
              >
                {pagina_contacto.email_contacto}
              </a>
              .
            </p>
          </div>
          <ContactForm ui={ui} nameLabel={waitlist_form.campo_nombre} />
        </div>
      </Section>
    </>
  );
}

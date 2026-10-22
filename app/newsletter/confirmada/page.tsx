import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import { NEWSLETTER } from "@/lib/launch";
import { textosNewsletter } from "@/lib/newsletter";

// Adonde lleva el enlace del email de doble confirmación de Brevo, una vez confirmada la suscripción
// a Kuova Letter. No se indexa. Textos en content/newsletter.json.
export const metadata: Metadata = {
  title: "Suscripción confirmada · Kuova Health",
  robots: { index: false, follow: false },
};

export default function NewsletterConfirmada() {
  if (!NEWSLETTER) notFound();
  const t = textosNewsletter("es");
  return (
    <div lang="es" className="bg-bg">
      <Container>
        <div className="mx-auto max-w-xl pb-28 pt-36 text-center sm:pt-44">
          <p className="font-logo text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">{t.eyebrow}</p>
          <h1 className="mt-4 text-balance font-display text-4xl font-medium tracking-tight text-text sm:text-5xl">{t.confirmada_titulo}</h1>
          <p className="mt-5 text-balance text-lg text-text-muted">{t.confirmada_texto}</p>
          <Link
            href="/aprende"
            className="mt-8 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
          >
            {t.confirmada_enlace}
          </Link>
        </div>
      </Container>
    </div>
  );
}

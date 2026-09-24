import { siteCopy } from "@/lib/content";

// Hueco reservado para prensa/consejo médico, sin inventar avales.
export default function ComingSoon() {
  const { prensa_y_avales } = siteCopy;

  return (
    <section className="border-y border-border bg-bg-soft py-10">
      <div className="container-page">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {prensa_y_avales.titulo_seccion}
          </p>
          <p className="text-sm text-text-muted">{prensa_y_avales.texto_placeholder}</p>
        </div>
      </div>
    </section>
  );
}

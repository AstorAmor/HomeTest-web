import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

interface HowItWorksStepsProps {
  detailed?: boolean;
}

// Lista de pasos reutilizada en la home (versión resumida) y en /como-funciona (detallada).
export default function HowItWorksSteps({ detailed = false }: HowItWorksStepsProps) {
  const { pasos } = getContent(getLang()).siteCopy.como_funciona;

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {pasos.map((paso) => (
        <div
          key={paso.numero}
          className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-base font-bold text-accent-light">
            {paso.numero}
          </span>
          <h3 className="mt-5 text-lg font-semibold text-text">{paso.titulo}</h3>
          <p className={`mt-2 text-text-muted ${detailed ? "text-base" : "text-sm"}`}>
            {paso.descripcion}
          </p>
        </div>
      ))}
    </div>
  );
}

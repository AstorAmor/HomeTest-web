// Logotipo de Kuova Health en SVG, trazado sobre el logo definitivo (coordenadas de la imagen
// original, 2000 px de ancho): K con el pie del asta afilado en curva y el brazo inferior
// naciendo del superior, U y O de trazo uniforme, V y "A" sin travesaño (Λ).
// "HEALTH" va debajo en Montserrat, espaciado y en Gold. Hereda el color (currentColor).

interface LogoProps {
  // "wordmark": solo KUOVA (cabecera). "full": KUOVA + HEALTH (pie, portadas).
  variant?: "wordmark" | "full";
  align?: "center" | "start";
  className?: string;
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="226 189 1556 276" fill="currentColor" aria-hidden className={className}>
      {/* K: asta con el pie en curva, brazo superior y brazo inferior */}
      <path d="M230 200h38v202c-1 28-18 48-38 55Z" />
      <path d="M427 200h63L268 364v-37Z" />
      <path d="M297 333 328 310l152 147h-56Z" />
      {/* U y O */}
      <path d="M561.5 198v141a103.5 103.5 0 0 0 207 0V198" fill="none" stroke="currentColor" strokeWidth="37" />
      <ellipse cx="990.5" cy="326.5" rx="126.5" ry="116.5" fill="none" stroke="currentColor" strokeWidth="38" />
      {/* V */}
      <path d="M1167 196h41l109 214 116-214h42l-142 260h-32Z" />
      {/* Λ */}
      <path d="M1593 196h39l146 261h-43l-123-214-128 214h-43Z" />
    </svg>
  );
}

export default function Logo({ variant = "wordmark", align = "center", className = "" }: LogoProps) {
  if (variant === "wordmark") {
    return (
      <span className={`inline-flex ${className}`} role="img" aria-label="Kuova Health">
        <Wordmark className="h-full w-auto" />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex flex-col ${align === "center" ? "items-center" : "items-start"} ${className}`}
      role="img"
      aria-label="Kuova Health"
    >
      <Wordmark className="h-7 w-auto" />
      <span aria-hidden className="mt-2.5 pl-[0.6em] font-logo text-[0.68rem] font-medium tracking-[0.6em] text-gold">
        HEALTH
      </span>
    </span>
  );
}

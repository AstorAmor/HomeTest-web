// Iconografía de la marca: línea fina, esquinas suaves, un solo color (currentColor).
// Los cuatro primeros son los de la guía (datos claros, salud personalizada, prevención,
// confianza científica); el resto sigue el mismo estilo.

export type IconName = "chart" | "person" | "leaf" | "shield" | "pulse" | "drop";

const paths: Record<IconName, React.ReactNode> = {
  // Datos claros
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M6.5 16.5v-3M11 16.5v-6M15.5 16.5V8" />
      <path d="M6 10.5 10.5 6.5l3 2.5L19 4" />
      <path d="M15.5 4H19v3.5" />
    </>
  ),
  // Salud personalizada
  person: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6" />
    </>
  ),
  // Prevención
  leaf: (
    <>
      <path d="M19.5 4.5C10 4.5 5 9.3 5 15.2c0 1.6.4 3 1 4.3 7.6 0 13.5-4.2 13.5-15Z" />
      <path d="M5.5 19.5c2.5-4.5 5.6-7.6 9.5-10" />
    </>
  ),
  // Confianza científica
  shield: (
    <>
      <path d="M12 3.5 5 6.2v5.3c0 4.4 2.9 7.8 7 9 4.1-1.2 7-4.6 7-9V6.2L12 3.5Z" />
      <path d="m8.8 12.2 2.3 2.3 4.2-4.6" />
    </>
  ),
  // Wearables / día a día
  pulse: <path d="M3.5 12h4l2-5 4 10 2-5h5" />,
  // Analítica
  drop: (
    <>
      <path d="M12 3.5c3.2 3.9 6 7.3 6 10.6a6 6 0 0 1-12 0c0-3.3 2.8-6.7 6-10.6Z" />
      <path d="M9.2 14.6a2.9 2.9 0 0 0 2.6 2.7" />
    </>
  ),
};

export default function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

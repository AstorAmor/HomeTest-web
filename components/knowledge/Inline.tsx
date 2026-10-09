import { Fragment, type ReactNode } from "react";

// Texto de una línea de Markdown: **negrita**, *cursiva*, [texto](enlace) y [^n] (cita a la
// referencia n, enlazada a la lista del final).
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\^\w+\]|\[[^\]]+\]\([^)\s]+\))/g;

export default function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        let node: ReactNode = part;
        if (part.startsWith("**") && part.endsWith("**")) {
          node = <strong className="font-semibold text-text">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith("[^")) {
          const id = part.slice(2, -1);
          // Citas seguidas ([^2][^3]) se separan con coma: "2,3" y no "23"
          const after = parts[i - 1]?.startsWith("[^");
          node = (
            <sup className={after ? "" : "ml-0.5"}>
              {after && ","}
              <a href={`#ref-${id}`} id={`cita-${id}`} className="font-medium text-accent-light no-underline hover:underline">
                {id}
              </a>
            </sup>
          );
        } else if (part.startsWith("[")) {
          const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
          if (m) {
            const external = /^https?:/.test(m[2]);
            node = (
              <a
                href={m[2]}
                className="text-accent-light underline decoration-1 underline-offset-2 hover:text-accent"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {m[1]}
              </a>
            );
          }
        } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          node = <em>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}

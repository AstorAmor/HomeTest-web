"use client";

import { useState } from "react";
import { FaqItem } from "@/lib/content";

export default function FaqAccordion({ preguntas }: { preguntas: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(preguntas[0]?.id ?? null);

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {preguntas.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
            >
              <span className="font-medium text-text">{item.pregunta}</span>
              <span
                className={`shrink-0 text-accent-light transition-transform ${isOpen ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-text-muted sm:px-6">{item.respuesta}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

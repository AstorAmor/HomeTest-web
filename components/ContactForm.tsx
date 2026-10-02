"use client";

import { FormEvent, useState } from "react";
import type { SiteCopy } from "@/lib/content";

export default function ContactForm({ ui, nameLabel }: { ui: SiteCopy["ui"]; nameLabel: string }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // TODO(backend): conectar con un servicio real de envío de mensajes
    // (ej. un endpoint propio, Formspree, o un webhook a Airtable/Slack).
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6 text-center">
        <p className="font-medium text-text">
          {ui.contacto_exito}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contacto-nombre" className="mb-1.5 block text-sm font-medium text-text">
          {nameLabel}
        </label>
        <input
          id="contacto-nombre"
          name="nombre"
          type="text"
          required
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder={ui.placeholder_nombre}
        />
      </div>

      <div>
        <label htmlFor="contacto-email" className="mb-1.5 block text-sm font-medium text-text">
          Email
        </label>
        <input
          id="contacto-email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder={ui.placeholder_email}
        />
      </div>

      <div>
        <label htmlFor="contacto-mensaje" className="mb-1.5 block text-sm font-medium text-text">
          {ui.contacto_mensaje}
        </label>
        <textarea
          id="contacto-mensaje"
          name="mensaje"
          required
          rows={4}
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder={ui.contacto_placeholder_mensaje}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover sm:w-auto"
      >
        {ui.contacto_enviar}
      </button>
    </form>
  );
}

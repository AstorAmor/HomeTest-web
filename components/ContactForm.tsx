"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
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
          Gracias por escribirnos. Te responderemos lo antes posible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contacto-nombre" className="mb-1.5 block text-sm font-medium text-text">
          Nombre
        </label>
        <input
          id="contacto-nombre"
          name="nombre"
          type="text"
          required
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Tu nombre"
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
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="contacto-mensaje" className="mb-1.5 block text-sm font-medium text-text">
          Mensaje
        </label>
        <textarea
          id="contacto-mensaje"
          name="mensaje"
          required
          rows={4}
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover sm:w-auto"
      >
        Enviar mensaje
      </button>
    </form>
  );
}

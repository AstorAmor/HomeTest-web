"use client";

import { FormEvent, useState } from "react";
import { siteCopy } from "@/lib/content";

export default function WaitlistForm() {
  const { waitlist_form } = siteCopy;
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // TODO(backend): este formulario todavía no envía datos a ningún sitio.
    // Conectar aquí con un servicio real, por ejemplo:
    //  - Google Forms (POST al formulario o Apps Script)
    //  - Airtable (API de una tabla "lista_de_espera")
    //  - Mailchimp / Brevo (API de audiencias/listas)
    // De momento solo simulamos el envío en el cliente.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6 text-center">
        <p className="font-medium text-text">{waitlist_form.mensaje_exito}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-text">
          {waitlist_form.campo_nombre}
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
          {waitlist_form.campo_email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="tu@email.com"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover"
      >
        {waitlist_form.boton_enviar}
      </button>

      <p className="text-xs text-text-muted">{waitlist_form.texto_privacidad}</p>
    </form>
  );
}

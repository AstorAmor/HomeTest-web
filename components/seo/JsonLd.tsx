// Inserta datos estructurados (schema.org) en la página.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // El contenido sale de nuestros propios JSON; se escapa "<" por seguridad.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// Pre-lanzamiento: mientras sea true, la web pública es solo la portada "Know more. Live better."
// con la lista de espera (components/prelaunch/); solo quedan visibles /privacy y /terms.
// Está activo salvo que la variable NEXT_PUBLIC_PRELAUNCH valga "false": así kuovahealth.com sigue
// con la portada y una vista previa privada (o el servidor local) puede enseñar la web completa.
// Para volver a la web completa en kuovahealth.com: poner esa variable a "false" en Vercel
// (Production) y volver a publicar.
export const PRELAUNCH = process.env.NEXT_PUBLIC_PRELAUNCH !== "false";

// Páginas de la web antigua que siguen ocultas también con la web completa: sus textos no están al
// día (dos analíticas al año, vídeo con profesionales) y el formulario de contacto no envía nada.
// Cada una lleva a su sección de la portada nueva (middleware.ts) y no salen en el sitemap.
export const RETIRADAS: Record<string, string> = {
  "/como-funciona": "como-funciona",
  "/catalogo": "como-funciona",
  "/faq": "preguntas",
  "/contacto": "preguntas",
};

// Sección "Conocimiento" (/conocimiento, textos en content/conocimiento/). Mientras se escribe solo
// se ve en el servidor local (npm run dev); en kuovahealth.com aparece cuando la variable
// NEXT_PUBLIC_KNOWLEDGE vale "true" en Vercel (Production) y se vuelve a publicar.
export const KNOWLEDGE = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_KNOWLEDGE === "true";

// Newsletter (Kuova Letter): formulario de alta en los artículos, casilla en la lista de espera,
// página de confirmación y su sección del panel. Mientras se prepara solo se ve en el servidor local;
// en kuovahealth.com aparece cuando NEXT_PUBLIC_NEWSLETTER vale "true" en Vercel (Production), con la
// migración …_newsletter.sql aplicada, Brevo configurado y los textos revisados por el abogado.
export const NEWSLETTER = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_NEWSLETTER === "true";

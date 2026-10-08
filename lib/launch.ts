// Pre-lanzamiento: mientras sea true, la web pública es solo la portada "Know more. Live better."
// con la lista de espera (components/prelaunch/). Las páginas de la web completa siguen en el
// código pero redirigen a la portada (middleware.ts); solo quedan visibles /privacy y /terms.
// Está activo salvo que la variable NEXT_PUBLIC_PRELAUNCH valga "false": así kuovahealth.com sigue
// con la portada y una vista previa privada (o el servidor local) puede enseñar la web completa.
// Para volver a la web completa en kuovahealth.com: poner esa variable a "false" en Vercel
// (Production) y volver a publicar.
export const PRELAUNCH = process.env.NEXT_PUBLIC_PRELAUNCH !== "false";

// Páginas de la web completa que se ocultan durante el pre-lanzamiento.
export const PRELAUNCH_HIDDEN = ["/como-funciona", "/catalogo", "/faq", "/contacto"];

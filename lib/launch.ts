// Pre-lanzamiento: mientras sea true, la web pública es solo la portada "Know more. Live better."
// con la lista de espera (components/prelaunch/). Las páginas de la web completa siguen en el
// código pero redirigen a la portada (middleware.ts); solo quedan visibles /privacy y /terms.
// Para volver a la web completa: poner false y publicar.
export const PRELAUNCH = true;

// Páginas de la web completa que se ocultan durante el pre-lanzamiento.
export const PRELAUNCH_HIDDEN = ["/como-funciona", "/catalogo", "/faq", "/contacto"];

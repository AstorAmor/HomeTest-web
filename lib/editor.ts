// Archivos de textos que se pueden cambiar desde el editor local (/editar, solo con `npm run dev`).
// `vista` es la página que se enseña al lado mientras se edita (null = no se puede previsualizar).
export const ARCHIVOS = [
  { id: "inicio", nombre: "Portada (español)", ruta: "content/inicio.json", vista: "/" },
  { id: "inicio-en", nombre: "Portada (inglés)", ruta: "content/en/inicio.json", vista: "/en" },
  { id: "general", nombre: "Menú, pie de página y Google (español)", ruta: "content/site-copy.json", vista: "/" },
  { id: "general-en", nombre: "Menú, pie de página y Google (inglés)", ruta: "content/en/site-copy.json", vista: "/en" },
  { id: "aprende", nombre: "Página Aprende (índice de guías)", ruta: "content/aprende.json", vista: "/aprende" },
  { id: "prelanzamiento", nombre: "Página de pre-lanzamiento (la que se ve hoy en kuovahealth.com)", ruta: "content/prelaunch.json", vista: null },
] as const;

export type ArchivoId = (typeof ARCHIVOS)[number]["id"];

// El editor solo funciona en el ordenador (npm run dev); en Vercel no existe.
export const EDITOR_ACTIVO = process.env.NODE_ENV !== "production";

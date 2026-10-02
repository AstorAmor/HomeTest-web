// Utilidades de idioma sin dependencias de servidor (las usa también la cabecera, que es cliente).
export type Lang = "es" | "en";
export const LANGS: Lang[] = ["es", "en"];

// Ruta en el idioma indicado: el español va sin prefijo y el inglés con "/en".
// Las anclas y los enlaces externos se dejan tal cual.
export function localePath(lang: Lang, path: string): string {
  if (!path.startsWith("/")) return path;
  if (lang === "es") return path;
  return path === "/" ? "/en" : path.startsWith("/#") ? `/en${path.slice(1)}` : `/en${path}`;
}

// Quita el prefijo de idioma de una ruta del navegador ("/en/faq" -> "/faq").
export function stripLang(pathname: string): string {
  if (pathname === "/en") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

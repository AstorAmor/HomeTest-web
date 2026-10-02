import { cookies, headers } from "next/headers";

export type Lang = "es" | "en";
export const LANG_COOKIE = "lang";

// Idioma de la web: el elegido con el botón ES/EN (cookie) o, si no hay, el del navegador.
// Las URLs son las mismas en los dos idiomas (/privacy y /terms no cambian).
export function getLang(): Lang {
  const chosen = cookies().get(LANG_COOKIE)?.value;
  if (chosen === "es" || chosen === "en") return chosen;
  const accept = headers().get("accept-language") ?? "";
  return accept.toLowerCase().startsWith("es") || !accept ? "es" : "en";
}

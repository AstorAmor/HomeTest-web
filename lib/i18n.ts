import { headers } from "next/headers";
import type { Lang } from "./locale";

export { LANGS, localePath, stripLang, type Lang } from "./locale";
export const LANG_COOKIE = "lang";
// Cabecera que pone middleware.ts: "/en/..." es inglés; el resto, español.
export const LANG_HEADER = "x-lang";

// Idioma de la página que se está pintando (lo decide la URL, ver middleware.ts). Solo servidor.
export function getLang(): Lang {
  return headers().get(LANG_HEADER) === "en" ? "en" : "es";
}

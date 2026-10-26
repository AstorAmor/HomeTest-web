import { NextRequest, NextResponse } from "next/server";
import { PRELAUNCH, RETIRADAS } from "@/lib/launch";
import { localePath } from "@/lib/locale";

// Idioma por URL (bueno para Google y los buscadores con IA: cada idioma tiene su dirección):
//   /...     -> español
//   /en/...  -> inglés (se sirve la misma página con la cabecera x-lang=en)
// El botón de idioma enlaza directamente a la URL del otro idioma. El español es el idioma
// principal: nadie se redirige a /en automáticamente.
// Las redirecciones que no van a cambiar son permanentes (308): así Google se queda con la nueva.
const SOLO_ES = ["/conocimiento", "/comparativas", "/biomarcadores", "/aprende"];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const base = isEn ? pathname.slice(3) || "/" : pathname;

  // Páginas de la web antigua (lib/launch.ts): a su sección de la portada
  if (base in RETIRADAS) {
    const url = req.nextUrl.clone();
    url.pathname = isEn && !PRELAUNCH ? "/en" : "/";
    url.search = "";
    url.hash = PRELAUNCH ? "" : RETIRADAS[base];
    return NextResponse.redirect(url, 308);
  }

  // Secciones que solo existen en español (artículos, comparativas, fichas de biomarcadores y el índice
  // /aprende): sin /en. Las guías de la raíz (/longevidad...) redirigen desde su propia página.
  if (isEn && SOLO_ES.some((p) => base === p || base.startsWith(`${p}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = base;
    return NextResponse.redirect(url, 308);
  }

  // Pre-lanzamiento (lib/launch.ts): sin direcciones /en (todo va en inglés primero)
  if (PRELAUNCH && isEn) {
    const url = req.nextUrl.clone();
    url.pathname = base;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Enlaces antiguos del botón de idioma ("?lang=es|en"): a la URL de ese idioma, sin cookie
  const chosen = searchParams.get("lang");
  if (chosen === "es" || chosen === "en") {
    const url = req.nextUrl.clone();
    url.searchParams.delete("lang");
    url.pathname = localePath(chosen, base);
    return NextResponse.redirect(url, 308);
  }

  const headers = new Headers(req.headers);
  headers.set("x-lang", isEn ? "en" : "es");
  if (isEn) {
    const url = req.nextUrl.clone();
    url.pathname = base;
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
}

// Todo salvo los ficheros estáticos (imágenes, vídeos, llms.txt, robots, sitemap...).
export const config = { matcher: ["/((?!_next|images|videos|favicon.ico|.*\\.[a-z0-9]+$).*)"] };

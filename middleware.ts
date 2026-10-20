import { NextRequest, NextResponse } from "next/server";
import { PRELAUNCH, RETIRADAS } from "@/lib/launch";

// Idioma por URL (bueno para Google y los buscadores con IA: cada idioma tiene su dirección):
//   /...     -> español
//   /en/...  -> inglés (se sirve la misma página con la cabecera x-lang=en)
// El botón de idioma enlaza a "?lang=es|en": se guarda la elección en una cookie y se va a la
// URL de ese idioma. El español es el idioma principal: nadie se redirige a /en automáticamente.
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
    return NextResponse.redirect(url);
  }

  // Secciones que solo existen en español (artículos, comparativas, fichas de biomarcadores y el índice
  // /aprende): sin /en. Las guías de la raíz (/longevidad...) redirigen desde su propia página.
  if (isEn && SOLO_ES.some((p) => base === p || base.startsWith(`${p}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = base;
    return NextResponse.redirect(url);
  }

  // Pre-lanzamiento (lib/launch.ts): sin direcciones /en (todo va en inglés primero)
  if (PRELAUNCH && isEn) {
    const url = req.nextUrl.clone();
    url.pathname = base;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const chosen = searchParams.get("lang");
  if (chosen === "es" || chosen === "en") {
    const url = req.nextUrl.clone();
    url.searchParams.delete("lang");
    url.pathname = chosen === "en" ? (base === "/" ? "/en" : `/en${base}`) : base;
    const res = NextResponse.redirect(url);
    res.cookies.set("lang", chosen, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
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

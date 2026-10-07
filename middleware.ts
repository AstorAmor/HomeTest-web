import { NextRequest, NextResponse } from "next/server";
import { PRELAUNCH, PRELAUNCH_HIDDEN } from "@/lib/launch";

// Idioma por URL (bueno para Google y los buscadores con IA: cada idioma tiene su dirección):
//   /...     -> español
//   /en/...  -> inglés (se sirve la misma página con la cabecera x-lang=en)
// El botón de idioma enlaza a "?lang=es|en": se guarda la elección en una cookie y se va a la
// URL de ese idioma. En la primera visita a la portada, si el navegador no está en español,
// se lleva a /en (los buscadores no mandan idioma y ven la versión en español).
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const base = isEn ? pathname.slice(3) || "/" : pathname;

  // Pre-lanzamiento (lib/launch.ts): una sola portada para los dos idiomas y la web completa oculta.
  if (PRELAUNCH && (pathname === "/en" || PRELAUNCH_HIDDEN.includes(base))) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
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

  if (!PRELAUNCH && !isEn && pathname === "/" && !req.cookies.has("lang")) {
    const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
    if (accept && !accept.startsWith("es")) {
      const url = req.nextUrl.clone();
      url.pathname = "/en";
      return NextResponse.redirect(url);
    }
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

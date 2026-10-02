import { NextRequest, NextResponse } from "next/server";

// El botón de idioma enlaza a "?lang=en" / "?lang=es": se guarda la elección en una
// cookie y se vuelve a la misma página sin el parámetro.
export function middleware(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang");
  if (lang !== "es" && lang !== "en") return NextResponse.next();
  const url = req.nextUrl.clone();
  url.searchParams.delete("lang");
  const res = NextResponse.redirect(url);
  res.cookies.set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}

export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Abierto a buscadores y a los rastreadores de asistentes de IA (GEO): queremos que, cuando
// alguien pregunte a ChatGPT, Claude, Perplexity o Gemini por análisis de biomarcadores en
// España, puedan leer y citar esta web.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // El panel privado (/panel) y las APIs no se rastrean
      { userAgent: "*", allow: "/", disallow: ["/panel", "/en/panel", "/api/"] },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"],
        allow: "/",
        disallow: ["/panel", "/en/panel", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

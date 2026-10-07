import type { Metadata, Viewport } from "next";
import { Inter, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import PrelaunchBar from "@/components/prelaunch/PrelaunchBar";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";
import { PRELAUNCH } from "@/lib/launch";
import { SITE_URL, organizationJsonLd, pageMetadata } from "@/lib/seo";

// Tipografías de la marca Kuova Health: Inter (texto), Playfair Display (titulares y claim)
// y Montserrat ("HEALTH" bajo el logotipo y textos de marca en mayúsculas).
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontLogo = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-logo",
  display: "swap",
});

export function generateMetadata(): Metadata {
  return { metadataBase: new URL(SITE_URL), ...pageMetadata("home", "/") };
}

export const viewport: Viewport = { themeColor: PRELAUNCH ? "#0e2a24" : "#faf8f3" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getLang();
  const { siteCopy } = getContent(lang);
  return (
    <html lang={lang} className={`${fontSans.variable} ${fontDisplay.variable} ${fontLogo.variable}`}>
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        <JsonLd data={organizationJsonLd(lang)} />
        {PRELAUNCH ? (
          // Pre-lanzamiento (lib/launch.ts): la portada ocupa toda la pantalla; las páginas legales
          // llevan solo el logo para volver a ella.
          <>
            <PrelaunchBar />
            <main>{children}</main>
          </>
        ) : (
          <>
            <Header copy={siteCopy} lang={lang} />
            <main>{children}</main>
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}

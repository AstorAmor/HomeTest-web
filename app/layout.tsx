import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";
import { SITE_URL, organizationJsonLd, pageMetadata } from "@/lib/seo";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Serif para los titulares grandes (estilo editorial, como Function Health o Lucis)
const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export function generateMetadata(): Metadata {
  return { metadataBase: new URL(SITE_URL), ...pageMetadata("home", "/") };
}

export const viewport: Viewport = { themeColor: "#faf4ec" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getLang();
  const { siteCopy } = getContent(lang);
  return (
    <html lang={lang} className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        <JsonLd data={organizationJsonLd(lang)} />
        <Header copy={siteCopy} lang={lang} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

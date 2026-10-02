import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const { seo } = getContent(getLang()).siteCopy;
  return { title: seo.home.title, description: seo.home.description };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getLang();
  return (
    <html lang={lang} className={fontSans.variable}>
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        <Header copy={getContent(lang).siteCopy} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

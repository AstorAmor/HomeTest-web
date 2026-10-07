"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";

// Cabecera mínima del pre-lanzamiento para las páginas legales: solo el logo, que vuelve a la
// portada. En la portada no se pinta (ella misma lleva el logo grande).
export default function PrelaunchBar() {
  const path = usePathname() ?? "/";
  if (path === "/" || path === "/en") return null;
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="container-page flex h-20 items-center sm:h-24">
        <Link href="/" className="text-accent" aria-label="Kuova Health">
          <Logo className="h-[17px] sm:h-[19px]" />
        </Link>
      </div>
    </header>
  );
}

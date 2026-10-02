import Link from "next/link";
import Container from "../ui/Container";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

export default function Footer() {
  const { marca, footer } = getContent(getLang()).siteCopy;

  return (
    <footer className="border-t border-border bg-bg-soft">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-bold text-text">{marca.nombre}</p>
            <p className="mt-3 max-w-xs text-sm text-text-muted">
              {marca.descripcion_corta}
            </p>
            <div className="mt-5 flex gap-4">
              {footer.redes.map((red) => (
                <a
                  key={red.label}
                  href={red.href}
                  className="text-sm text-text-muted transition-colors hover:text-accent-light"
                >
                  {red.label}
                </a>
              ))}
            </div>
          </div>

          {footer.columnas.map((columna) => (
            <div key={columna.titulo}>
              <p className="text-sm font-semibold text-text">{columna.titulo}</p>
              <ul className="mt-4 space-y-3">
                {columna.enlaces.map((enlace) => (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      className="text-sm text-text-muted transition-colors hover:text-text"
                    >
                      {enlace.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {footer.texto_copyright}</p>
          <p>{footer.nota_legal}</p>
        </div>
      </Container>
    </footer>
  );
}

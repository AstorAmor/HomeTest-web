import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorTextos from "@/components/editor/EditorTextos";
import { ARCHIVOS, EDITOR_ACTIVO } from "@/lib/editor";

export const metadata: Metadata = {
  title: "Editor de textos · Kuova",
  robots: { index: false, follow: false },
};

// Editor de textos de la web: solo en el ordenador (doble clic en "Editar textos web.bat").
// En Vercel no existe. Guía: content/README.md.
export default function EditarPage() {
  if (!EDITOR_ACTIVO) notFound();
  return <EditorTextos archivos={ARCHIVOS.map(({ id, nombre, vista }) => ({ id, nombre, vista }))} />;
}

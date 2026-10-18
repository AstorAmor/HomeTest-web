import type { Metadata } from "next";
import Panel from "@/components/panel/Panel";

// Panel privado de la web (kuovahealth.com/panel): visitas, canales, conversión y embudo de la
// medición sin cookies. Se entra con la cuenta de KUOVA; solo ven datos los administradores.
export const metadata: Metadata = {
  title: "Panel de la web",
  robots: { index: false, follow: false },
};

export default function PanelPage() {
  return <Panel />;
}

"use client";

import Script from "next/script";

declare global {
  interface Window {
    KG?: { todos: (raiz?: ParentNode) => void };
  }
}

// Pinta los gráficos de Kuova Letter de la página (los huecos de GraficoKuova) con kuova-graficos.js,
// el mismo archivo con el que la newsletter hace las imágenes del email y la vista previa. Lo copia a
// public/kuova-letter/ scripts/importar-numero.mjs: aquí no se toca.
export default function GraficosKuova() {
  return <Script src="/kuova-letter/kuova-graficos.js" strategy="afterInteractive" onReady={() => window.KG?.todos()} />;
}

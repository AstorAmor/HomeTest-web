// La web también responde en la dirección que Vercel da al proyecto (hometest-web.vercel.app): una
// copia exacta de kuovahealth.com que los buscadores (Bing, sobre todo) pueden tomar por una web
// duplicada. Todo lo que llega ahí se manda a kuovahealth.com con una redirección permanente (308),
// salvo /api, por si algún servicio externo (p. ej. un webhook) llama a esa dirección. Las
// direcciones de cada despliegue (hometest-<id>-….vercel.app) no se tocan: son para previsualizar.
const DIRECCION_VERCEL = [{ type: "host", value: "hometest-web.vercel.app" }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Carpeta de compilación aparte para un segundo servidor local (p. ej. la web completa en otro
  // puerto) sin pisar la del que ya esté en marcha. Por defecto, la normal (.next).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Las páginas legales viven en inglés (/privacy, /terms); las rutas antiguas redirigen.
  async redirects() {
    return [
      { source: "/privacidad", destination: "/privacy", permanent: true },
      { source: "/condiciones", destination: "/terms", permanent: true },
      { source: "/legal", destination: "/terms", permanent: true },
      { source: "/", has: DIRECCION_VERCEL, destination: "https://kuovahealth.com/", permanent: true },
      {
        source: "/:ruta((?!api(?:/|$)).+)",
        has: DIRECCION_VERCEL,
        destination: "https://kuovahealth.com/:ruta",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

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
    ];
  },
};

export default nextConfig;

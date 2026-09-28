/** @type {import('next').NextConfig} */
const nextConfig = {
  // Las páginas legales viven en inglés (/privacy, /terms); las rutas antiguas redirigen.
  async redirects() {
    return [
      { source: "/privacidad", destination: "/privacy", permanent: true },
      { source: "/condiciones", destination: "/terms", permanent: true },
    ];
  },
};

export default nextConfig;

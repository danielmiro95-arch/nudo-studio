/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow loading the existing /public images at original size; Next will
  // serve modern AVIF/WebP variants automatically.
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Security & SEO headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
      {
        // Fotos y vídeo: no cambian de nombre al editarse rara vez → caché larga.
        source: '/assets/:file(.*\\.(?:avif|webp|jpg|png|svg|mp4))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' }],
      },
    ];
  },

  // Legacy URL redirects (preserve link equity from old GitHub Pages site)
  async redirects() {
    return [
      { source: '/bodas.html',               destination: '/servicios#bodas',  permanent: true },
      { source: '/bodas',                    destination: '/servicios#bodas',  permanent: true },
      { source: '/eventos.html',             destination: '/servicios',        permanent: true },
      { source: '/eventos',                  destination: '/servicios',        permanent: true },
      { source: '/regalos.html',             destination: '/tienda',           permanent: true },
      { source: '/regalos',                  destination: '/tienda',           permanent: true },
      { source: '/hero-revolut-demo.html',   destination: '/',                 permanent: true },
    ];
  },
};

export default nextConfig;

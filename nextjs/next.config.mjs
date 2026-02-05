/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Redirects para URLs antiguas
  async redirects() {
    return [
      // Redirect de URLs antiguas comunes
      {
        source: '/productos/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/categoria/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/categorias/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tienda/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/shop/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/product/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/colchones/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/almohadas/:slug*',
        destination: '/',
        permanent: true,
      },
      // Trailing slash consistency
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },

  // Headers para SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

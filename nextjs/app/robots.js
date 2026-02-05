export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/pago-exitoso',
          '/pago-fallido',
          '/pago-pendiente',
          '/*?*', // Bloquear URLs con query params para evitar duplicados
        ],
      },
    ],
    sitemap: 'https://aluminehogar.com.ar/sitemap.xml',
    host: 'https://aluminehogar.com.ar',
  };
}

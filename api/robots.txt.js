/**
 * Endpoint para generar robots.txt dinámico
 * Configura las reglas para los crawlers de motores de búsqueda
 */
export default async function handler(req, res) {
  const baseUrl = 'https://colchonqn2.netlify.app';

  const robotsTxt = `# robots.txt para Aluminé Hogar

# Permitir todos los bots de búsqueda
User-agent: *
Allow: /
Allow: /producto/*

# Evitar rastreo de archivos no públicos
Disallow: /api/auth/*
Disallow: /api/ventas/*
Disallow: /api/admin/*

# Googlebot específico
User-agent: Googlebot
Allow: /
Allow: /producto/*

# Googlebot para imágenes
User-agent: Googlebot-Image
Allow: /

# Ubicación del sitemap
Sitemap: ${baseUrl}/api/sitemap.xml

# Crawl-delay (cortesía para no sobrecargar el servidor)
Crawl-delay: 1
`;

  // Configurar headers para texto plano
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // Cache por 24 horas

  res.status(200).send(robotsTxt);
}

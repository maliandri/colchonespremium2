import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';

/**
 * Endpoint para generar sitemap.xml dinámico
 * Incluye todas las páginas estáticas y productos del catálogo
 */
export default async function handler(req, res) {
  try {
    await connectDB();

    const baseUrl = 'https://colchonqn2.netlify.app';
    const currentDate = new Date().toISOString();

    // Obtener todos los productos visibles
    const productos = await Product.find({ mostrar: 'si' }).select('_id nombre updatedAt').lean();

    // URLs estáticas
    const staticPages = [
      {
        url: baseUrl,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: currentDate,
      },
    ];

    // URLs de productos
    const productPages = productos.map((producto) => ({
      url: `${baseUrl}/producto/${encodeURIComponent(producto._id)}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: producto.updatedAt ? new Date(producto.updatedAt).toISOString() : currentDate,
    }));

    // Combinar todas las URLs
    const allPages = [...staticPages, ...productPages];

    // Generar XML del sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    // Configurar headers para XML
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache por 1 hora

    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generando sitemap:', error);
    res.status(500).json({ error: 'Error al generar sitemap' });
  }
}

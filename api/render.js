/**
 * API Endpoint para servir HTML pre-renderizado a bots de búsqueda
 * Detecta Googlebot y otros crawlers y les sirve contenido con metadata
 */

import connectDB from './_lib/db.js';
import Product from './_lib/models/Product.js';

const isBot = (userAgent) => {
  if (!userAgent) return false;

  const botPatterns = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'LinkedInBot',
    'whatsapp',
    'telegrambot'
  ];

  return botPatterns.some(bot => userAgent.toLowerCase().includes(bot));
};

export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';

  // Si no es un bot, redirigir al SPA normal
  if (!isBot(userAgent)) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta http-equiv="refresh" content="0;url=/" />
        </head>
        <body></body>
      </html>
    `);
  }

  // Para bots, servir HTML con contenido real
  try {
    const { url } = req.query;
    const path = url || '/';

    // Detectar si es una página de producto
    const productMatch = path.match(/\/producto\/([^/]+)/);

    if (productMatch) {
      // Renderizar página de producto
      const productId = decodeURIComponent(productMatch[1]);

      await connectDB();
      const producto = await Product.findById(productId);

      if (!producto) {
        return res.status(404).send('<h1>Producto no encontrado</h1>');
      }

      const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${producto.nombre} | Aluminé Hogar</title>
  <meta name="description" content="${producto.descripcion || producto.nombre + ' - Aluminé Hogar'}">
  <link rel="canonical" href="https://aluminehogar.com.ar/producto/${productId}">

  <!-- Open Graph -->
  <meta property="og:title" content="${producto.nombre}">
  <meta property="og:description" content="${producto.descripcion || producto.nombre}">
  <meta property="og:image" content="${producto.imagen || ''}">
  <meta property="og:url" content="https://aluminehogar.com.ar/producto/${productId}">
  <meta property="og:type" content="product">

  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "${producto.nombre}",
    "description": "${producto.descripcion || producto.nombre}",
    "image": "${producto.imagen || ''}",
    "sku": "${producto._id}",
    "brand": {
      "@type": "Brand",
      "name": "Aluminé Hogar"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://aluminehogar.com.ar/producto/${productId}",
      "priceCurrency": "ARS",
      "price": "${producto.precio}",
      "availability": "https://schema.org/InStock"
    },
    "category": "${producto.categoria}"
  }
  </script>
</head>
<body>
  <main>
    <h1>${producto.nombre}</h1>
    <img src="${producto.imagen || ''}" alt="${producto.nombre}">
    <p>${producto.descripcion || ''}</p>
    <p>Precio: $${producto.precio}</p>
    <p>Categoría: ${producto.categoria}</p>
    ${producto.especificaciones ? `<div>${producto.especificaciones}</div>` : ''}
  </main>
</body>
</html>`;

      return res.status(200).send(html);
    }

    // Renderizar homepage
    await connectDB();
    const productos = await Product.find({ mostrar: 'si' }).limit(20);

    const productosHTML = productos.map(p => `
      <article>
        <h2><a href="/producto/${p._id}">${p.nombre}</a></h2>
        <img src="${p.imagen || ''}" alt="${p.nombre}" width="200">
        <p>$${p.precio}</p>
      </article>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Colchones y Almohadas Premium | Aluminé Hogar</title>
  <meta name="description" content="Descubrí la mejor selección de colchones y almohadas en Neuquén. Envíos a todo el país.">
  <link rel="canonical" href="https://aluminehogar.com.ar/">
</head>
<body>
  <header>
    <h1>Aluminé Hogar - Colchones y Almohadas Premium</h1>
  </header>
  <main>
    <section>
      <h2>Nuestros Productos</h2>
      ${productosHTML}
    </section>
  </main>
</body>
</html>`;

    return res.status(200).send(html);

  } catch (error) {
    console.error('Error rendering:', error);
    return res.status(500).send('<h1>Error al cargar la página</h1>');
  }
}

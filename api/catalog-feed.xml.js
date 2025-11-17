import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';
import { getCloudinaryUrl, IMG_DETAIL } from './_lib/cloudinary.js';

/**
 * Genera Facebook Product Feed en formato XML
 * Compatible con Meta Commerce Manager
 *
 * Especificación: https://developers.facebook.com/docs/commerce-platform/catalog/product-feed
 */

function buildCloudinaryPath(nombre) {
  return `alumine/${nombre}`;
}

/**
 * Escapa caracteres especiales para XML
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Mapea categoría de producto a Google Product Category
 */
function getGoogleProductCategory(categoria) {
  const categoriaLower = categoria?.toLowerCase() || '';

  // Mapeo de categorías locales a Google Product Taxonomy
  const mapping = {
    'colchones': '436',          // Furniture > Bedroom Furniture > Mattresses
    'almohadas': '574',          // Furniture > Bedroom Furniture > Bedding > Pillows
    'sommier': '436',            // Furniture > Bedroom Furniture > Mattresses
    'ropa de cama': '569',       // Home & Garden > Linens & Bedding > Bedding
    'sabanas': '569',            // Home & Garden > Linens & Bedding > Bedding
    'cubrecamas': '569',         // Home & Garden > Linens & Bedding > Bedding
    'frazadas': '569',           // Home & Garden > Linens & Bedding > Bedding
  };

  for (const [key, value] of Object.entries(mapping)) {
    if (categoriaLower.includes(key)) {
      return value;
    }
  }

  // Default: Furniture
  return '436';
}

/**
 * Genera el feed XML
 */
export default async function handler(req, res) {
  try {
    await connectDB();

    // Obtener todos los productos visibles
    const productos = await Product.find({ mostrar: 'si' }).sort({ categoria: 1, nombre: 1 });

    if (productos.length === 0) {
      return res.status(404).json({ error: 'No hay productos disponibles' });
    }

    const baseUrl = 'https://aluminehogar.com.ar';
    const currentDate = new Date().toISOString();

    // Generar items del feed
    const items = productos.map(producto => {
      const productoObj = producto.toObject();

      // Generar URL de imagen optimizada
      let imageUrl;
      if (productoObj.cloudinaryPublicId) {
        imageUrl = getCloudinaryUrl(productoObj.cloudinaryPublicId, IMG_DETAIL);
      } else {
        const cloudinaryPath = buildCloudinaryPath(productoObj.nombre);
        imageUrl = getCloudinaryUrl(cloudinaryPath, IMG_DETAIL);
      }

      // URL del producto
      const productUrl = `${baseUrl}/producto/${encodeURIComponent(productoObj._id)}`;

      // Descripción (máximo 5000 caracteres)
      let description = productoObj.descripcion || productoObj.nombre;
      if (description.length > 5000) {
        description = description.substring(0, 4997) + '...';
      }

      // Título (máximo 150 caracteres)
      let title = productoObj.nombre;
      if (title.length > 150) {
        title = title.substring(0, 147) + '...';
      }

      return `    <item>
      <g:id>${escapeXml(productoObj._id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${productoObj.precio} ARS</g:price>
      <g:brand>Aluminé Hogar</g:brand>
      <g:google_product_category>${getGoogleProductCategory(productoObj.categoria)}</g:google_product_category>
      <g:product_type>${escapeXml(productoObj.categoria)}</g:product_type>
    </item>`;
    }).join('\n');

    // Generar XML completo
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Aluminé Hogar - Catálogo de Productos</title>
    <link>${baseUrl}</link>
    <description>Colchones y almohadas premium en Neuquén. Envíos a todo el país.</description>
${items}
  </channel>
</rss>`;

    // Configurar headers para XML
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache 1 hora
    res.setHeader('Last-Modified', currentDate);

    console.log(`✅ Feed generado con ${productos.length} productos`);

    return res.status(200).send(xml);
  } catch (error) {
    console.error('❌ Error generando catalog feed:', error);
    return res.status(500).json({
      error: 'Error al generar catálogo',
      details: error.message
    });
  }
}

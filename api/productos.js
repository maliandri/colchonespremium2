import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from './_lib/cloudinary.js';

/**
 * Construye el path de Cloudinary usando el _id del producto
 * Ejemplo: _id="COL-001", categoria="Colchon" -> "alumine/alumine/colchon/COL-001"
 */
function buildCloudinaryPath(productId, categoria) {
  const categoriaLower = categoria.toLowerCase().replace(/\s+/g, '-');
  return `alumine/alumine/${categoriaLower}/${productId}`;
}

export default async function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('📋 Solicitud de productos recibida');

    // Conectar a la base de datos
    await connectDB();

    // Obtener productos visibles
    const productos = await Product.find({ mostrar: 'si' }).sort({ categoria: 1, nombre: 1 });

    // Transformar productos para incluir URLs optimizadas de Cloudinary
    const productosOptimizados = productos.map(producto => {
      const productoObj = producto.toObject();

      // SISTEMA SIMPLIFICADO:
      // Siempre construir el path usando el _id del producto
      const cloudinaryPath = buildCloudinaryPath(productoObj._id, productoObj.categoria);

      productoObj.imagenOptimizada = {
        original: productoObj.imagen || '',
        card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
        thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
        detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
        url: getCloudinaryUrl(cloudinaryPath, IMG_CARD)
      };

      return productoObj;
    });

    console.log(`✅ Enviando ${productosOptimizados.length} productos con imágenes optimizadas`);

    return res.status(200).json(productosOptimizados);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err);
    return res.status(500).json({ error: 'Error al cargar productos', details: err.message });
  }
}

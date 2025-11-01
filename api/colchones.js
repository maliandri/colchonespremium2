import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from './_lib/cloudinary.js';

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

      // Si la imagen ya está en Cloudinary, generar URLs optimizadas
      if (productoObj.imagen && productoObj.imagen.includes('cloudinary.com')) {
        const publicIdOrUrl = productoObj.cloudinaryPublicId || productoObj.imagen;

        productoObj.imagenOptimizada = {
          original: productoObj.imagen,
          card: getCloudinaryUrl(publicIdOrUrl, IMG_CARD),
          thumb: getCloudinaryUrl(publicIdOrUrl, IMG_THUMB),
          detail: getCloudinaryUrl(publicIdOrUrl, IMG_DETAIL),
          url: getCloudinaryUrl(publicIdOrUrl, IMG_CARD)
        };
      } else {
        productoObj.imagenOptimizada = {
          original: productoObj.imagen,
          card: productoObj.imagen,
          thumb: productoObj.imagen,
          detail: productoObj.imagen,
          url: productoObj.imagen
        };
      }

      return productoObj;
    });

    console.log(`✅ Enviando ${productosOptimizados.length} productos con imágenes optimizadas`);

    return res.status(200).json(productosOptimizados);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err);
    return res.status(500).json({ error: 'Error al cargar productos', details: err.message });
  }
}

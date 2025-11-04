import { connectDB } from '../_lib/db.js';
import Product from '../_lib/models/Product.js';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from '../_lib/cloudinary.js';

/**
 * Construye el path de Cloudinary usando el nombre del producto
 */
function buildCloudinaryPath(nombre) {
  return `alumine/${nombre}`;
}

export default async function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID de producto requerido' });
    }

    console.log(`📋 Solicitud de producto: ${id}`);

    // Conectar a la base de datos
    await connectDB();

    // Buscar el producto por ID o por nombre
    let producto = await Product.findById(id);

    // Si no se encuentra por ID, buscar por nombre
    if (!producto) {
      producto = await Product.findOne({ nombre: id });
    }

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Transformar producto para incluir URLs optimizadas de Cloudinary
    const productoObj = producto.toObject();

    // Usar cloudinaryPublicId si existe, sino construir con el nombre
    let cloudinaryPath;
    if (productoObj.cloudinaryPublicId) {
      cloudinaryPath = productoObj.cloudinaryPublicId;
    } else {
      cloudinaryPath = buildCloudinaryPath(productoObj.nombre);
    }

    productoObj.imagenOptimizada = {
      original: productoObj.imagen || '',
      card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
      thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
      detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
      url: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL) // Usar imagen de alta calidad para detalle
    };

    console.log(`✅ Producto encontrado: ${productoObj.nombre}`);

    return res.status(200).json(productoObj);
  } catch (err) {
    console.error('❌ Error al obtener producto:', err);
    return res.status(500).json({ error: 'Error al cargar producto', details: err.message });
  }
}

import { connectDB } from '../_lib/db.js';
import Product from '../_lib/models/Product.js';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from '../_lib/cloudinary.js';
import { MAPEO_NOMBRES_CLOUDINARY } from '../_lib/cloudinary-mapeo-nombres.js';

/**
 * Obtiene el path de Cloudinary basado en el nombre del producto
 */
function getCloudinaryPathFromNombre(nombre) {
  return MAPEO_NOMBRES_CLOUDINARY[nombre] || null;
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

    // USAR ACCESO DIRECTO A COLECCIÓN (sin Mongoose) para obtener todos los campos
    const db = Product.db;
    const collection = db.collection('productos');
    const producto = await collection.findOne({ _id: id });

    if (!producto) {
      console.log(`❌ Producto no encontrado: ${id}`);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // PRIORIDAD: Buscar por nombre del producto en el mapeo
    let cloudinaryPath = getCloudinaryPathFromNombre(producto.nombre);

    // FALLBACK: Usar cloudinaryPublicId si existe y no hay mapeo por nombre
    if (!cloudinaryPath && producto.cloudinaryPublicId) {
      cloudinaryPath = producto.cloudinaryPublicId;
    }

    producto.imagenOptimizada = cloudinaryPath ? {
      original: producto.imagen || '',
      card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
      thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
      detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
      url: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL) // Usar imagen de alta calidad para detalle
    } : {
      original: '',
      card: '',
      thumb: '',
      detail: '',
      url: ''
    };

    console.log(`✅ Producto encontrado: ${producto.nombre}`);

    return res.status(200).json(producto);
  } catch (err) {
    console.error('❌ Error al obtener producto:', err);
    return res.status(500).json({ error: 'Error al cargar producto', details: err.message });
  }
}

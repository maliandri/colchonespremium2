import { connectDB } from '../_lib/db.js';
import Product from '../_lib/models/Product.js';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from '../_lib/cloudinary.js';
import { MAPEO_NOMBRES_CLOUDINARY } from '../_lib/cloudinary-mapeo-nombres.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de producto requerido' });
  }

  try {
    await connectDB();

    const db = Product.db;
    const collection = db.collection('productos');
    const producto = await collection.findOne({ _id: decodeURIComponent(id) });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const cloudinaryPath =
      MAPEO_NOMBRES_CLOUDINARY[producto.nombre] ||
      producto.cloudinaryPublicId ||
      null;

    producto.imagenOptimizada = cloudinaryPath
      ? {
          original: producto.imagen || '',
          card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
          thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
          detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
          url: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
        }
      : { original: '', card: '', thumb: '', detail: '', url: '' };

    return res.status(200).json(producto);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    return res.status(500).json({ error: 'Error del servidor', details: error.message });
  }
}

/**
 * Endpoint de debug temporal para verificar qué está devolviendo MongoDB
 */

import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';

export default async function handler(req, res) {
  try {
    await connectDB();

    const producto = await Product.findOne({ _id: 'FRE-0002' }).lean();

    return res.status(200).json({
      encontrado: !!producto,
      producto: producto ? {
        _id: producto._id,
        nombre: producto.nombre,
        cloudinaryPublicId: producto.cloudinaryPublicId,
        imagen: producto.imagen,
        tieneCloudinaryPublicId: !!producto.cloudinaryPublicId
      } : null,
      dbUri: process.env.MONGODB_URI || process.env.DB_URI ? 'CONFIGURADO' : 'NO CONFIGURADO'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

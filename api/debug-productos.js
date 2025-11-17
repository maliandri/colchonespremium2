/**
 * Endpoint de debug temporal para verificar qué está devolviendo MongoDB
 */

import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';

export default async function handler(req, res) {
  try {
    await connectDB();

    // Intentar con modelo
    const productoConModelo = await Product.findOne({ _id: 'FRE-0002' }).lean();

    // Intentar sin modelo (acceso directo a colección)
    const db = Product.db;
    const collection = db.collection('productos');
    const productoSinModelo = await collection.findOne({ _id: 'FRE-0002' });

    return res.status(200).json({
      conModelo: productoConModelo ? {
        _id: productoConModelo._id,
        nombre: productoConModelo.nombre,
        cloudinaryPublicId: productoConModelo.cloudinaryPublicId,
        tieneCloudinaryPublicId: !!productoConModelo.cloudinaryPublicId,
        camposDisponibles: Object.keys(productoConModelo)
      } : null,
      sinModelo: productoSinModelo ? {
        _id: productoSinModelo._id,
        nombre: productoSinModelo.nombre,
        cloudinaryPublicId: productoSinModelo.cloudinaryPublicId,
        tieneCloudinaryPublicId: !!productoSinModelo.cloudinaryPublicId,
        camposDisponibles: Object.keys(productoSinModelo)
      } : null,
      dbUri: 'CONFIGURADO'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}

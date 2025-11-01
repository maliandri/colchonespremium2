import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';

export default async function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🏷️ Solicitud de categorías recibida');

    // Conectar a la base de datos
    await connectDB();

    // Obtener categorías únicas de productos visibles
    const categorias = await Product.distinct('categoria', { mostrar: 'si' });

    console.log(`✅ Enviando ${categorias.length} categorías:`, categorias);

    return res.status(200).json(categorias);
  } catch (err) {
    console.error('❌ Error al obtener categorías:', err);
    return res.status(500).json({ error: 'Error al cargar categorías', details: err.message });
  }
}

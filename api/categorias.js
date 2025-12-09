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

    // Esperar hasta que la conexión esté realmente lista
    let attempts = 0;
    while ((!Product.db || Product.db.readyState !== 1) && attempts < 10) {
      console.log(`⏳ Esperando conexión MongoDB (intento ${attempts + 1}/10)...`);
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }

    if (!Product.db || Product.db.readyState !== 1) {
      throw new Error('MongoDB no se conectó después de varios intentos');
    }

    // USAR ACCESO DIRECTO A COLECCIÓN (sin Mongoose schema) para evitar filtrado de campos
    const db = Product.db;
    const collection = db.collection('productos');

    // Obtener categorías únicas de productos visibles
    const categorias = await collection.distinct('categoria', { mostrar: 'si' });

    console.log(`✅ Enviando ${categorias.length} categorías:`, categorias);

    return res.status(200).json(categorias);
  } catch (err) {
    console.error('❌ Error al obtener categorías:', err);
    return res.status(500).json({ error: 'Error al cargar categorías', details: err.message });
  }
}

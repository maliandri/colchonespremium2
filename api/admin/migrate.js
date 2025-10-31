import { connectDB } from '../_lib/db.js';
import { migrateExcelDataToMongoDB } from '../_lib/migrateExcel.js';
import Product from '../_lib/models/Product.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔄 Migración forzada solicitada...');
    
    await connectDB();
    
    const result = await migrateExcelDataToMongoDB();
    
    const stats = {
      totalProductos: await Product.countDocuments(),
      productosVisibles: await Product.countDocuments({ mostrar: 'si' }),
      categorias: await Product.distinct('categoria', { mostrar: 'si' })
    };
    
    return res.status(200).json({
      message: 'Migración completada',
      result: result,
      stats: stats
    });
  } catch (error) {
    console.error('Error en migración forzada:', error);
    return res.status(500).json({ 
      error: 'Error en la migración',
      details: error.message 
    });
  }
}
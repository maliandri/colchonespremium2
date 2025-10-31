import { connectDB } from '../_lib/db.js';
import Product from '../_lib/models/Product.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();

    const productos = await Product.find({}).sort({ categoria: 1, nombre: 1 });
    
    const stats = {
      total: productos.length,
      visibles: productos.filter(p => p.mostrar === 'si').length,
      ocultos: productos.filter(p => p.mostrar !== 'si').length,
      categorias: [...new Set(productos.map(p => p.categoria))],
      porCategoria: {}
    };
    
    productos.forEach(p => {
      stats.porCategoria[p.categoria] = (stats.porCategoria[p.categoria] || 0) + 1;
    });
    
    return res.status(200).json({
      productos: productos,
      estadisticas: stats
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ error: 'Error al cargar productos' });
  }
}
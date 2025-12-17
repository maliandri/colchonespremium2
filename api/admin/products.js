/**
 * API Admin de Productos (CRUD)
 * Requiere autenticación y rol de admin
 */
import { connectDB } from '../_lib/db.js';
import Product from '../_lib/models/Product.js';
import { extractTokenFromRequest, verifyToken, requireAdmin } from '../_lib/auth-helpers.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verificar autenticación
    const token = extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const decoded = verifyToken(token);
    requireAdmin(decoded); // Verificar que sea admin

    await connectDB();

    // GET - Listar todos los productos
    if (req.method === 'GET') {
      const productos = await Product.find({})
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        productos,
        total: productos.length
      });
    }

    // POST - Crear nuevo producto
    if (req.method === 'POST') {
      const {
        nombre,
        descripcion,
        precio,
        categoria,
        medidas,
        imagen,
        imagenOptimizada,
        mostrar,
        stock
      } = req.body;

      // Validaciones
      if (!nombre || !precio || !categoria) {
        return res.status(400).json({
          error: 'Nombre, precio y categoría son requeridos'
        });
      }

      const nuevoProducto = new Product({
        nombre,
        descripcion: descripcion || '',
        precio: parseFloat(precio),
        categoria,
        medidas: medidas || '',
        imagen: imagen || '',
        imagenOptimizada: imagenOptimizada || '',
        mostrar: mostrar || 'si',
        stock: stock || 0
      });

      await nuevoProducto.save();

      console.log(`✅ Producto creado: ${nombre} por admin ${decoded.email}`);

      return res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        producto: nuevoProducto
      });
    }

    // PUT - Actualizar producto
    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID de producto requerido' });
      }

      const updates = req.body;
      delete updates._id; // No actualizar el _id

      const productoActualizado = await Product.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!productoActualizado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      console.log(`✅ Producto actualizado: ${id} por admin ${decoded.email}`);

      return res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        producto: productoActualizado
      });
    }

    // DELETE - Eliminar producto
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID de producto requerido' });
      }

      const productoEliminado = await Product.findByIdAndDelete(id);

      if (!productoEliminado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      console.log(`✅ Producto eliminado: ${id} por admin ${decoded.email}`);

      return res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('❌ Error en admin products:', error);

    if (error.message.includes('Token inválido') || error.message.includes('administrador')) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

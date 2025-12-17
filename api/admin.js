/**
 * API Admin (CRUD Productos + Upload Image combinados)
 * Maneja /api/admin?action=products y /api/admin?action=upload
 */
import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';
import { extractTokenFromRequest, verifyToken, requireAdmin } from './_lib/auth-helpers.js';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

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

    const { action } = req.query;

    // =================== UPLOAD IMAGE ===================
    if (action === 'upload' && req.method === 'POST') {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Imagen requerida' });
      }

      const result = await cloudinary.uploader.upload(image, {
        folder: 'colchones-premium',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      const optimizedUrl = cloudinary.url(result.public_id, {
        width: 400,
        height: 400,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      });

      console.log(`✅ Imagen subida por admin ${decoded.email}: ${result.secure_url}`);

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        optimizedUrl,
        publicId: result.public_id
      });
    }

    // =================== PRODUCTS CRUD ===================
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
      delete updates._id;

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
    console.error('❌ Error en admin:', error);

    if (error.message.includes('Token inválido') || error.message.includes('administrador')) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

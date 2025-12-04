import { connectDB } from './_lib/db.js';
import Venta from './_lib/models/Venta.js';
import { authMiddleware } from './_lib/auth.js';

async function handler(req, res) {
  try {
    // Conectar a la base de datos
    await connectDB();

    // POST: Crear nueva venta
    if (req.method === 'POST') {
      console.log('💰 Solicitud para guardar venta recibida');

      const { productos, total, estado } = req.body;

      // Validar datos
      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Debe incluir al menos un producto' });
      }

      if (!total || typeof total !== 'number') {
        return res.status(400).json({ error: 'El total es requerido y debe ser un número' });
      }

      // Crear nueva venta
      const newVenta = new Venta({
        userId: req.user.id,
        productos,
        total,
        estado: estado || 'presupuesto'
      });

      await newVenta.save();

      console.log(`✅ Venta guardada exitosamente para usuario ${req.user.id}`);

      return res.status(201).json({
        message: 'Venta registrada exitosamente.',
        venta: newVenta
      });
    }

    // GET: Obtener historial de ventas
    if (req.method === 'GET') {
      console.log('📜 Solicitud de historial de ventas recibida');

      // Obtener historial del usuario autenticado
      const historial = await Venta.find({ userId: req.user.id }).sort({ fecha: -1 });

      console.log(`✅ Enviando ${historial.length} ventas del historial`);

      return res.status(200).json(historial);
    }

    // Método no permitido
    return res.status(405).json({ error: 'Método no permitido' });

  } catch (err) {
    console.error('❌ Error en ventas:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// Exportar con middleware de autenticación
export default authMiddleware(handler);

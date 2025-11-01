import { connectDB } from '../_lib/db.js';
import Venta from '../_lib/models/Venta.js';
import { authMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('📜 Solicitud de historial de ventas recibida');

    // Conectar a la base de datos
    await connectDB();

    // Obtener historial del usuario autenticado
    const historial = await Venta.find({ userId: req.user.id }).sort({ fecha: -1 });

    console.log(`✅ Enviando ${historial.length} ventas del historial`);

    return res.status(200).json(historial);
  } catch (err) {
    console.error('❌ Error al obtener el historial de ventas:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// Exportar con middleware de autenticación
export default authMiddleware(handler);

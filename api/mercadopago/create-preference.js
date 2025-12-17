/**
 * API para crear preferencia de pago en Mercado Pago
 */
import mercadopago from 'mercadopago';
import { extractTokenFromRequest, verifyToken } from '../_lib/auth-helpers.js';

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación (usuario debe estar logueado)
    const token = extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Debe iniciar sesión para comprar' });
    }

    const decoded = verifyToken(token);

    const { items, payer, shippingAddress } = req.body;

    // Validaciones
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un producto' });
    }

    if (!payer || !payer.email) {
      return res.status(400).json({ error: 'Información del comprador requerida' });
    }

    // Crear preferencia de pago
    const preference = {
      items: items.map(item => ({
        title: item.nombre,
        description: item.descripcion?.substring(0, 100) || '',
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.precio),
        currency_id: 'ARS',
        picture_url: item.imagen || ''
      })),
      payer: {
        name: payer.nombre || '',
        email: payer.email,
        phone: {
          number: payer.telefono || ''
        }
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago-exitoso`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago-fallido`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago-pendiente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.VERCEL_URL || 'https://tu-dominio.vercel.app'}/api/mercadopago/webhook`,
      statement_descriptor: 'COLCHONES PREMIUM',
      external_reference: `order_${Date.now()}_${decoded.userId}`,
      metadata: {
        userId: decoded.userId,
        userEmail: decoded.email
      }
    };

    // Si hay dirección de envío
    if (shippingAddress) {
      preference.shipments = {
        receiver_address: {
          zip_code: shippingAddress.codigoPostal || '',
          street_name: shippingAddress.calle || '',
          street_number: shippingAddress.numero || '',
          floor: shippingAddress.piso || '',
          apartment: shippingAddress.depto || ''
        }
      };
    }

    const response = await mercadopago.preferences.create(preference);

    console.log(`✅ Preferencia de pago creada para ${decoded.email}: ${response.body.id}`);

    return res.status(200).json({
      success: true,
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
      sandboxInitPoint: response.body.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Error creando preferencia de pago:', error);

    if (error.message && error.message.includes('Token')) {
      return res.status(401).json({ error: 'Sesión expirada' });
    }

    return res.status(500).json({
      error: 'Error al procesar el pago',
      details: error.message
    });
  }
}

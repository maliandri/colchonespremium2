/**
 * API Mercado Pago (Create Preference + Webhook combinados)
 */
import mercadopago from 'mercadopago';
import { connectDB } from './_lib/db.js';
import Order from './_lib/models/Order.js';
import { extractTokenFromRequest, verifyToken } from './_lib/auth-helpers.js';
import nodemailer from 'nodemailer';

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_MAIL_USER,
    pass: Buffer.from(process.env.ZOHO_MAIL_PASS, 'base64').toString('utf-8')
  }
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

  const { action } = req.query;

  try {
    // =================== CREATE PREFERENCE ===================
    if (action === 'create') {
      // Verificar autenticación
      const token = extractTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'Debe iniciar sesión para comprar' });
      }

      const decoded = verifyToken(token);
      const { items, payer, shippingAddress } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Debe incluir al menos un producto' });
      }

      if (!payer || !payer.email) {
        return res.status(400).json({ error: 'Información del comprador requerida' });
      }

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
        notification_url: `${process.env.VERCEL_URL || 'https://tu-dominio.vercel.app'}/api/mercadopago?action=webhook`,
        statement_descriptor: 'COLCHONES PREMIUM',
        external_reference: `order_${Date.now()}_${decoded.userId}`,
        metadata: {
          userId: decoded.userId,
          userEmail: decoded.email
        }
      };

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
    }

    // =================== WEBHOOK ===================
    if (action === 'webhook') {
      const { topic, id } = req.query;

      console.log(`📨 Webhook recibido - Topic: ${topic}, ID: ${id}`);

      if (topic === 'payment' || topic === 'merchant_order') {
        await connectDB();

        const payment = await mercadopago.payment.get(id);
        const paymentData = payment.body;

        console.log(`💳 Estado del pago: ${paymentData.status}`);

        let order = await Order.findOne({ mercadoPagoId: id.toString() });

        if (!order) {
          order = new Order({
            mercadoPagoId: id.toString(),
            externalReference: paymentData.external_reference,
            userId: paymentData.metadata?.user_id || null,
            estado: paymentData.status,
            total: paymentData.transaction_amount,
            paymentMethod: paymentData.payment_method_id,
            payer: {
              nombre: paymentData.payer?.first_name || '',
              email: paymentData.payer?.email || '',
              telefono: paymentData.payer?.phone?.number || ''
            }
          });
        } else {
          order.estado = paymentData.status;
          order.paymentMethod = paymentData.payment_method_id;
          order.updatedAt = new Date();
        }

        await order.save();

        if (paymentData.status === 'approved') {
          console.log('✅ Pago aprobado, enviando email de confirmación...');

          try {
            await transporter.sendMail({
              from: `"Colchones Premium" <${process.env.ZOHO_MAIL_USER}>`,
              to: paymentData.payer.email,
              subject: '✅ Compra confirmada - Colchones Premium',
              html: `
                <h2>¡Gracias por tu compra!</h2>
                <p>Hola ${paymentData.payer.first_name},</p>
                <p>Tu pago ha sido confirmado exitosamente.</p>
                <h3>Detalles de la compra:</h3>
                <ul>
                  <li><strong>Número de pedido:</strong> ${paymentData.external_reference}</li>
                  <li><strong>Monto:</strong> $${paymentData.transaction_amount} ARS</li>
                  <li><strong>Método de pago:</strong> ${paymentData.payment_method_id}</li>
                </ul>
                <p>En breve nos pondremos en contacto contigo para coordinar la entrega.</p>
                <p><strong>Teléfono:</strong> +54 9 299 576-9999</p>
                <p><strong>WhatsApp:</strong> https://wa.me/5492995769999</p>
                <p>¡Gracias por confiar en Colchones Premium! 🛏️</p>
              `
            });

            await transporter.sendMail({
              from: `"Colchones Premium" <${process.env.ZOHO_MAIL_USER}>`,
              to: process.env.ZOHO_MAIL_USER,
              subject: `🔔 Nueva venta - ${paymentData.external_reference}`,
              html: `
                <h2>Nueva venta confirmada</h2>
                <h3>Cliente:</h3>
                <ul>
                  <li><strong>Nombre:</strong> ${paymentData.payer.first_name}</li>
                  <li><strong>Email:</strong> ${paymentData.payer.email}</li>
                  <li><strong>Teléfono:</strong> ${paymentData.payer.phone?.number || 'No proporcionado'}</li>
                </ul>
                <h3>Detalles del pago:</h3>
                <ul>
                  <li><strong>ID:</strong> ${id}</li>
                  <li><strong>Referencia:</strong> ${paymentData.external_reference}</li>
                  <li><strong>Monto:</strong> $${paymentData.transaction_amount} ARS</li>
                  <li><strong>Método:</strong> ${paymentData.payment_method_id}</li>
                </ul>
                <p><a href="https://www.mercadopago.com.ar/activities" target="_blank">Ver en Mercado Pago</a></p>
              `
            });

            console.log('✅ Emails de confirmación enviados');

          } catch (emailError) {
            console.error('❌ Error enviando emails:', emailError);
          }
        }

        return res.status(200).json({ success: true });
      }

      return res.status(200).json({ message: 'Ignored' });
    }

    return res.status(400).json({ error: 'Acción no válida. Usa ?action=create o ?action=webhook' });

  } catch (error) {
    console.error('❌ Error en mercadopago:', error);

    if (error.message && error.message.includes('Token')) {
      return res.status(401).json({ error: 'Sesión expirada' });
    }

    return res.status(200).json({ error: error.message });
  }
}

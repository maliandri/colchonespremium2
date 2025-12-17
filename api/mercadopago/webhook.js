/**
 * Webhook de Mercado Pago
 * Recibe notificaciones de pagos aprobados/rechazados
 */
import mercadopago from 'mercadopago';
import { connectDB } from '../_lib/db.js';
import Order from '../_lib/models/Order.js';
import nodemailer from 'nodemailer';

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Configurar email
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Mercado Pago envía notificaciones como query params
    const { topic, id } = req.query;

    console.log(`📨 Webhook recibido - Topic: ${topic}, ID: ${id}`);

    if (topic === 'payment' || topic === 'merchant_order') {
      await connectDB();

      // Consultar el pago en Mercado Pago
      const payment = await mercadopago.payment.get(id);
      const paymentData = payment.body;

      console.log(`💳 Estado del pago: ${paymentData.status}`);

      // Buscar o crear orden en la base de datos
      let order = await Order.findOne({ mercadoPagoId: id.toString() });

      if (!order) {
        // Crear nueva orden si no existe
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
        // Actualizar orden existente
        order.estado = paymentData.status;
        order.paymentMethod = paymentData.payment_method_id;
        order.updatedAt = new Date();
      }

      await order.save();

      // Si el pago fue aprobado, enviar email de confirmación
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

          // Enviar copia al admin
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
          // No fallar el webhook si falla el email
        }
      }

      return res.status(200).json({ success: true });
    }

    // Otros tipos de notificaciones
    return res.status(200).json({ message: 'Ignored' });

  } catch (error) {
    console.error('❌ Error en webhook:', error);
    // IMPORTANTE: Siempre responder 200 para que Mercado Pago no reintente
    return res.status(200).json({ error: error.message });
  }
}

/**
 * API Chatbot (Conversación + Enviar Lead combinados)
 */
import { conversarConGemini } from './_lib/gemini.js';
import nodemailer from 'nodemailer';

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { action } = req.query;

  try {
    // =================== CONVERSACIÓN ===================
    if (action === 'conversation' || !action) {
      const { message, history, sessionId } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'El campo "message" es requerido y debe ser un string' });
      }

      const response = await conversarConGemini(message, history || [], sessionId);

      return res.status(200).json(response);
    }

    // =================== ENVIAR LEAD ===================
    if (action === 'lead') {
      const { leadData, conversationSummary, sessionId } = req.body;

      if (!leadData || !leadData.email) {
        return res.status(400).json({ error: 'leadData con email es requerido' });
      }

      const conversacionTexto = conversationSummary && Array.isArray(conversationSummary)
        ? conversationSummary.map(msg => `${msg.role === 'user' ? 'Cliente' : 'Bot'}: ${msg.content}`).join('\n')
        : 'Sin conversación disponible';

      const emailCliente = `
        <h2>¡Gracias por tu interés en Colchones Premium!</h2>
        <p>Hola ${leadData.nombre || 'Cliente'},</p>
        <p>Hemos recibido tu consulta y un especialista se pondrá en contacto contigo pronto.</p>
        <h3>Datos de contacto:</h3>
        <ul>
          <li><strong>Email:</strong> ${leadData.email}</li>
          ${leadData.telefono ? `<li><strong>Teléfono:</strong> ${leadData.telefono}</li>` : ''}
          ${leadData.direccion ? `<li><strong>Dirección:</strong> ${leadData.direccion}</li>` : ''}
        </ul>
        <p>¡Gracias por confiar en nosotros! 🛏️</p>
      `;

      const emailAdmin = `
        <h2>Nuevo Lead Capturado</h2>
        <h3>Información del Cliente:</h3>
        <ul>
          <li><strong>Nombre:</strong> ${leadData.nombre || 'No proporcionado'}</li>
          <li><strong>Email:</strong> ${leadData.email}</li>
          <li><strong>Teléfono:</strong> ${leadData.telefono || 'No proporcionado'}</li>
          <li><strong>Dirección:</strong> ${leadData.direccion || 'No proporcionado'}</li>
          <li><strong>Interés:</strong> ${leadData.interes || 'No especificado'}</li>
          <li><strong>Session ID:</strong> ${sessionId || 'N/A'}</li>
        </ul>
        <h3>Conversación Completa:</h3>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${conversacionTexto}</pre>
      `;

      await transporter.sendMail({
        from: `"Colchones Premium" <${process.env.ZOHO_MAIL_USER}>`,
        to: leadData.email,
        subject: 'Gracias por tu interés - Colchones Premium',
        html: emailCliente
      });

      await transporter.sendMail({
        from: `"Colchones Premium" <${process.env.ZOHO_MAIL_USER}>`,
        to: process.env.ZOHO_MAIL_USER,
        subject: `Nuevo Lead: ${leadData.nombre || leadData.email}`,
        html: emailAdmin
      });

      console.log(`✅ Lead enviado: ${leadData.email}`);

      return res.status(200).json({ success: true, message: 'Lead enviado exitosamente' });
    }

    return res.status(400).json({ error: 'Acción no válida. Usa ?action=conversation o ?action=lead' });

  } catch (error) {
    console.error('❌ Error en chatbot:', error);
    return res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
}

/**
 * API Serverless para enviar leads capturados por el chatbot
 */

import { enviarEmail } from '../_lib/email.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { leadData, conversationSummary, sessionId } = req.body;

    if (!leadData) {
      return res.status(400).json({ error: 'Datos del lead requeridos' });
    }

    console.log('📧 [Lead] Procesando lead capturado por chatbot');
    console.log('📊 Datos del lead:', JSON.stringify(leadData, null, 2));

    // Verificar configuración de email
    const destinatario = process.env.EMAIL_EMPRESA || process.env.EMAIL_USER;
    console.log(`📬 Destinatario configurado: ${destinatario}`);

    if (!destinatario) {
      console.error('❌ No hay destinatario configurado');
      // Guardar el lead localmente aunque no se pueda enviar email
      return res.status(200).json({
        success: true,
        message: 'Lead capturado (email no configurado)',
        warning: 'Email no enviado - configuración pendiente'
      });
    }

    // Construir el email HTML
    const emailHtml = construirEmailLead(leadData, conversationSummary, sessionId);

    // Determinar el asunto según el tipo de solicitud
    const esAsistenciaHumana = leadData.tipoSolicitud === 'asistencia_humana';
    const asunto = esAsistenciaHumana
      ? `👨‍💼 Solicitud de Asistencia Humana - ${leadData.nombre || 'Cliente'}`
      : `🤖 Nuevo Lead del Chatbot - ${leadData.nombre || 'Cliente'}`;

    console.log(`📧 Intentando enviar email a: ${destinatario}`);

    try {
      await enviarEmail({
        destinatario,
        asunto,
        cuerpoHtml: emailHtml
      });

      console.log('✅ Email enviado exitosamente');
      return res.status(200).json({
        success: true,
        message: 'Lead enviado exitosamente'
      });

    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError.message);
      console.error('Stack:', emailError.stack);

      // El lead se capturó pero el email falló
      return res.status(200).json({
        success: true,
        message: 'Lead capturado (error al enviar email)',
        warning: `Error de email: ${emailError.message}`,
        leadData: leadData
      });
    }

  } catch (error) {
    console.error('❌ Error general al procesar lead:', error);
    return res.status(500).json({
      error: 'Error al procesar lead',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Construye el HTML del email con los datos del lead
 */
function construirEmailLead(leadData, conversationSummary, sessionId) {
  const fecha = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const esAsistenciaHumana = leadData.tipoSolicitud === 'asistencia_humana';
  const titulo = esAsistenciaHumana ? '👨‍💼 Solicitud de Asistencia Humana' : '🤖 Nuevo Lead del Chatbot';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Lead del Chatbot</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 20px -30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 5px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .info-section {
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      border-radius: 4px;
    }
    .info-section h2 {
      margin: 0 0 15px 0;
      color: #667eea;
      font-size: 18px;
      font-weight: 600;
    }
    .info-row {
      display: flex;
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      min-width: 120px;
    }
    .info-value {
      color: #333;
      flex: 1;
    }
    .conversation-box {
      background-color: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
      max-height: 300px;
      overflow-y: auto;
    }
    .conversation-box p {
      margin: 8px 0;
      padding: 8px 12px;
      background-color: #f8f9fa;
      border-radius: 6px;
      font-size: 14px;
    }
    .priority-badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #ff6b6b;
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .cta-button {
      display: inline-block;
      margin: 20px 0;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${titulo}</h1>
      <p>${fecha}</p>
    </div>

    ${esAsistenciaHumana && leadData.interes ? `
    <div class="info-section" style="background-color: #fff3cd; border-left-color: #ffc107;">
      <h2 style="color: #856404;">💬 Consulta del Cliente</h2>
      <div class="info-row" style="border-bottom: none;">
        <span class="info-value" style="font-size: 16px; font-weight: 500; color: #333;">
          ${leadData.interes}
        </span>
      </div>
    </div>
    ` : ''}

    <div class="info-section">
      <h2>📋 Información del Cliente</h2>
      ${leadData.nombre ? `
      <div class="info-row">
        <span class="info-label">👤 Nombre:</span>
        <span class="info-value"><strong>${leadData.nombre}</strong></span>
      </div>
      ` : ''}

      ${leadData.email ? `
      <div class="info-row">
        <span class="info-label">📧 Email:</span>
        <span class="info-value"><a href="mailto:${leadData.email}">${leadData.email}</a></span>
      </div>
      ` : ''}

      ${leadData.telefono ? `
      <div class="info-row">
        <span class="info-label">📱 Teléfono:</span>
        <span class="info-value"><a href="tel:${leadData.telefono}">${leadData.telefono}</a></span>
      </div>
      ` : ''}

      ${leadData.direccion ? `
      <div class="info-row">
        <span class="info-label">📍 Dirección:</span>
        <span class="info-value">${leadData.direccion}</span>
      </div>
      ` : ''}

      ${!esAsistenciaHumana && leadData.interes ? `
      <div class="info-row">
        <span class="info-label">🎯 Interés:</span>
        <span class="info-value">${leadData.interes}</span>
      </div>
      ` : ''}
    </div>

    ${conversationSummary && conversationSummary.length > 0 ? `
    <div class="info-section">
      <h2>💬 Resumen de la Conversación</h2>
      <div class="conversation-box">
        ${conversationSummary.map(msg => `
          <p><strong>${msg.role === 'user' ? 'Cliente' : 'Bot'}:</strong> ${msg.content}</p>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div style="text-align: center;">
      <span class="priority-badge">⚡ REQUIERE SEGUIMIENTO</span>
    </div>

    ${leadData.telefono ? `
    <div style="text-align: center;">
      <a href="https://wa.me/${leadData.telefono.replace(/\D/g, '')}" class="cta-button">
        💬 Contactar por WhatsApp
      </a>
    </div>
    ` : ''}

    <div class="footer">
      <p><strong>ID de Sesión:</strong> ${sessionId || 'N/A'}</p>
      <p>Este lead fue capturado automáticamente por el chatbot de Aluminé Hogar</p>
      <p>Para mejores resultados, responde dentro de las próximas 24 horas</p>
    </div>
  </div>
</body>
</html>
  `;
}

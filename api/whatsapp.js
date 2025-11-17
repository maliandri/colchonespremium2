/**
 * Webhook de WhatsApp Business API + IA con Gemini
 * Función serverless única que maneja:
 * - Verificación del webhook
 * - Recepción de mensajes
 * - Procesamiento con IA
 * - Búsqueda de productos
 * - Envío de respuestas
 */

import { generateAIResponse, detectIntent } from './_lib/gemini.js';
import { sendTextMessage, sendImageMessage, markAsRead } from './_lib/whatsapp-client.js';
import { searchProducts, formatProductsForWhatsApp, formatSingleProductForWhatsApp } from './_lib/product-search.js';

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'alumine_hogar_2024';

// Cache simple de conversaciones (en producción usar Redis o MongoDB)
const conversationCache = new Map();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // GET: Verificación del webhook
    if (req.method === 'GET') {
      return handleWebhookVerification(req, res);
    }

    // POST: Procesar mensaje entrante
    if (req.method === 'POST') {
      return await handleIncomingMessage(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Error en webhook de WhatsApp:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Maneja la verificación del webhook (Meta lo requiere)
 */
function handleWebhookVerification(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado exitosamente');
    return res.status(200).send(challenge);
  }

  console.error('❌ Verificación de webhook fallida');
  return res.status(403).json({ error: 'Forbidden' });
}

/**
 * Procesa mensajes entrantes de WhatsApp
 */
async function handleIncomingMessage(req, res) {
  const body = req.body;

  // Verificar que sea una notificación válida
  if (!body.object || body.object !== 'whatsapp_business_account') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Responder inmediatamente a Meta (requerido)
  res.status(200).json({ success: true });

  // Procesar el mensaje de forma asíncrona
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) {
      console.log('ℹ️ Notificación sin mensajes');
      return;
    }

    const message = value.messages[0];
    const from = message.from; // Número del usuario
    const messageId = message.id;
    const messageType = message.type;

    // Marcar mensaje como leído
    await markAsRead(messageId);

    // Procesar solo mensajes de texto
    if (messageType !== 'text') {
      await sendTextMessage(
        from,
        'Disculpa, solo puedo procesar mensajes de texto por ahora. ¿En qué puedo ayudarte?'
      );
      return;
    }

    const userMessage = message.text.body;
    console.log(`📩 Mensaje recibido de ${from}: "${userMessage}"`);

    // Procesar el mensaje
    await processMessage(from, userMessage);

  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);
  }
}

/**
 * Procesa el mensaje del usuario con IA
 */
async function processMessage(userPhone, userMessage) {
  try {
    // Detectar intención
    const intent = detectIntent(userMessage);
    console.log(`🎯 Intención detectada: ${intent}`);

    // Obtener historial de conversación
    const conversationHistory = conversationCache.get(userPhone) || [];

    // Buscar productos relevantes si es necesario
    let productContext = [];
    let aiResponse = '';

    if (intent === 'greeting') {
      // Saludo inicial con menú
      aiResponse = `¡Hola! 👋 Bienvenido a *Aluminé Hogar*

Soy tu asistente virtual. Puedo ayudarte a:

🛏️ *Ver colchones* disponibles
🛏️ *Ver almohadas* disponibles
💰 *Consultar precios*
🚚 *Información de envío*
📋 *Generar presupuesto*

¿Qué te gustaría saber?`;

    } else if (intent === 'product_search') {
      // Buscar productos en MongoDB
      productContext = await searchProducts(userMessage);

      if (productContext.length > 0) {
        aiResponse = formatProductsForWhatsApp(productContext);
      } else {
        productContext = await searchProducts('todos');
        aiResponse = await generateAIResponse(
          userMessage,
          productContext,
          conversationHistory
        );
      }

    } else {
      // Buscar productos para dar contexto a la IA
      productContext = await searchProducts(userMessage);

      // Generar respuesta con IA
      aiResponse = await generateAIResponse(
        userMessage,
        productContext,
        conversationHistory
      );
    }

    // Enviar respuesta
    await sendTextMessage(userPhone, aiResponse);

    // Actualizar historial de conversación (solo guardar últimos 10 mensajes)
    conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    );

    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, conversationHistory.length - 20);
    }

    conversationCache.set(userPhone, conversationHistory);

    // Limpiar cache después de 1 hora
    setTimeout(() => {
      conversationCache.delete(userPhone);
    }, 60 * 60 * 1000);

    console.log(`✅ Respuesta enviada a ${userPhone}`);

  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);

    // Enviar mensaje de error amigable
    await sendTextMessage(
      userPhone,
      'Disculpa, tuve un problema técnico. ¿Podrías intentar de nuevo o contactarnos directamente al +54 9 299 576-9999?'
    );
  }
}

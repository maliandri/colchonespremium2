/**
 * API Serverless del Chatbot con Gemini
 * Maneja conversaciones, captura leads y cierra ventas
 */

import { generateAIResponse, detectIntent } from '../_lib/gemini.js';
import { buscarProductos } from '../_lib/product-search.js';

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
    const { message, conversationHistory = [], sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje inválido' });
    }

    console.log(`💬 [ChatBot] Nuevo mensaje: "${message}"`);

    // Detectar intención del usuario
    const intent = detectIntent(message);
    console.log(`🎯 Intención detectada: ${intent}`);

    // Buscar productos relevantes si es necesario
    let productContext = [];
    if (intent === 'product_search' || intent === 'price_inquiry') {
      productContext = await buscarProductos(message);
      console.log(`🔍 Productos encontrados: ${productContext.length}`);
    }

    // Generar respuesta con Gemini
    const aiResponse = await generateAIResponse(
      message,
      productContext,
      conversationHistory
    );

    // Detectar si el usuario proporcionó información de contacto
    const leadData = extractLeadData(message, conversationHistory);

    // Detectar si es una intención de compra
    const isPurchaseIntent = intent === 'purchase_intent' ||
                            /comprar|pedido|orden|me lo llevo/i.test(message);

    const response = {
      message: aiResponse,
      intent,
      products: productContext.slice(0, 3), // Máximo 3 productos
      leadDetected: leadData !== null,
      leadData: leadData,
      isPurchaseIntent,
      sessionId: sessionId || generateSessionId()
    };

    console.log('✅ Respuesta generada exitosamente');
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error en el chatbot:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Disculpa, estoy teniendo problemas técnicos. Por favor, intenta nuevamente.'
    });
  }
}

/**
 * Extrae datos de contacto del lead del mensaje
 */
function extractLeadData(message, history) {
  const allMessages = [...history.map(h => h.content), message].join(' ');

  const leadData = {
    nombre: null,
    email: null,
    telefono: null,
    direccion: null,
    interes: null
  };

  // Extraer email
  const emailMatch = allMessages.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    leadData.email = emailMatch[0];
  }

  // Extraer teléfono argentino
  const phoneMatch = allMessages.match(/(?:\+54\s?)?(?:9\s?)?(?:11|\d{3,4})\s?\d{3,4}[-\s]?\d{4}/);
  if (phoneMatch) {
    leadData.telefono = phoneMatch[0].replace(/\s+/g, ' ').trim();
  }

  // Extraer nombre (después de "me llamo", "mi nombre es", "soy")
  const nombreMatch = allMessages.match(/(?:me llamo|mi nombre es|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i);
  if (nombreMatch) {
    leadData.nombre = nombreMatch[1].trim();
  }

  // Extraer dirección (mencionada con "vivo en", "dirección", "mi dirección")
  const direccionMatch = allMessages.match(/(?:vivo en|dirección|mi dirección(?:\s+es)?)[:\s]+([^.!?]+)/i);
  if (direccionMatch) {
    leadData.direccion = direccionMatch[1].trim();
  }

  // Extraer interés en productos
  const productoMatch = allMessages.match(/(?:quiero|busco|me interesa|necesito)\s+(?:un|una)?\s*([^.!?]{3,50})/i);
  if (productoMatch) {
    leadData.interes = productoMatch[1].trim();
  }

  // Verificar si tenemos al menos un dato válido
  const hasValidData = leadData.email || leadData.telefono || leadData.nombre;

  return hasValidData ? leadData : null;
}

/**
 * Genera un ID de sesión único
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

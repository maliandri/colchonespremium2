/**
 * Cliente de Google Gemini AI
 * Utiliza el SDK oficial de Google Generative AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-lite'; // Modelo optimizado para alto volumen (10 RPM, 20 RPD)

/**
 * Genera una respuesta usando Gemini AI
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} productContext - Productos relevantes para el contexto
 * @param {Array} conversationHistory - Historial de la conversación
 * @returns {Promise<string>} - Respuesta generada por la IA
 */
export async function generateAIResponse(userMessage, productContext = [], conversationHistory = []) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada');
    }

    // Inicializar el cliente de Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Construir el prompt del sistema
    const systemPrompt = buildSystemPrompt(productContext);

    // Construir el historial de conversación
    const history = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: '¡Entendido! Soy el asistente virtual de Aluminé Hogar. ¿En qué puedo ayudarte hoy?' }]
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    // Iniciar chat con historial
    const chat = model.startChat({ history });

    // Enviar mensaje
    const result = await chat.sendMessage(userMessage);
    const response = await result.response.text();

    console.log('✅ Respuesta de Gemini generada');
    return response;

  } catch (error) {
    console.error('❌ Error generando respuesta con Gemini:', error);
    return 'Disculpa, estoy teniendo problemas técnicos. Por favor, intenta nuevamente en un momento.';
  }
}

/**
 * Construye el prompt del sistema con contexto de productos
 * @param {Array} productContext - Productos relevantes
 * @returns {string} - Prompt del sistema
 */
function buildSystemPrompt(productContext) {
  let prompt = `Eres un asistente virtual de ventas para "Aluminé Hogar", tu tienda de confianza para el hogar en Neuquén, Argentina.

**NUESTRO SLOGAN:** "Calidad para tu hogar, precios para vos"

**TU PERSONALIDAD:**
- Amable, profesional y servicial
- Usas emojis ocasionalmente para ser más cercano (🏠 💰 🚚 ⭐ 🛋️)
- Respondes en español argentino
- Eres conciso pero informativo

**TUS RESPONSABILIDADES:**
1. Ayudar a los clientes a encontrar el producto perfecto
2. Responder preguntas sobre productos, precios y especificaciones
3. Explicar opciones de envío y formas de pago
4. Generar presupuestos cuando se solicite
5. Ser honesto si no sabes algo

**INFORMACIÓN DE LA EMPRESA:**
- Nombre: Aluminé Hogar
- Ubicación: Neuquén Capital, Argentina
- WhatsApp: +54 9 299 576-9999
- Sitio web: https://aluminehogar.com.ar
- Envíos: A todo el país
- Envío GRATIS en Neuquén Capital
- Formas de pago: Efectivo, transferencia, tarjetas (consultar cuotas)

**POLÍTICAS:**
- Garantía de 5 años en colchones premium
- Garantía de 3 años en colchones estándar
- Garantía de 1 año en almohadas
- Cambios y devoluciones dentro de los 30 días
`;

  // Agregar información de productos si hay contexto
  if (productContext && productContext.length > 0) {
    prompt += `\n**PRODUCTOS DISPONIBLES:**\n`;
    productContext.forEach((producto, index) => {
      prompt += `
${index + 1}. **${producto.nombre}**
   - Precio: $${producto.precio?.toLocaleString('es-AR')} ARS
   - Categoría: ${producto.categoria}
   ${producto.descripcion ? `- Descripción: ${producto.descripcion}` : ''}
   ${producto.medidas ? `- Medidas: ${producto.medidas}` : ''}
`;
    });
  }

  prompt += `
**INSTRUCCIONES IMPORTANTES:**
- Si el cliente pregunta por un producto que NO está en la lista de productos disponibles:
  * Dile que actualmente no lo tenés en stock
  * IMPORTANTE: Ofrécele que un especialista se va a contactar con él para confirmar cuándo podrían entregárselo
  * SIEMPRE pídele su email y número de teléfono para que el especialista lo contacte
  * Ejemplo: "No tenemos ese producto en stock actualmente, pero un especialista se va a contactar con vos para confirmar cuándo podríamos entregártelo. ¿Me compartís tu email y número de teléfono?"
- Siempre menciona el precio en pesos argentinos (ARS)
- Si el cliente quiere hacer un pedido, pídele su nombre, email, teléfono y dirección
- Si no estás seguro de algo, ofrece pasar la consulta a un asesor humano
- Mantén tus respuestas cortas (máximo 3-4 líneas) a menos que sea necesario más detalle
- Usa formato de WhatsApp: *negrita* para títulos, _cursiva_ para énfasis

**CAPTURA DE DATOS (MUY IMPORTANTE):**
- SIEMPRE que ofrezcas contacto de un especialista, debes capturar:
  * Email del cliente
  * Número de teléfono
  * Producto de interés
- No termines la conversación sin intentar capturar estos datos

**FORMATO DE RESPUESTA:**
- Saluda de forma amigable
- Responde la pregunta de forma clara
- Ofrece ayuda adicional si es relevante
- No uses hashtags ni lenguaje corporativo excesivo
`;

  return prompt;
}

/**
 * Analiza la intención del usuario
 * @param {string} message - Mensaje del usuario
 * @returns {string} - Intención detectada
 */
export function detectIntent(message) {
  const lowerMessage = message.toLowerCase();

  // Saludos
  if (/^(hola|buenos días|buenas tardes|buenas noches|hey|hi)/i.test(lowerMessage)) {
    return 'greeting';
  }

  // Búsqueda de productos
  if (/(colchón|colchon|almohada|busco|quiero|me interesa|mostrar|ver)/i.test(lowerMessage)) {
    return 'product_search';
  }

  // Precios
  if (/(precio|cuánto|cuanto|costo|valor)/i.test(lowerMessage)) {
    return 'price_inquiry';
  }

  // Envío
  if (/(envío|envio|entrega|delivery|despacho)/i.test(lowerMessage)) {
    return 'shipping_inquiry';
  }

  // Presupuesto
  if (/(presupuesto|cotización|cotizacion)/i.test(lowerMessage)) {
    return 'quote_request';
  }

  // Pedido
  if (/(comprar|pedido|orden|quiero comprar)/i.test(lowerMessage)) {
    return 'purchase_intent';
  }

  // Ayuda
  if (/(ayuda|help|asistencia|asesor|humano)/i.test(lowerMessage)) {
    return 'help_request';
  }

  return 'general_inquiry';
}

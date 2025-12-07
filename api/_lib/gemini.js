/**
 * Cliente de Google Gemini AI
 * Utiliza la API de Gemini para generar respuestas inteligentes
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // Modelo 2.0 Flash - más rápido y preciso

/**
 * Genera una respuesta usando Gemini AI
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} productContext - Productos relevantes para el contexto
 * @param {Array} conversationHistory - Historial de la conversación
 * @returns {Promise<string>} - Respuesta generada por la IA
 */
export async function generateAIResponse(userMessage, productContext = [], conversationHistory = []) {
  try {
    // Construir el prompt del sistema
    const systemPrompt = buildSystemPrompt(productContext);

    // Construir el historial de conversación
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    // Llamar a la API de Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error de Gemini API:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Extraer la respuesta
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text ||
                      'Lo siento, no pude generar una respuesta. ¿Podrías reformular tu pregunta?';

    console.log('✅ Respuesta de Gemini generada');
    return aiResponse;

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
- Si el cliente pregunta por un producto que no está en la lista, di que no lo tienes disponible actualmente
- Siempre menciona el precio en pesos argentinos (ARS)
- Si el cliente quiere hacer un pedido, pídele su nombre, dirección y forma de pago preferida
- Si no estás seguro de algo, ofrece pasar la consulta a un asesor humano
- Mantén tus respuestas cortas (máximo 3-4 líneas) a menos que sea necesario más detalle
- Usa formato de WhatsApp: *negrita* para títulos, _cursiva_ para énfasis

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

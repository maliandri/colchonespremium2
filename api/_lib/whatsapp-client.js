/**
 * Cliente de WhatsApp Business API (Meta Cloud API)
 * Envía mensajes a través de la API de WhatsApp
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = 'v18.0';

/**
 * Envía un mensaje de texto a WhatsApp
 * @param {string} to - Número de teléfono del destinatario (formato: 5492995769999)
 * @param {string} message - Mensaje a enviar
 * @returns {Promise<Object>} - Respuesta de la API
 */
export async function sendTextMessage(to, message) {
  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error enviando mensaje WhatsApp:', error);
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Mensaje enviado a WhatsApp:', to);
    return data;

  } catch (error) {
    console.error('❌ Error en sendTextMessage:', error);
    throw error;
  }
}

/**
 * Envía un mensaje con botones interactivos
 * @param {string} to - Número del destinatario
 * @param {string} bodyText - Texto del mensaje
 * @param {Array} buttons - Array de botones [{id, title}]
 * @returns {Promise<Object>}
 */
export async function sendButtonMessage(to, bodyText, buttons) {
  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: bodyText
          },
          action: {
            buttons: buttons.map(btn => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.title.substring(0, 20) // Máximo 20 caracteres
              }
            }))
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error enviando mensaje con botones:', error);
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Mensaje con botones enviado');
    return data;

  } catch (error) {
    console.error('❌ Error en sendButtonMessage:', error);
    throw error;
  }
}

/**
 * Envía un mensaje con lista interactiva
 * @param {string} to - Número del destinatario
 * @param {string} bodyText - Texto del mensaje
 * @param {string} buttonText - Texto del botón
 * @param {Array} sections - Secciones de la lista
 * @returns {Promise<Object>}
 */
export async function sendListMessage(to, bodyText, buttonText, sections) {
  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: bodyText
          },
          action: {
            button: buttonText,
            sections: sections
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error enviando lista:', error);
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Lista enviada');
    return data;

  } catch (error) {
    console.error('❌ Error en sendListMessage:', error);
    throw error;
  }
}

/**
 * Envía una imagen con caption
 * @param {string} to - Número del destinatario
 * @param {string} imageUrl - URL de la imagen
 * @param {string} caption - Texto del caption
 * @returns {Promise<Object>}
 */
export async function sendImageMessage(to, imageUrl, caption = '') {
  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'image',
        image: {
          link: imageUrl,
          caption: caption
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error enviando imagen:', error);
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Imagen enviada');
    return data;

  } catch (error) {
    console.error('❌ Error en sendImageMessage:', error);
    throw error;
  }
}

/**
 * Marca un mensaje como leído
 * @param {string} messageId - ID del mensaje
 * @returns {Promise<Object>}
 */
export async function markAsRead(messageId) {
  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    });

    if (!response.ok) {
      console.error('❌ Error marcando mensaje como leído');
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error en markAsRead:', error);
  }
}

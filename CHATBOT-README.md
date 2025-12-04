# Chatbot con Gemini AI - Documentación

## Descripción

Sistema completo de chatbot con inteligencia artificial usando Google Gemini que:
- ✅ Captura leads automáticamente
- ✅ Cierra ventas conversando con los clientes
- ✅ Envía los datos por email al mail de la empresa
- ✅ Busca productos en el catálogo
- ✅ Responde preguntas sobre precios, envíos y garantías
- ✅ Detecta intención de compra y ofrece contacto directo

## Estructura de Archivos Creados

```
api/
├── chatbot/
│   ├── conversacion.js       # API que procesa conversaciones con Gemini
│   └── enviar-lead.js         # API que envía leads por email

Frontend/src/
└── components/
    └── ChatBot.jsx            # Componente React del chatbot
```

## Configuración

### 1. Variables de Entorno

Agrega en tu archivo `.env`:

```bash
# Gemini AI (ya configurado)
GEMINI_API_KEY=tu_gemini_api_key

# Email (ya configurado)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_EMPRESA=info@aluminehogar.com.ar  # ← NUEVO: Email donde recibirás los leads
```

### 2. Configurar Email de la Empresa

Edita el archivo `.env` y configura `EMAIL_EMPRESA` con el email donde quieres recibir los leads:

```bash
EMAIL_EMPRESA=ventas@aluminehogar.com.ar
```

## Funcionalidades

### 1. Conversación Inteligente

El chatbot usa Gemini AI para:
- Entender preguntas en lenguaje natural
- Buscar productos relevantes automáticamente
- Responder con información precisa sobre:
  - Precios
  - Especificaciones
  - Garantías
  - Formas de pago
  - Envíos

### 2. Captura Automática de Leads

Detecta y extrae automáticamente:
- 📧 **Email**: Detecta direcciones de correo
- 📱 **Teléfono**: Detecta números argentinos (+54, 11, etc.)
- 👤 **Nombre**: Extrae cuando el usuario dice "me llamo...", "mi nombre es...", "soy..."
- 📍 **Dirección**: Detecta cuando menciona "vivo en...", "mi dirección..."
- 🎯 **Interés**: Identifica productos o servicios que menciona

### 3. Envío Automático por Email

Cuando se detecta un lead, automáticamente:
1. Captura todos los datos disponibles
2. Genera un email HTML profesional
3. Lo envía al `EMAIL_EMPRESA` configurado
4. Incluye resumen de la conversación
5. Agrega botón para contactar por WhatsApp
6. Marca como "REQUIERE SEGUIMIENTO"

### 4. Detección de Intención de Compra

Identifica cuando el usuario:
- Quiere comprar
- Está listo para hacer un pedido
- Necesita un presupuesto
- Quiere hablar con un asesor

Y ofrece contacto directo por WhatsApp.

## Ejemplos de Uso

### Conversación Típica 1: Búsqueda de Producto

```
Usuario: Hola, busco un colchón matrimonial
Bot: ¡Hola! 👋 Te puedo ayudar con eso. ¿Buscas algo específico?
     ¿Prefieres espuma, resortes o híbrido?

[Muestra productos relevantes]

Usuario: El de resortes me interesa, cuánto sale?
Bot: El Colchón Premium Resortes 2 plazas cuesta $185,000 ARS...
```

### Conversación Típica 2: Captura de Lead

```
Usuario: Me interesa el colchón
Bot: ¡Excelente elección! ¿Querés que te prepare un presupuesto?

Usuario: Sí, mi nombre es Juan Pérez y mi email es juan@gmail.com
Bot: Perfecto Juan! Ya tengo tus datos. ¿Cuál es tu dirección
     para calcular el envío?

[El sistema automáticamente envía el lead por email]
```

### Conversación Típica 3: Cierre de Venta

```
Usuario: Quiero comprarlo, cómo hago?
Bot: ¡Perfecto! 🎉 Te paso con un asesor para finalizar tu compra.

[Botón: 💬 Contactar por WhatsApp]
```

## Email de Lead

Cuando se captura un lead, se envía un email con:

### Información Incluida:
- 👤 Nombre del cliente
- 📧 Email
- 📱 Teléfono
- 📍 Dirección
- 🎯 Producto de interés
- 💬 Resumen de la conversación (últimos 5 mensajes)
- 🆔 ID de sesión para tracking
- ⏰ Fecha y hora de captura

### Diseño del Email:
- Header con degradado morado
- Información organizada por secciones
- Botón directo para contactar por WhatsApp
- Badge de "REQUIERE SEGUIMIENTO"
- Responsive y profesional

## Personalización

### Modificar Personalidad del Bot

Edita [api/_lib/gemini.js](api/_lib/gemini.js:93) en la función `buildSystemPrompt`:

```javascript
let prompt = `Eres un asistente virtual de ventas para "Aluminé Hogar"...
**TU PERSONALIDAD:**
- Amable, profesional y servicial
- Usas emojis ocasionalmente...
```

### Cambiar Mensaje de Bienvenida

Edita [Frontend/src/components/ChatBot.jsx](Frontend/src/components/ChatBot.jsx:45):

```javascript
{
  role: 'assistant',
  content: '¡Hola! 👋 Soy el asistente virtual de Aluminé Hogar...',
  timestamp: new Date()
}
```

### Ajustar Detección de Leads

Edita [api/chatbot/conversacion.js](api/chatbot/conversacion.js:65) en la función `extractLeadData`:

```javascript
function extractLeadData(message, history) {
  // Modifica las expresiones regulares aquí
  const emailMatch = allMessages.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = allMessages.match(/(?:\+54\s?)?(?:9\s?)?(?:11|\d{3,4})\s?\d{3,4}[-\s]?\d{4}/);
  // ...
}
```

## API Endpoints

### POST `/api/chatbot/conversacion`

Procesa un mensaje del usuario y devuelve la respuesta del bot.

**Request:**
```json
{
  "message": "Busco un colchón",
  "conversationHistory": [],
  "sessionId": "session_123456"
}
```

**Response:**
```json
{
  "message": "¡Hola! Te puedo ayudar a encontrar el colchón perfecto...",
  "intent": "product_search",
  "products": [...],
  "leadDetected": false,
  "leadData": null,
  "isPurchaseIntent": false,
  "sessionId": "session_123456"
}
```

### POST `/api/chatbot/enviar-lead`

Envía un lead capturado por email.

**Request:**
```json
{
  "leadData": {
    "nombre": "Juan Pérez",
    "email": "juan@gmail.com",
    "telefono": "+54 9 11 1234-5678",
    "direccion": "Neuquén Capital",
    "interes": "Colchón matrimonial"
  },
  "conversationSummary": [...],
  "sessionId": "session_123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead enviado exitosamente"
}
```

## Testing

### Probar el Chatbot Localmente

1. Inicia el frontend:
```bash
cd Frontend
npm run dev
```

2. Abre el navegador en `http://localhost:5173`
3. Busca el botón flotante morado en la esquina inferior derecha
4. Haz clic y comienza a chatear

### Probar Captura de Leads

Envía estos mensajes en orden:

1. "Hola, busco un colchón"
2. "Me llamo Juan Pérez"
3. "Mi email es juan@gmail.com"
4. "Mi teléfono es 299 123 4567"

Deberías recibir un email en `EMAIL_EMPRESA`.

## Despliegue en Vercel

Las funciones serverless ya están listas para Vercel:

```bash
# Desplegar
vercel --prod

# Configurar variables de entorno en Vercel
vercel env add EMAIL_EMPRESA
```

Las rutas automáticamente disponibles:
- `https://tu-dominio.com/api/chatbot/conversacion`
- `https://tu-dominio.com/api/chatbot/enviar-lead`

## Características Técnicas

### Frontend
- ⚛️ React 18
- 🎨 Tailwind CSS
- 🔄 Axios para HTTP requests
- 📱 Responsive design
- ♿ Accesible (ARIA labels)

### Backend
- 🚀 Vercel Serverless Functions
- 🤖 Google Gemini 1.5 Flash
- 📧 Nodemailer para emails
- 🔍 Búsqueda inteligente de productos
- 🛡️ CORS configurado

## Monitoreo

### Logs del Chatbot

Vercel Logs mostrará:
```
💬 [ChatBot] Nuevo mensaje: "busco un colchón"
🎯 Intención detectada: product_search
🔍 Productos encontrados: 3
✅ Respuesta generada exitosamente
```

### Logs de Leads

```
📧 [Lead] Enviando lead capturado por chatbot: { nombre: "Juan", email: "..." }
✅ Lead enviado exitosamente
```

## Troubleshooting

### El bot no responde
- Verifica que `GEMINI_API_KEY` esté configurado
- Revisa los logs de Vercel
- Verifica que la API de Gemini esté activa

### No llegan emails de leads
- Verifica `EMAIL_EMPRESA` en las variables de entorno
- Verifica `EMAIL_USER` y `EMAIL_PASS`
- Revisa la configuración de nodemailer

### Productos no se muestran
- Verifica que [api/_lib/product-search.js](api/_lib/product-search.js) esté funcionando
- Revisa la conexión a MongoDB

## Próximas Mejoras Sugeridas

- [ ] Guardar leads en MongoDB
- [ ] Dashboard para ver conversaciones
- [ ] Métricas de conversión
- [ ] Integración con CRM
- [ ] Respuestas con imágenes de productos
- [ ] Sugerencias de productos relacionados
- [ ] Modo offline con respuestas predefinidas

## Soporte

Si necesitas ayuda, contacta a tu desarrollador o revisa:
- [Documentación de Gemini AI](https://ai.google.dev/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Nodemailer](https://nodemailer.com/)

---

**Desarrollado con ❤️ usando Claude Code y Google Gemini AI**

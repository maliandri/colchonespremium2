# 🤖 Guía: WhatsApp Business + IA con Gemini

**Estado:** ⚙️ Código listo - Requiere configuración

## ¿Qué hace este sistema?

Un agente de IA que atiende automáticamente mensajes de WhatsApp Business, puede:
- ✅ Responder consultas sobre productos
- ✅ Buscar productos en tu base de datos MongoDB
- ✅ Mostrar precios en tiempo real
- ✅ Generar presupuestos
- ✅ Responder sobre envíos y garantías
- ✅ Conversar de forma natural en español

---

## 📋 PASO 1: Obtener API Key de Google Gemini (5 minutos)

### 1.1 Ir a Google AI Studio
1. Ve a: https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google

### 1.2 Crear API Key
1. Click en **"Create API Key"**
2. Selecciona un proyecto o crea uno nuevo
3. **COPIA EL API KEY** (empez con `AIza...`)

### 1.3 Guardar el API Key
```
GEMINI_API_KEY=AIzaSy... (tu key aquí)
```

**Nota:** Es GRATIS hasta 60 requests/minuto

---

## 📋 PASO 2: Configurar WhatsApp Business API (20-30 minutos)

### 2.1 Crear App en Meta for Developers
1. Ve a: https://developers.facebook.com/apps
2. Click en **"Crear app"**
3. Tipo: **"Empresa"**
4. Nombre: `Aluminé Hogar WhatsApp`
5. Email de contacto

### 2.2 Agregar WhatsApp Product
1. En tu app, busca **"WhatsApp"**
2. Click en **"Configurar"**
3. Selecciona tu **Business Account**

### 2.3 Obtener credenciales

**Phone Number ID:**
1. En WhatsApp → **Inicio rápido**
2. Copia el **"Phone Number ID"** (número largo)

**Access Token:**
1. Mismo lugar, copia el **"Temporary access token"**
2. (Luego crearás uno permanente)

### 2.4 Crear Token Permanente (Opcional pero recomendado)
1. Ve a **Herramientas** → **Tokens de acceso**
2. Genera un token que **nunca expire**
3. Permisos: `whatsapp_business_messaging`, `whatsapp_business_management`

### 2.5 Configurar Webhook
1. En WhatsApp → **Configuración** → **Webhook**
2. Click en **"Editar"**
3. **Callback URL:** `https://aluminehogar.com.ar/api/whatsapp`
4. **Verify Token:** `alumine_hogar_2024` (o el que prefieras)
5. **Webhook Fields:** Selecciona `messages`
6. Click en **"Verificar y guardar"**

---

## 📋 PASO 3: Configurar Variables de Entorno en Vercel

### 3.1 Ir a Vercel Dashboard
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto: **colchonespremium2**

### 3.2 Agregar Variables de Entorno
1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

```env
# Google Gemini AI
GEMINI_API_KEY=AIzaSy... (tu key de Gemini)

# WhatsApp Business API
WHATSAPP_TOKEN=EAAxxxxxxx... (tu access token de Meta)
WHATSAPP_PHONE_NUMBER_ID=123456789 (tu Phone Number ID)
WHATSAPP_VERIFY_TOKEN=alumine_hogar_2024

# MongoDB (ya lo tienes)
MONGODB_URI=mongodb+srv://...
```

### 3.3 Redeploy
1. Ve a **Deployments**
2. Click en los `...` del último deployment
3. **"Redeploy"**

---

## 📋 PASO 4: Configurar Número de WhatsApp Business

### 4.1 Número de Teléfono
- **NO puedes usar** tu número personal actual
- **Necesitas** un número nuevo dedicado para el bot
- **Opciones:**
  - Comprar un número nuevo (chip prepago)
  - Usar un número fijo con WhatsApp Business

### 4.2 Agregar Número a Meta
1. En WhatsApp → **Números de teléfono**
2. Click en **"Agregar número de teléfono"**
3. Ingresa el número
4. **Verificar con código SMS**

### 4.3 Migrar de Número de Prueba a Producción
1. Meta te da un número de prueba inicialmente
2. Solo funciona con 5 números autorizados
3. **Para producción:** Agrega tu propio número verificado

---

## 📋 PASO 5: Probar el Bot

### 5.1 Agregar Número de Prueba
1. En WhatsApp → **Números de teléfono**
2. **"Agregar número de prueba"**
3. Ingresa tu número personal

### 5.2 Enviar Mensaje de Prueba
1. Abre WhatsApp en tu teléfono
2. Envía un mensaje al número del bot
3. Deberías recibir respuesta automática

### 5.3 Ejemplos de Mensajes para Probar

```
Hola
Busco un colchón de 2 plazas
¿Cuánto cuesta el colchón premium?
Hacen envíos a Bariloche?
Dame un presupuesto
```

---

## 📋 PASO 6: Verificar que Funciona

### 6.1 Ver Logs en Vercel
1. Ve a Vercel → **Deployments**
2. Click en el deployment activo
3. Ve a **Functions**
4. Click en `/api/whatsapp`
5. Verás los logs en tiempo real

### 6.2 Ver Eventos en Meta
1. Ve a tu App en developers.facebook.com
2. **WhatsApp** → **Webhooks**
3. Verás los eventos recibidos

---

## 🔧 Archivos Creados

### API Routes:
```
api/whatsapp.js - Webhook principal (TODO EN UNO)
```

### Librerías:
```
api/_lib/gemini.js - Cliente Gemini AI
api/_lib/whatsapp-client.js - Cliente WhatsApp API
api/_lib/product-search.js - Búsqueda de productos
```

---

## 💰 Costos Estimados

### Google Gemini:
- **GRATIS**: Hasta 60 requests/minuto
- **Pago** (si excedes): ~$0.35 por millón de tokens

### WhatsApp Business API:
- **GRATIS**: Primeras 1000 conversaciones/mes
- **Pago**: ~$0.10 USD por conversación adicional

### Total estimado: **$0-20 USD/mes**

---

## 🎯 Funcionalidades del Bot

El bot puede:
1. ✅ Saludar y presentarse
2. ✅ Buscar productos por categoría (colchones, almohadas)
3. ✅ Mostrar precios en tiempo real
4. ✅ Responder sobre envíos
5. ✅ Generar presupuestos
6. ✅ Responder especificaciones técnicas
7. ✅ Recordar contexto de conversación

---

## 🐛 Solución de Problemas

### Bot no responde

**1. Verificar variables de entorno:**
```bash
# En Vercel, revisa que todas las variables estén configuradas
```

**2. Verificar webhook:**
- URL debe ser HTTPS
- Debe responder con el challenge en GET
- Debe devolver 200 OK en POST

**3. Ver logs:**
- Vercel → Functions → `/api/whatsapp`
- Busca errores en rojo

### Bot responde "Disculpa, tuve un problema técnico"

**Posibles causas:**
1. GEMINI_API_KEY incorrecta
2. MongoDB no conecta
3. Error en búsqueda de productos

**Solución:**
- Ver logs en Vercel
- Verificar que MongoDB URI esté correcto

---

## 📞 Próximos Pasos

Una vez configurado:

1. **Prueba exhaustiva**: Haz muchas preguntas para entrenar el bot
2. **Ajusta el prompt**: Edita `api/_lib/gemini.js` para personalizar respuestas
3. **Agrega más funciones**: Registrar ventas, seguimiento de pedidos, etc.
4. **Pasa a producción**: Agrega tu número real de WhatsApp Business

---

## 🎉 ¡Listo!

Una vez configurado todo, tu bot estará activo 24/7 respondiendo consultas automáticamente.

**¿Dudas?** Revisa los logs en Vercel o el webhook en Meta.

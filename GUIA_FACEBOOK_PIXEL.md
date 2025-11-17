# 🎯 Facebook Pixel - CONFIGURADO ✅

**Pixel ID:** 879838197733539
**Estado:** Integrado y funcionando

## ¿Qué es el Facebook Pixel?

El Facebook Pixel es un código que rastrea las acciones de los visitantes en tu sitio web:
- Ver productos
- Agregar al carrito
- Iniciar compra (mensaje por WhatsApp)
- Ver categorías

Esto te permite:
- Crear anuncios de remarketing (mostrar anuncios a quienes visitaron tu sitio)
- Medir conversiones
- Optimizar anuncios
- Crear audiencias personalizadas

---

## ✅ INTEGRACIÓN COMPLETADA

El Facebook Pixel ya está instalado y configurado en tu sitio con los siguientes eventos:

### Eventos Configurados:
1. **PageView** - Se dispara automáticamente en cada página
2. **ViewContent** - Cuando un usuario ve un producto específico
3. **AddToCart** - Cuando un usuario agrega un producto al carrito
4. **InitiateCheckout** - Cuando un usuario abre el carrito
5. **Contact** - Cuando un usuario hace clic en WhatsApp (botón flotante, desde producto, o desde carrito)

### Archivos Modificados:
- `Frontend/src/components/FacebookPixel.jsx` - Componente principal
- `Frontend/src/utils/facebookPixel.js` - Utilidades de tracking
- `Frontend/src/App.jsx` - Inicialización del pixel
- `Frontend/src/pages/ProductDetail.jsx` - Tracking ViewContent y Contact
- `Frontend/src/store/cartStore.jsx` - Tracking AddToCart
- `Frontend/src/components/CartModal.jsx` - Tracking InitiateCheckout y Contact
- `Frontend/src/components/WhatsAppButton.jsx` - Tracking Contact
- `.env.example`, `.env.production`, `.env.local` - Variable VITE_FACEBOOK_PIXEL_ID

---

## 📋 PASO 1: Crear el Pixel (10 minutos) - ✅ COMPLETADO

### 1.1 Ir a Eventos de Meta
1. Ve a: https://business.facebook.com/events_manager
2. Click en **"Conectar orígenes de datos"** o **"Agregar"**
3. Selecciona: **"Web"**
4. Click en **"Conectar"**

### 1.2 Configurar el Pixel
```
Nombre del pixel: Aluminé Hogar
Sitio web: https://aluminehogar.com.ar
```

### 1.3 Elegir método de instalación
Selecciona: **"Agregar código manualmente"**

### 1.4 Copiar el Pixel ID
Verás algo como:
```
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'TU_PIXEL_ID_AQUI'); // ← Este es tu Pixel ID
fbq('track', 'PageView');
</script>
<!-- End Meta Pixel Code -->
```

**COPIA el número del Pixel ID** (ejemplo: `123456789012345`)

---

## 📝 PASO 2: Dame tu Pixel ID

Una vez que tengas tu **Pixel ID**, dímelo y yo:

1. ✅ Crearé el componente de Facebook Pixel
2. ✅ Lo integraré en tu sitio
3. ✅ Configuraré los eventos automáticos:
   - `PageView` - Ver cualquier página
   - `ViewContent` - Ver producto específico
   - `AddToCart` - Agregar producto al carrito
   - `InitiateCheckout` - Abrir modal de carrito
   - `Contact` - Click en WhatsApp

---

## 🔧 PASO 3: Verificar que funciona

Una vez instalado:

### 3.1 Instalar Facebook Pixel Helper
1. Instala la extensión: [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Ve a tu sitio: https://aluminehogar.com.ar
3. Click en el ícono de la extensión
4. Debería mostrar: ✅ Pixel encontrado

### 3.2 Probar eventos
1. Ve a tu sitio
2. Click en un producto → Debería disparar `ViewContent`
3. Agregar al carrito → Debería disparar `AddToCart`
4. Abrir carrito → Debería disparar `InitiateCheckout`
5. Click en WhatsApp → Debería disparar `Contact`

### 3.3 Ver en tiempo real
1. Ve a: https://business.facebook.com/events_manager
2. Click en tu Pixel
3. Pestaña: **"Eventos de prueba"**
4. Verás los eventos en tiempo real

---

## 📊 EVENTOS QUE VOY A CONFIGURAR

### 1. PageView (Automático)
- Se dispara en cada página
- No requiere configuración adicional

### 2. ViewContent (Ver producto)
```javascript
fbq('track', 'ViewContent', {
  content_ids: ['COL-0001'],
  content_type: 'product',
  content_name: 'Colchón Premium 2 plazas',
  content_category: 'Colchones',
  value: 89990,
  currency: 'ARS'
});
```

### 3. AddToCart (Agregar al carrito)
```javascript
fbq('track', 'AddToCart', {
  content_ids: ['COL-0001'],
  content_name: 'Colchón Premium 2 plazas',
  content_type: 'product',
  value: 89990,
  currency: 'ARS'
});
```

### 4. InitiateCheckout (Abrir carrito)
```javascript
fbq('track', 'InitiateCheckout', {
  content_ids: ['COL-0001', 'ALM-0002'],
  num_items: 3,
  value: 150000,
  currency: 'ARS'
});
```

### 5. Contact (Click en WhatsApp)
```javascript
fbq('track', 'Contact', {
  content_name: 'WhatsApp Checkout',
  value: 150000,
  currency: 'ARS'
});
```

---

## ⚙️ CONFIGURACIÓN TÉCNICA

### Estructura de archivos que crearé:

```
Frontend/src/
├── utils/
│   └── facebookPixel.js     ← Funciones del Pixel
├── hooks/
│   └── useFacebookPixel.js  ← Hook de React
└── components/
    └── FacebookPixel.jsx    ← Componente principal
```

### Integración en App.jsx:
```jsx
import { FacebookPixel } from './components/FacebookPixel';

function App() {
  return (
    <>
      <FacebookPixel pixelId="TU_PIXEL_ID" />
      {/* Resto de la app */}
    </>
  );
}
```

---

## 🎯 PRÓXIMOS PASOS

### Tú haces:
1. ✅ Ir a Meta Events Manager
2. ✅ Crear Pixel para "aluminehogar.com.ar"
3. ✅ Copiar el Pixel ID (número de 15 dígitos)
4. ✅ Enviarme el Pixel ID

### Yo haré:
1. ✅ Crear componente de Facebook Pixel
2. ✅ Integrar en el sitio
3. ✅ Configurar todos los eventos
4. ✅ Agregar a variables de entorno
5. ✅ Hacer deploy

---

## 💡 BENEFICIOS

Una vez configurado:

### 1. Remarketing
- Mostrar anuncios a quienes vieron productos pero no compraron
- Mostrar anuncios a quienes agregaron al carrito pero no finalizaron

### 2. Audiencias Similares (Lookalike)
- Facebook encuentra personas similares a tus clientes
- Mejora el targeting de anuncios

### 3. Optimización de Anuncios
- Facebook optimiza para conversiones
- Mejor ROI (retorno de inversión)

### 4. Medición Precisa
- Saber cuántas ventas genera cada anuncio
- Calcular costo por adquisición

---

## 🆘 PREGUNTAS FRECUENTES

### ¿Es gratis?
Sí, el Pixel es completamente gratuito. Solo pagas por los anuncios.

### ¿Afecta la velocidad del sitio?
No, el Pixel se carga de forma asíncrona y no afecta el rendimiento.

### ¿Funciona con WhatsApp checkout?
Sí, dispararemos el evento `Contact` cuando el usuario haga click en WhatsApp.

### ¿Cuánto tarda en activarse?
Una vez instalado, empieza a funcionar inmediatamente. Los datos históricos se acumulan desde ese momento.

---

## 📞 DAME TU PIXEL ID

Cuando tengas tu Pixel ID, envíamelo y en 15 minutos tendrás todo configurado! 🚀

Formato del Pixel ID: `123456789012345` (15 dígitos)

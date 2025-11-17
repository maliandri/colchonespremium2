# 🛍️ Guía Paso a Paso: Configurar Facebook Shop para Aluminé Hogar

## ✅ Lo que ya está listo:

- ✅ Catálogo de productos en MongoDB
- ✅ Feed XML generado automáticamente: `/api/catalog-feed.xml`
- ✅ Imágenes optimizadas en Cloudinary
- ✅ Botón de WhatsApp en el sitio

---

## 📱 PASO 1: Crear Página de Facebook (10 minutos)

### 1.1 Ir a crear página
1. Abre Facebook en tu navegador
2. Ve a: https://www.facebook.com/pages/create
3. O en el menú de Facebook → Páginas → Crear nueva página

### 1.2 Configurar la página
```
Nombre de la página: Aluminé Hogar
Categoría: Tienda de muebles para el hogar
Bio/Descripción:
  "Colchones y almohadas premium en Neuquén.
   Calidad, confort y los mejores precios.
   Envíos a todo el país 🚚
   WhatsApp: +54 9 299 576-9999"

Foto de perfil: Logo de Aluminé Hogar
Foto de portada: Imagen de tus productos o tienda
```

### 1.3 Completar información
- Agregar dirección: Neuquén, Argentina
- Agregar teléfono: +54 9 299 576-9999
- Agregar sitio web: https://colchonqn2.netlify.app
- Agregar horarios de atención

---

## 🏢 PASO 2: Crear Meta Business Suite (15 minutos)

### 2.1 Acceder a Business Suite
1. Ve a: https://business.facebook.com
2. Click en "Crear cuenta"
3. Ingresa:
   - Nombre del negocio: **Aluminé Hogar**
   - Tu nombre
   - Tu email de trabajo

### 2.2 Conectar tu Página
1. En el menú → "Páginas"
2. Click en "Agregar página"
3. Selecciona la página que creaste: "Aluminé Hogar"
4. Click en "Agregar página"

---

## 🛒 PASO 3: Crear Catálogo de Commerce (20 minutos)

### 3.1 Ir a Commerce Manager
1. Ve a: https://business.facebook.com/commerce
2. O en Meta Business Suite → Commerce Manager
3. Click en "Crear catálogo"

### 3.2 Configurar catálogo
```
Tipo de catálogo: E-commerce
Nombre del catálogo: Aluminé Hogar - Productos
Propietario del catálogo: Tu cuenta de negocio
```

### 3.3 Configurar información comercial
```
País: Argentina
Moneda: ARS (Peso argentino)
Formato de fecha: DD/MM/YYYY
```

### 3.4 Agregar política de devoluciones

**Opción 1: Usar esta plantilla**
```
POLÍTICA DE DEVOLUCIONES - ALUMINÉ HOGAR

Aceptamos devoluciones dentro de los 30 días posteriores a la compra.

Condiciones:
- El producto debe estar sin uso y en su embalaje original
- Se debe presentar el comprobante de compra
- Los gastos de envío de devolución corren por cuenta del cliente

Para solicitar una devolución, contactanos por WhatsApp al +54 9 299 576-9999

Reembolsos:
- Se procesarán dentro de 7 días hábiles tras recibir el producto
- El reembolso se realizará por el mismo medio de pago utilizado

Contacto: +54 9 299 576-9999
```

**Opción 2:** Si ya tienes una, guárdala en un archivo .txt

---

## 📦 PASO 4: Subir Productos al Catálogo (5 minutos)

### 4.1 Seleccionar método de carga
En Commerce Manager → Tu catálogo → Agregar productos:
- Selecciona: **"Data feed (Scheduled Fetch)"**

### 4.2 Configurar el feed
```
Nombre del feed: Productos Aluminé Hogar
Tipo de feed: Productos

URL del feed:
👉 https://colchonqn2.netlify.app/api/catalog-feed.xml

Frecuencia de actualización: Cada 24 horas
Horario: 02:00 AM (hora local)
```

### 4.3 Validar feed
1. Click en "Fetch Now" para probar la descarga
2. Espera 2-5 minutos
3. Verifica que los productos se cargaron correctamente
4. Si hay errores, revisa el diagnóstico

---

## 🏪 PASO 5: Activar Facebook Shop (10 minutos)

### 5.1 Configurar checkout
En Commerce Manager → Configuración de tienda:

```
Método de checkout: Mensaje
Destino de mensajes: WhatsApp

Número de WhatsApp: +54 9 299 576-9999
```

### 5.2 Personalizar tienda
1. Diseño → Selecciona diseño de cuadrícula
2. Colecciones → Crear colecciones por categoría:
   - Colchones
   - Almohadas
   - Sommiers
   - Ropa de cama

### 5.3 Activar sección "Shop" en Facebook
1. Ve a tu Página de Facebook
2. Configuración → Plantillas y pestañas
3. Activa "Shop"
4. Conecta el catálogo que creaste

---

## 📱 PASO 6: Instagram Shopping (OPCIONAL - 30 min)

### 6.1 Requisitos
- Tener cuenta de Instagram
- Convertir a cuenta Business/Creator
- Conectar a tu Página de Facebook

### 6.2 Convertir a Business
1. Abre Instagram
2. Configuración → Cuenta → Cambiar tipo de cuenta
3. Selecciona "Cuenta Business"
4. Conecta tu Página de Facebook "Aluminé Hogar"

### 6.3 Solicitar acceso a Shopping
1. Instagram → Configuración → Empresa → Shopping
2. Conecta catálogo de productos
3. Enviar para revisión (tarda 1-3 días)

---

## ✅ VERIFICACIÓN FINAL

### Checklist de completado:

- [ ] Página de Facebook creada y publicada
- [ ] Meta Business Suite configurada
- [ ] Catálogo creado en Commerce Manager
- [ ] Feed XML conectado y funcionando
- [ ] Productos cargados correctamente (sin errores)
- [ ] Política de devoluciones agregada
- [ ] Checkout configurado (Mensaje → WhatsApp)
- [ ] Facebook Shop activado
- [ ] Colecciones creadas
- [ ] Instagram convertido a Business (opcional)

---

## 🎯 PRUEBA TU TIENDA

### En Facebook:
1. Ve a tu Página de Facebook
2. Click en pestaña "Shop"
3. Deberías ver tus productos
4. Click en un producto → "Enviar mensaje"
5. Debería abrir WhatsApp con mensaje pre-llenado

### URL de tu tienda:
```
Facebook Shop:
https://www.facebook.com/[nombre-de-tu-pagina]/shop

Cuando esté lista, compárteme el link!
```

---

## 🆘 PROBLEMAS COMUNES

### "No puedo agregar productos"
- Verifica que el feed esté en formato correcto
- Revisa diagnóstico de errores en Commerce Manager
- Asegúrate que las imágenes sean >500px

### "Productos rechazados"
- Títulos demasiado largos (máx 150 caracteres)
- Descripciones demasiado largas (máx 5000 caracteres)
- Imágenes de baja calidad
- Links rotos

### "No aparece la pestaña Shop"
- Ve a Configuración de Página → Plantillas y pestañas
- Activa manualmente "Shop"
- Conecta el catálogo

---

## 📞 PRÓXIMOS PASOS

Una vez configurado todo:

1. **Compárteme:**
   - Link de tu Página de Facebook
   - Captura de tu tienda funcionando

2. **Yo te ayudaré a:**
   - Optimizar títulos/descripciones
   - Crear anuncios dinámicos
   - Configurar Facebook Pixel (tracking)
   - Mejorar el feed

3. **Opcional:**
   - Crear política de privacidad
   - Crear términos y condiciones
   - Configurar Instagram Shopping

---

## 🎉 ¡TODO LISTO!

Tu catálogo se actualizará automáticamente cada 24 horas desde MongoDB.

Cuando agregues/modifiques productos en tu base de datos, se reflejarán
automáticamente en Facebook/Instagram al día siguiente.

**URL del feed:** https://colchonqn2.netlify.app/api/catalog-feed.xml

¡Éxitos con tu tienda en Facebook! 🚀
